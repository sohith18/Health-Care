import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Slot from "../models/Slot.js";

let signup, login, getUser, updateUser;
let doctorToken, patientToken, doctorId, userId, slotId;

describe("UserService Integration Tests", () => {
  let mongo;

  beforeAll(async () => {
    process.env.SECRET_ACCESS_TOKEN = "TEST_SECRET_KEY";

    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri);
    await mongoose.connection.syncIndexes();

    ({ signup, login } = await import("../services/AuthService.js"));
    ({ getUser, updateUser } = await import("../services/UserService.js"));

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

  test("getUser should return correct user", async () => {
    const res = await getUser(patientToken);

    expect(res.status).toBe(200);
    expect(res.user.email).toBe("patient@test.com");
  });

  test("getUser should populate doctor slots", async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));

    const res = await getUser(doctorToken);

    expect(res.status).toBe(200);
    expect(res.user.role).toBe("DOCTOR");
    expect(Array.isArray(res.user.slots)).toBe(true);

    expect(res.user.slots.length).toBeGreaterThan(0);

    const receivedSlotId =
      res.user.slots[0]._id?.toString() || res.user.slots[0].toString();

    expect(receivedSlotId).toBe(slotId.toString());
  });

  test("updateUser should update name and password", async () => {
    const res = await getUser(patientToken);
    userId = res.user._id;

    const updateRes = await updateUser({
      _id: userId,
      name: "Updated Name",
      password: "newPass123",
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.user.name).toBe("Updated Name");
  });

  test("getUser returns error on invalid token", async () => {
    const res = await getUser("INVALID_TOKEN");

    expect(res.status).toBe(500);
    expect(res.msg.toLowerCase()).toContain("invalid");
  });
});


async function setupUsers() {
  await signup({
    name: "Patient",
    email: "patient@test.com",
    password: "123456",
    role: "PATIENT",
  });

  const patientLogin = await login({
    email: "patient@test.com",
    password: "123456",
  });

  patientToken = patientLogin.token;

  await signup({
    name: "Doctor",
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

  const slot = await Slot.create({
    doctor: doctorId,
    date: "2025-12-01",
    start_time: "10:00",
    end_time: "11:00",
    capacity: 1,
  });

  slotId = slot._id;

  const { User } = await import("../models/User.js");
  const DoctorModel = mongoose.model("Doctor") || User.discriminator("Doctor");

  await DoctorModel.findByIdAndUpdate(doctorId, { slots: [slotId] });
}
