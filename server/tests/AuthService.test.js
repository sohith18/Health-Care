import { jest } from "@jest/globals";


await jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

await jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn()
  }
}));

await jest.unstable_mockModule("../models/User.js", () => ({
  Doctor: jest.fn(),
  Patient: jest.fn(),
  User: {
    findOne: jest.fn(),
    findOneAndDelete: jest.fn()
  }
}));


const { default: bcrypt } = await import("bcrypt");
const { default: jwt } = await import("jsonwebtoken");
const { Doctor, Patient, User } = await import("../models/User.js");
const { signup, login } = await import("../services/AuthService.js");


describe("AuthService.signup", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should create a doctor when role is DOCTOR", async () => {
    bcrypt.hash.mockResolvedValue("hashed_password");
    jwt.sign.mockReturnValue("fake_jwt");

    const mockUser = { save: jest.fn().mockResolvedValue({ _id: "123" }) };
    Doctor.mockImplementation(() => mockUser);

    const result = await signup({
      email: "test@test.com",
      password: "123",
      role: "DOCTOR"
    });

    expect(result.status).toBe(200);
    expect(mockUser.save).toHaveBeenCalled();
  });

  test("should return 409 if email already exists", async () => {
    bcrypt.hash.mockResolvedValue("hashed_password");

    const duplicateEmailError = new Error("Duplicate");
    duplicateEmailError.code = 11000;

    Patient.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(duplicateEmailError)
    }));

    const result = await signup({
        email: "dup@test.com",
        password: "123",
        role: "PATIENT"
    });

    expect(result.status).toBe(409);
    expect(result.msg).toBe("User already exists");
  });

  test("should return 500 on unexpected error", async () => {
    bcrypt.hash.mockResolvedValue("hashed_password");

    const unexpectedError = new Error("DB FAIL");
    delete unexpectedError.code;

    Patient.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(unexpectedError)
    }));

    const result = await signup({
        email: "err@test.com",
        password: "123",
        role: "PATIENT"
    });

    expect(result.status).toBe(500);
    expect(result.msg).toBe("Error during signup");
    });
});


describe("AuthService.login", () => {
  beforeEach(() => jest.clearAllMocks());

  test("should return 404 if user not found", async () => {
    User.findOne.mockResolvedValue(null);

    const result = await login({ email: "none@test.com", password: "123" });

    expect(result.status).toBe(404);
  });

  test("should return 401 if password wrong", async () => {
    User.findOne.mockResolvedValue({ password: "HASH" });
    bcrypt.compare.mockResolvedValue(false);

    const result = await login({ email: "test@test.com", password: "wrong" });

    expect(result.status).toBe(401);
  });

  test("should return 200 if credentials are correct", async () => {
    User.findOne.mockResolvedValue({ _id: "999", password: "HASH" });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("TOKEN123");

    const result = await login({ email: "ok@test.com", password: "correct" });

    expect(result.status).toBe(200);
    expect(result.token).toBe("TOKEN123");
  });
});
