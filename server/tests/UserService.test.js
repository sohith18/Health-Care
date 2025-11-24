import { jest } from "@jest/globals";

await jest.unstable_mockModule("../models/User.js", () => ({
  User: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  }
}));

await jest.unstable_mockModule("../models/Slot.js", () => ({
  default: {
    find: jest.fn()
  }
}));

const mockDecode = jest.fn();
await jest.unstable_mockModule("jwt-decode", () => ({
  jwtDecode: mockDecode
}));

const mockHash = jest.fn().mockResolvedValue("hashed_pw");
await jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mockHash
  }
}));

const { User } = await import("../models/User.js");
const Slot = (await import("../models/Slot.js")).default;
const bcrypt = (await import("bcrypt")).default;
const { getUser, updateUser } = await import("../services/UserService.js");

describe("UserService.js", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return 500 if no token", async () => {
    const res = await getUser(null);
    expect(res.status).toBe(500);
    expect(res.msg).toBe("No token provided");
  });

  test("should return 404 when user not found", async () => {
    mockDecode.mockReturnValue({ _id: "U1" });
    User.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    const res = await getUser("abc-token");
    expect(res.status).toBe(404);
    expect(res.user).toBeNull();
  });

  test("should populate doctor slots", async () => {
    mockDecode.mockReturnValue({ _id: "D1" });

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "D1",
        role: "DOCTOR",
        slots: ["S1", "S2"]
      })
    });

    Slot.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([{ _id: "S1" }, { _id: "S2" }])
    });

    const res = await getUser("valid");
    expect(res.status).toBe(200);
    expect(res.user.slots.length).toBe(2);
  });

  test("should return user as-is for non-doctor", async () => {
    mockDecode.mockReturnValue({ _id: "P1" });

    User.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "P1",
        role: "PATIENT",
        slots: []
      })
    });

    const res = await getUser("valid");
    expect(res.status).toBe(200);
    expect(res.user.role).toBe("PATIENT");
  });

  test("should return 400 if _id missing", async () => {
    const res = await updateUser({});
    expect(res.status).toBe(400);
    expect(res.msg).toBe("Missing user _id");
  });

  test("should hash password when updating user", async () => {
    User.findOneAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        _id: "U1",
        name: "test",
        password: "hashed_pw"
      })
    });

    const res = await updateUser({ _id: "U1", password: "pass123" });

    expect(mockHash).toHaveBeenCalledWith("pass123", 10);
    expect(res.status).toBe(200);
  });

  test("should return 404 if no updated doc", async () => {
    User.findOneAndUpdate.mockReturnValue({
      lean: jest.fn().mockResolvedValue(null)
    });

    const res = await updateUser({ _id: "BAD" });
    expect(res.status).toBe(404);
  });

});
