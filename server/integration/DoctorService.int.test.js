import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Slot from "../models/Slot.js";
import Role from "../enums/Role.js";

let signup, login;
let updateDoctor, getAllDoctors;

let doctorToken, patientToken, doctorId;

describe("DoctorService Integration Tests", () => {
  let mongo;

  beforeAll(async () => {
    process.env.SECRET_ACCESS_TOKEN = "TEST_SECRET";
    
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    ({ signup, login } = await import("../services/AuthService.js"));
    ({ updateDoctor, getAllDoctors } = await import("../services/DoctorService.js"));

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

  test("Doctor should update profile successfully", async () => {
    const payload = {
      qualifications: ["MBBS", "MD"],
      specializations: ["Cardiology"],
      experience: "10 Years",
      description: "Expert heart specialist",
      gender: "Male",
    };

    const res = await updateDoctor(doctorToken, payload);

    expect(res.status).toBe(200);
    expect(res.user.specializations).toContain("Cardiology");
    expect(res.user.qualifications.length).toBe(2);
    expect(res.user.description).toBe("Expert heart specialist");
  });

  test("Doctor should be able to create slots via update", async () => {
    const payload = {
      slots: [
        {
          isAvailable: true,
          startingTime: "10:00 AM",
          endingTime: "11:00 AM",
          capacity: 3,
        },
      ],
    };

    const res = await updateDoctor(doctorToken, payload);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.user.slots)).toBe(true);
    expect(res.user.slots.length).toBe(1);

    const slot = res.user.slots[0];
    expect(slot.timeInterval).toBe("10:00 AM - 11:00 AM");
    expect(slot.capacity).toBe(3);

    const dbSlot = await Slot.findById(slot._id);
    expect(dbSlot).not.toBeNull();
  });

  test("Non-doctor user should NOT be allowed to update doctor details", async () => {
    const res = await updateDoctor(patientToken, { description: "Should not work" });

    expect(res.status).toBe(404);
    expect(res.msg).toBe("User is not a doctor");
  });

  test("Should reject invalid update payload", async () => {
    const res = await updateDoctor(doctorToken, "INVALID_PAYLOAD");

    expect(res.status).toBe(400);
    expect(res.msg).toBe("Invalid doctor data provided");
  });

  test("getAllDoctors should return updated doctor data", async () => {
    await updateDoctor(doctorToken, {
      qualifications: ["MBBS"],
      specializations: ["Dermatology"],
      experience: "7 Years",
    });

    const res = await getAllDoctors({ specialization: "Dermatology" });

    expect(res.status).toBe(200);
    expect(res.doctors.length).toBe(1);
    expect(res.doctors[0].specializations).toContain("Dermatology");
  });

  test("getAllDoctors should return empty if no match", async () => {
    const res = await getAllDoctors({ specialization: "Neurosurgery" });

    expect(res.status).toBe(200);
    expect(res.doctors.length).toBe(0);
  });
});



/* ---------------- DB Seeder ---------------- */

async function setupUsers() {
  // Create Patient
  await signup({
    name: "Patient A",
    email: "patient@test.com",
    password: "123456",
    role: Role.PATIENT,
  });

  const patientLogin = await login({
    email: "patient@test.com",
    password: "123456",
  });

  patientToken = patientLogin.token;

  // Create Doctor
  await signup({
    name: "Doctor A",
    email: "doctor@test.com",
    password: "123456",
    role: Role.DOCTOR,
  });

  const doctorLogin = await login({
    email: "doctor@test.com",
    password: "123456",
  });

  doctorToken = doctorLogin.token;
  doctorId = doctorLogin.user._id;
}
