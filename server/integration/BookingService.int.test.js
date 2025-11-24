import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Slot from "../models/Slot.js";

let signup, login, createBooking, getBookings, addPrescription;

let patientToken, doctorToken, slotId, doctorId, patientId;

describe("BookingService Integration Tests", () => {
  let mongo;

  beforeAll(async () => {
    process.env.SECRET_ACCESS_TOKEN = "TEST_SECRET_KEY";

    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);

    ({ signup, login } = await import("../services/AuthService.js"));
    ({ createBooking, getBookings, addPrescription } = await import("../services/BookingService.js"));

    await setupUsersAndSlot();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
    await setupUsersAndSlot();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  test("should create booking successfully", async () => {
    const res = await createBooking(patientToken, { doctorID: doctorId, slotID: slotId });

    expect(res.status).toBe(200);
    expect(res.booking).toBeDefined();
    expect(res.booking.patient.toString()).toBe(patientId.toString());
  });

  test("should fail if slot is full", async () => {
    await createBooking(patientToken, { doctorID: doctorId, slotID: slotId });

    const res = await createBooking(patientToken, { doctorID: doctorId, slotID: slotId });

    expect(res.status).toBe(400);
    expect(res.msg).toBe("Slot is full");
  });

  test("getBookings should return bookings for patient", async () => {
    await createBooking(patientToken, { doctorID: doctorId, slotID: slotId });

    const res = await getBookings(patientToken);

    expect(res.status).toBe(200);
    expect(res.bookings.length).toBe(1);
  });

  test("addPrescription should allow doctor", async () => {
    const bookingRes = await createBooking(patientToken, { doctorID: doctorId, slotID: slotId });

    const res = await addPrescription(doctorToken, {
      bookingID: bookingRes.booking._id.toString(),
      medicines: [{ medicine_name: "Aspirin", dosage: "1/day" }],
      comments: "Drink water"
    });

    expect(res.status).toBe(200);
    expect(res.booking.prescription).toBeDefined();
    expect(res.booking.prescription.medicines.length).toBe(1);
  });

  test("addPrescription should reject unauthorized patient attempt", async () => {
    const bookingRes = await createBooking(patientToken, { doctorID: doctorId, slotID: slotId });

    const res = await addPrescription(patientToken, {
      bookingID: bookingRes.booking._id.toString(),
      medicines: [],
      comments: ""
    });

    expect(res.status).toBe(403);
    expect(res.msg).toBe("Patient not authorized");
  });

});


async function setupUsersAndSlot() {
  await signup({ name: "Patient", email: "patient@test.com", password: "123456", role: "PATIENT" });

  const patientLogin = await login({ email: "patient@test.com", password: "123456" });
  patientToken = patientLogin.token;
  patientId = patientLogin.user._id;

  await signup({ name: "Doctor", email: "doctor@test.com", password: "123456", role: "DOCTOR" });

  const doctorLogin = await login({ email: "doctor@test.com", password: "123456" });
  doctorToken = doctorLogin.token;
  doctorId = doctorLogin.user._id;

  const slot = await Slot.create({
    doctor: doctorId,
    date: "2025-12-01",
    start_time: "10:00",
    end_time: "11:00",
    capacity: 1
  });

  slotId = slot._id;
}
