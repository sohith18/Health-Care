import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let signup, login;

describe("AuthService Integration Tests", () => {
  let mongo;

  beforeAll(async () => {
    process.env.SECRET_ACCESS_TOKEN = "TEST_SECRET";

    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    ({ signup, login } = await import("../services/AuthService.js"));

    await mongoose.connection.syncIndexes();
  });

  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  test("signup should create a new user and return token", async () => {
    const response = await signup({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "PATIENT",
    });

    expect(response.status).toBe(200);
    expect(response.token).toBeDefined();
    expect(response.user.email).toBe("test@example.com");
  });

  test("signup should reject duplicate email", async () => {
    await signup({
      name: "Test User",
      email: "duplicate@test.com",
      password: "pass1234",
      role: "PATIENT",
    });

    const response = await signup({
      name: "Another User",
      email: "duplicate@test.com",
      password: "pass1234",
      role: "PATIENT",
    });

    expect(response.status).toBe(409);
    expect(response.msg).toBe("User already exists");
  });

  test("login should authenticate an existing user", async () => {
    await signup({
      name: "Login User",
      email: "login@test.com",
      password: "123456",
      role: "PATIENT",
    });

    const response = await login({
      email: "login@test.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.token).toBeDefined();
    expect(response.user.email).toBe("login@test.com");
  });

  test("login should reject wrong password", async () => {
    await signup({
      name: "Wrong Password User",
      email: "wrongpass@test.com",
      password: "correctpass",
      role: "PATIENT",
    });

    const response = await login({
      email: "wrongpass@test.com",
      password: "BADPASS",
    });

    expect(response.status).toBe(401);
    expect(response.msg).toBe("Wrong password");
  });

  test("login should fail if user doesn't exist", async () => {
    const response = await login({
      email: "notfound@test.com",
      password: "anything",
    });

    expect(response.status).toBe(404);
    expect(response.msg).toBe("User not found");
  });
});
