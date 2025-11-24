import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Slot from "../models/Slot.js";
import Meet from "../models/Meet.js";

let signup, login;
let getMeetDetails, deleteMeetDetails;
let patientToken, doctorToken, patientId, doctorId;

describe("MeetService Integration Tests", () => {
  let mongo;

  beforeAll(async () => {
    process.env.SECRET_ACCESS_TOKEN = "TEST_SECRET";
    process.env.SECRET_MEET_TOKEN = "TEST_MEET_SECRET";
    process.env.API_KEY = "TEST_API_KEY";

    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    ({ signup, login } = await import("../services/AuthService.js"));
    ({ getMeetDetails, deleteMeetDetails } = await import("../services/MeetService.js"));

    await setupUsers();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
    await setupUsers();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  test("Patient should create a new meeting", async () => {
    const res = await getMeetDetails(patientToken, "Dermatology", null);

    expect(res.status).toBe(200);
    expect(res.role).toBe("patient");
    expect(res.callId).toBeDefined();
    expect(res.apiKey).toBe("TEST_API_KEY");
    expect(res.token).toBeDefined();

    const dbMeet = await Meet.findById(res.callId);
    expect(dbMeet).not.toBeNull();
    expect(dbMeet.specialization).toBe("Dermatology");
    expect(dbMeet.patientId.toString()).toBe(patientId.toString());
  });

  test("Doctor should join existing meeting", async () => {
    const created = await getMeetDetails(patientToken, "ENT", null);

    const res = await getMeetDetails(doctorToken, null, created.callId.toString());

    expect(res.status).toBe(200);
    expect(res.role).toBe("doctor");
    expect(String(res.callId)).toBe(String(created.callId));
    expect(res.apiKey).toBe("TEST_API_KEY");

    const dbMeet = await Meet.findById(res.callId);
    expect(dbMeet.doctorId.toString()).toBe(doctorId.toString());
  });

  test("Patient must provide specialization", async () => {
    const res = await getMeetDetails(patientToken, null, null);

    expect(res.status).toBe(400);
    expect(res.msg).toBe("Specialization is required for patient");
  });

  test("Doctor must provide callId", async () => {
    const res = await getMeetDetails(doctorToken, "ENT", null);

    expect(res.status).toBe(400);
    expect(res.msg).toBe("callId is required for doctor");
  });

  test("Doctor should not join nonexistent meeting", async () => {
    const res = await getMeetDetails(doctorToken, null, "000000000000000000000000");

    expect(res.status).toBe(404);
    expect(res.msg).toBe("Meeting not found");
  });

  test("deleteMeetDetails should delete existing meeting", async () => {
    const created = await getMeetDetails(patientToken, "Cardiology", null);
    const res = await deleteMeetDetails(patientToken, created.callId.toString());

    expect(res.status).toBe(200);
    expect(res.msg).toBe("Meeting deleted successfully");

    const deletedCheck = await Meet.findById(created.callId);
    expect(deletedCheck).toBeNull();
  });

  test("deleteMeetDetails should return error for missing callId", async () => {
    const res = await deleteMeetDetails(patientToken, null);

    expect(res.status).toBe(400);
    expect(res.msg).toBe("callId is required");
  });

  test("deleteMeetDetails should return not found for invalid callId", async () => {
    const res = await deleteMeetDetails(patientToken, "000000000000000000000000");

    expect(res.status).toBe(404);
    expect(res.msg).toBe("Meeting not found");
  });
});


async function setupUsers() {
  await signup({
    name: "Patient Test",
    email: "patient@test.com",
    password: "123456",
    role: "PATIENT",
  });

  const patientLogin = await login({
    email: "patient@test.com",
    password: "123456",
  });

  patientToken = patientLogin.token;
  patientId = patientLogin.user._id;

  await signup({
    name: "Doctor Test",
    email: "doctor@test.com",
    password: "123456",
    role: "DOCTOR",
  });

  const doctorLogin = await login({
    email: "doctor@test.com",
    password: "123456",
  });

  doctorToken = doctorLogin.token;
  doctorId = doctorLogin.user._id;
}
