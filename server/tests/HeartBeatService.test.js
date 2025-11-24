import { jest } from "@jest/globals";

await jest.unstable_mockModule("../models/Meet.js", () => ({
  default: {
    findOne: jest.fn(),
    find: jest.fn()
  }
}));

await jest.unstable_mockModule("../services/UserService.js", () => ({
  getUser: jest.fn()
}));

await jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign: jest.fn() }
}));

const Meet = (await import("../models/Meet.js")).default;
const { getUser } = await import("../services/UserService.js");
const jwt = (await import("jsonwebtoken")).default;

const Role = (await import("../enums/Role.js")).default;
const { getHeartBeat, rejectHeartBeat } = await import("../services/HeartBeatService.js"); // adjust name if file differs

// Mock env
process.env.SECRET_MEET_TOKEN = "SECRET";
process.env.API_KEY = "API123";

describe("HeartBeatService", () => {
  const token = "VALID_TOKEN";

  beforeEach(() => jest.clearAllMocks());

  describe("getHeartBeat()", () => {
    test("should return error when user unauthorized", async () => {
      getUser.mockResolvedValue({ status: 401 });

      const res = await getHeartBeat(token);
      expect(res.status).toBe(401);
    });

    test("should return 404 when user is not a doctor", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.PATIENT }
      });

      const res = await getHeartBeat(token);
      expect(res.status).toBe(404);
    });

    test("should return existing pending meet", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "DOC1", role: Role.DOCTOR }
      });

      Meet.findOne.mockResolvedValue({
        _id: "CALL123",
        specialization: "Cardiology",
        status: "pending"
      });

      jwt.sign.mockReturnValue("JWT_TOKEN");

      const res = await getHeartBeat(token);

      expect(res.status).toBe(200);
      expect(res.callId).toBe("CALL123");
      expect(jwt.sign).toHaveBeenCalled();
    });

    test("should match next meeting in specialization list", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: {
          _id: "DOC1",
          role: Role.DOCTOR,
          specializations: ["Dermatology", "ENT"]
        }
      });

      Meet.findOne.mockResolvedValue(null);

      Meet.find.mockResolvedValueOnce([
        { _id: "M1", specialization: "Dermatology", rejectedBy: ["DOC1"] }
      ]);

      Meet.find.mockResolvedValueOnce([
        { _id: "M2", specialization: "ENT", rejectedBy: [] }
      ]);

      jwt.sign.mockReturnValue("TOKEN2");

      const res = await getHeartBeat(token);

      expect(res.status).toBe(200);
      expect(res.callId).toBe("M2");
      expect(res.specialization).toBe("ENT");
      expect(jwt.sign).toHaveBeenCalled();
    });

    test("should return no meeting if none available", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "DOC1", role: Role.DOCTOR, specializations: [] }
      });

      Meet.findOne.mockResolvedValue(null);

      const res = await getHeartBeat(token);
      expect(res.msg).toBe("No meetings scheduled");
    });
  });

  describe("rejectHeartBeat()", () => {
    test("should return error if unauthorized", async () => {
      getUser.mockResolvedValue({ status: 403 });

      const res = await rejectHeartBeat(token, "CALL123");
      expect(res.status).toBe(403);
    });

    test("should return 404 if user is not a doctor", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.PATIENT }
      });

      const res = await rejectHeartBeat(token, "CALL123");
      expect(res.status).toBe(404);
    });

    test("should return 400 if callId missing", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.DOCTOR }
      });

      const res = await rejectHeartBeat(token);
      expect(res.status).toBe(400);
    });

    test("should return 404 if meet not found", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.DOCTOR }
      });

      Meet.findOne.mockResolvedValue(null);

      const res = await rejectHeartBeat(token, "CALL123");
      expect(res.status).toBe(404);
    });

    test("should successfully reject and update meeting", async () => {
      const mockSave = jest.fn();

      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "DOC1", role: Role.DOCTOR }
      });

      Meet.findOne.mockResolvedValue({
        _id: "CALL123",
        rejectedBy: [],
        save: mockSave
      });

      const res = await rejectHeartBeat(token, "CALL123");

      expect(res.status).toBe(200);
      expect(mockSave).toHaveBeenCalled();
    });

    test("should NOT add duplicate rejection", async () => {
      const mockSave = jest.fn();

      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "DOC1", role: Role.DOCTOR }
      });

      Meet.findOne.mockResolvedValue({
        rejectedBy: ["DOC1"],
        save: mockSave
      });

      const res = await rejectHeartBeat(token, "CALL123");

      expect(res.status).toBe(200);
      expect(mockSave).not.toHaveBeenCalled();
    });
  });
});
