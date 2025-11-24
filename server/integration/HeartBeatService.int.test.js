import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Slot from "../models/Slot.js";
import Meet from "../models/Meet.js";

let signup, login;
let getHeartBeat, rejectHeartBeat;

let doctorToken, patientToken, doctorId;

describe("HeartBeatService Integration Tests", () => {
  let mongo;

  beforeAll(async () => {
    process.env.SECRET_ACCESS_TOKEN = "TEST_ACCESS_KEY";
    process.env.SECRET_MEET_TOKEN = "TEST_MEET_KEY";
    process.env.API_KEY = "TEST_API_KEY";

    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);
    await mongoose.connection.syncIndexes();

    ({ signup, login } = await import("../services/AuthService.js"));
    ({ getHeartBeat, rejectHeartBeat } = await import("../services/HeartBeatService.js"));

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

  test("should return no meetings if none exist", async () => {
    const res = await getHeartBeat(doctorToken);

    expect(res.status).toBe(200);
    expect(res.msg).toBe("No meetings scheduled");
  });

  test("doctor should detect pending meeting based on specialization", async () => {
    const { Doctor } = await import("../models/User.js");

    await Doctor.updateOne(
      { _id: doctorId },
      { $set: { specializations: ["Cardiology"] } }
    );

    await mongoose.connection.syncIndexes();
    await new Promise(r => setTimeout(r, 30));

    const meeting = await Meet.create({
      patientId: new mongoose.Types.ObjectId(),
      doctorId: null,
      specialization: "Cardiology",
      rejectedBy: [],
      status: "pending"
    });

    const res = await getHeartBeat(doctorToken);

    expect(res.status).toBe(200);
    expect(res.callId.toString()).toBe(meeting._id.toString());
    expect(res.specialization).toBe("Cardiology");
    expect(res.token).toBeDefined();
    expect(res.apiKey).toBe("TEST_API_KEY");
  });

  test("doctor should not get rejected meet again", async () => {
    const User = (await import("../models/User.js")).User;

    await User.updateOne(
      { _id: doctorId },
      { $set: { specializations: ["Cardiology"], __t: "Doctor" } }
    );

    const meeting = await Meet.create({
      patientId: new mongoose.Types.ObjectId(),
      doctorId: null,
      specialization: "Cardiology",
      rejectedBy: [],
      status: "pending"
    });

    // Doctor rejects the meet
    await rejectHeartBeat(doctorToken, meeting._id.toString());

    // Now get heartbeat, should NOT return same meet
    const res = await getHeartBeat(doctorToken);

    expect(res.status).toBe(200);
    expect(res.msg).toBe("No meetings scheduled");
  });

  test("rejectHeartBeat should return error if invalid callId", async () => {
    const res = await rejectHeartBeat(doctorToken, null);

    expect(res.status).toBe(400);
    expect(res.msg).toBe("callId is required");
  });

  test("rejectHeartBeat should fail for non-doctor", async () => {
    const res = await rejectHeartBeat(patientToken, new mongoose.Types.ObjectId().toString());

    expect(res.status).toBe(404);
    expect(res.msg).toBe("User is not a doctor");
  });

});

/* ------------------ Helper Setup ------------------ */

async function setupUsers() {
  // Create patient
  await signup({
    name: "Patient",
    email: "patient@test.com",
    password: "123456",
    role: "PATIENT",
  });

  const patientLogin = await login({ email: "patient@test.com", password: "123456" });
  patientToken = patientLogin.token;

  // Create doctor
  await signup({
    name: "Doctor",
    email: "doctor@test.com",
    password: "123456",
    role: "DOCTOR",
  });

  const doctorLogin = await login({ email: "doctor@test.com", password: "123456" });
  doctorToken = doctorLogin.token;
  doctorId = doctorLogin.user._id;
}
