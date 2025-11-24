import { jest } from "@jest/globals";

await jest.unstable_mockModule("../services/UserService.js", () => ({
  getUser: jest.fn()
}));

let mockInstance;

await jest.unstable_mockModule("../models/Meet.js", () => {
  const Meet = jest.fn().mockImplementation(() => {
    mockInstance = {
      save: jest.fn()
    };
    return mockInstance;
  });

  Meet.findOneAndUpdate = jest.fn();
  Meet.findOneAndDelete = jest.fn();

  return { default: Meet };
});

await jest.unstable_mockModule("../models/User.js", () => ({
  User: {
    findById: jest.fn()
  }
}));

const mockSign = jest.fn();

await jest.unstable_mockModule("jsonwebtoken", () => ({
  __esModule: true,
  default: { sign: mockSign } 
}));


const Meet = (await import("../models/Meet.js")).default;
const { getMeetDetails, deleteMeetDetails } = await import("../services/MeetService.js");
const { getUser } = await import("../services/UserService.js");
const { User } = await import("../models/User.js");
import Role from "../enums/Role.js";
import jwt from "jsonwebtoken";

describe("MeetService", () => {
  const token = "VALID_TOKEN";

  beforeEach(() => {
    jest.clearAllMocks();
  });

 
  describe("getMeetDetails()", () => {
    test("should return error if user not authenticated", async () => {
      getUser.mockResolvedValue({ status: 401 });

      const res = await getMeetDetails(token);
      expect(res.status).toBe(401);
    });

    test("should return 404 if user not found in DB", async () => {
      getUser.mockResolvedValue({ status: 200, user: { _id: "U1" } });
      User.findById.mockResolvedValue(null);

      const res = await getMeetDetails(token);
      expect(res.status).toBe(404);
      expect(res.msg).toBe("User not found");
    });

    test("should return 400 if patient request missing specialization", async () => {
      getUser.mockResolvedValue({ status: 200, user: { _id: "P1", role: Role.PATIENT } });

      User.findById.mockResolvedValue({ role: Role.PATIENT });

      const res = await getMeetDetails(token);
      expect(res.status).toBe(400);
      expect(res.msg).toBe("Specialization is required for patient");
    });

    test("should create meeting for patient", async () => {
      getUser.mockResolvedValue({ status: 200, user: { _id: "P1", role: Role.PATIENT } });
      User.findById.mockResolvedValue({ _id: "P1", role: Role.PATIENT });

      const fakeMeeting = { _id: "M123" };
      mockSign.mockReturnValue("TOKEN123");

      Meet.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(fakeMeeting)
      }));

      const res = await getMeetDetails("token123", "Dermatology");

      expect(res.status).toBe(200);
      expect(res.callId).toBe("M123");
      expect(res.role).toBe("patient");
      expect(mockSign).toHaveBeenCalled();
    });

    test("should return 400 if doctor missing callId", async () => {
      getUser.mockResolvedValue({ status: 200, user: { _id: "D1", role: Role.DOCTOR } });

      User.findById.mockResolvedValue({ role: Role.DOCTOR });

      const res = await getMeetDetails(token);
      expect(res.status).toBe(400);
      expect(res.msg).toBe("callId is required for doctor");
    });
  });

  describe("deleteMeetDetails()", () => {
    const callId = "CALL001";

    test("should return error if user unauthorized", async () => {
      getUser.mockResolvedValue({ status: 401 });

      const res = await deleteMeetDetails(token, callId);
      expect(res.status).toBe(401);
    });

    test("should return 403 if user role not allowed", async () => {
      getUser.mockResolvedValue({ status: 200, user: { role: "admin" } });

      const res = await deleteMeetDetails(token, callId);
      expect(res.status).toBe(403);
    });

    test("should return 400 if missing callId", async () => {
      getUser.mockResolvedValue({ status: 200, user: { role: Role.PATIENT } });

      const res = await deleteMeetDetails(token);
      expect(res.status).toBe(400);
    });

    test("should return 404 if meeting does not exist", async () => {
      getUser.mockResolvedValue({ status: 200, user: { role: Role.DOCTOR } });

      Meet.findOneAndDelete.mockResolvedValue(null);

      const res = await deleteMeetDetails(token, callId);
      expect(res.status).toBe(404);
      expect(res.msg).toBe("Meeting not found");
    });

    test("should delete meeting successfully", async () => {
      getUser.mockResolvedValue({ status: 200, user: { role: Role.PATIENT } });

      Meet.findOneAndDelete.mockResolvedValue({ _id: "CALL001" });

      const res = await deleteMeetDetails(token, callId);
      expect(res.status).toBe(200);
      expect(res.msg).toBe("Meeting deleted successfully");
    });
  });
});
