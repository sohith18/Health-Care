import { jest } from "@jest/globals";

await jest.unstable_mockModule("../models/Slot.js", () => ({
  default: {
    findById: jest.fn(),
    updateOne: jest.fn()
  }
}));

await jest.unstable_mockModule("../models/Booking.js", () => ({
  default: {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn()
  }
}));

await jest.unstable_mockModule("../models/Prescription.js", () => ({
  default: {
    create: jest.fn(),
    deleteOne: jest.fn()
  }
}));

await jest.unstable_mockModule("../services/UserService.js", () => ({
  getUser: jest.fn()
}));

const Slot = (await import("../models/Slot.js")).default;
const Booking = (await import("../models/Booking.js")).default;
const Prescription = (await import("../models/Prescription.js")).default;
const { getUser } = await import("../services/UserService.js");


const { createBooking, getBookings, addPrescription } = await import("../services/BookingService.js");

const Role = (await import("../enums/Role.js")).default;

describe("BookingService", () => {
  const token = "VALID_TOKEN";

  beforeEach(() => jest.clearAllMocks());

  describe("createBooking()", () => {

    test("should return 400 if invalid booking data", async () => {
      const res = await createBooking(token, null);
      expect(res.status).toBe(400);
    });

    test("should return 404 if slot not found", async () => {
      Slot.findById.mockResolvedValue(null);

      const res = await createBooking(token, { doctorID: "d1", slotID: "s1" });
      expect(res.status).toBe(404);
    });

    test("should return 400 if slot is full", async () => {
      Slot.findById.mockResolvedValue({ capacity: 0 });

      const res = await createBooking(token, { doctorID: "d1", slotID: "s1" });
      expect(res.status).toBe(400);
    });

    test("should return 404 if user is not patient", async () => {
      Slot.findById.mockResolvedValue({ capacity: 1, _id: "slot" });
      Slot.updateOne.mockResolvedValue(true);

      getUser.mockResolvedValue({
        status: 200,
        user: { role: Role.DOCTOR }
      });

      const res = await createBooking(token, { doctorID: "d1", slotID: "s1" });
      expect(res.status).toBe(404);
    });

    test("should create booking successfully", async () => {
      Slot.findById.mockResolvedValue({ capacity: 1, _id: "slot" });
      Slot.updateOne.mockResolvedValue(true);

      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "PATIENT_ID", role: Role.PATIENT }
      });

      Booking.create.mockResolvedValue({ _id: "BOOKING_ID" });

      const res = await createBooking(token, { doctorID: "d1", slotID: "slot" });

      expect(res.status).toBe(200);
      expect(Booking.create).toHaveBeenCalled();
    });
  });

  
  describe("getBookings()", () => {

    test("should return error if user unauthorized", async () => {
      getUser.mockResolvedValue({ status: 403 });

      const res = await getBookings(token);
      expect(res.status).toBe(403);
    });

    test("should fetch bookings for patient", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "UID", role: Role.PATIENT }
      });

      Booking.find.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });

      const res = await getBookings(token);
      expect(res.status).toBe(200);
    });

    test("should fetch bookings for doctor", async () => {
      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "UID", role: Role.DOCTOR }
      });

      Booking.find.mockReturnValue({
        populate: jest.fn().mockReturnThis()
      });

      const res = await getBookings(token);
      expect(res.status).toBe(200);
    });
  });


  describe("addPrescription()", () => {
    test("should successfully add prescription", async () => {

      getUser.mockResolvedValue({
        status: 200,
        user: { _id: "doctor123", role: Role.DOCTOR }
      });

      Booking.findById.mockResolvedValueOnce({
        _id: "booking123",
        doctor: "doctor123",
        prescription: null
      });

      Prescription.create.mockResolvedValue({
        _id: "presc123",
        medicines: [{ name: "testMed", details: "daily" }],
        comments: "Follow instructions"
      });

      Booking.updateOne.mockResolvedValue(true);

      Booking.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          _id: "booking123",
          doctor: "doctor123",
          prescription: { _id: "presc123" }
        })
      });

      const result = await addPrescription("validtoken", {
        bookingID: "booking123",
        medicines: [{ name: "testMed", details: "daily" }],
        comments: "Follow instructions"
      });

      expect(result.status).toBe(200);
      expect(result.msg).toBe("Prescription added successfully");
      expect(result.booking.prescription._id).toBe("presc123");
    });

  });
});
