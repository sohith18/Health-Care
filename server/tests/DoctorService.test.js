import { jest } from "@jest/globals";

await jest.unstable_mockModule("../models/User.js", () => ({
  Doctor: { findOneAndUpdate: jest.fn() },
  User: { find: jest.fn() }
}));

await jest.unstable_mockModule("../models/Slot.js", () => ({
  default: { create: jest.fn() }
}));

await jest.unstable_mockModule("../services/UserService.js", () => ({
  getUser: jest.fn()
}));

const { getUser } = await import("../services/UserService.js");
const { Doctor, User } = await import("../models/User.js");
const Slot = (await import("../models/Slot.js")).default;

const Role = (await import("../enums/Role.js")).default;
const { updateDoctor, getAllDoctors } = await import("../services/DoctorService.js");

describe("DoctorService", () => {

  beforeEach(() => jest.clearAllMocks());

  // ---------------------- updateDoctor ------------------------
  describe("updateDoctor()", () => {

    const token = "VALID_TOKEN";

    test("should return error if user is not authorized", async () => {
      getUser.mockResolvedValue({ status: 401 });

      const res = await updateDoctor(token, {});
      expect(res.status).toBe(401);
    });

    test("should return 404 if authenticated user is NOT a doctor", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.PATIENT }
      });

      const res = await updateDoctor(token, {});
      expect(res.status).toBe(404);
    });

    test("should return 400 if invalid doctor update data", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.DOCTOR }
      });

      const res = await updateDoctor(token, null);
      expect(res.status).toBe(400);
    });

    test("should return 400 if slots are not an array", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.DOCTOR }
      });

      const res = await updateDoctor(token, { slots: "INVALID" });
      expect(res.status).toBe(400);
    });

    test("should update doctor successfully", async () => {
      // Mock authenticated user
      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "DOC1", role: Role.DOCTOR }
      });

      // Mock slot creation
      Slot.create.mockResolvedValue({ _id: "SLOT1" });

      // Mock DB update
      Doctor.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: "DOC1",
          slots: [{ _id: "SLOT1" }]
        })
      });

      const res = await updateDoctor(token, {
        slots: [
          {
            isAvailable: true,
            startingTime: "9AM",
            endingTime: "10AM",
            capacity: 5
          }
        ]
      });

      expect(res.status).toBe(200);
      expect(res.user._id).toBe("DOC1");
      expect(Slot.create).toHaveBeenCalled();
      expect(Doctor.findOneAndUpdate).toHaveBeenCalled();
    });

    test("should return 500 if update fails", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "DOC1", role: Role.DOCTOR }
      });

      Doctor.findOneAndUpdate.mockResolvedValue(null);

      const res = await updateDoctor(token, {});
      expect(res.status).toBe(500);
    });
  });

  // ---------------------- getAllDoctors ------------------------
  describe("getAllDoctors()", () => {

    test("should fetch doctors successfully with no filters", async () => {
      User.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ _id: "D1" }])
      });

      const res = await getAllDoctors({});
      expect(res.status).toBe(200);
      expect(res.doctors.length).toBe(1);
    });

    test("should apply filtering correctly (example: gender)", async () => {
      User.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([{ gender: "female" }])
      });

      const res = await getAllDoctors({ gender: "female" });
      expect(User.find).toHaveBeenCalledWith({
        role: Role.DOCTOR,
        gender: "female"
      });

      expect(res.status).toBe(200);
    });

    test("should return 500 when DB error occurs", async () => {
      User.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      const res = await getAllDoctors({});
      expect(res.status).toBe(500);
    });

  });
});
