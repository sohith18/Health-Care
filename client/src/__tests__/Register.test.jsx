import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Register from "../pages/Register"; // adjust path
import { TranslationContext } from "../store/TranslationContext";
import { MemoryRouter } from "react-router-dom";

// Mock react-router-dom's useNavigate hook to intercept navigation calls
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock translation utility to return input text without real translation
jest.mock("../Controllers/Translation", () => ({
  translation: jest.fn(async (text, lang) => text),
}));

describe("Register", () => {
  // Setup fetch mock and spy on localStorage.setItem before each test
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "DUMMY_TOKEN",
        user: { role: "PATIENT", slots: [] },
      }),
    });
    jest.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {});
  });

  // Restore mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Utility to render Register component wrapped in routing and translation context
  function renderRegister(translatedTexts = {}) {
    return render(
      <MemoryRouter>
        <TranslationContext.Provider value={{ translatedTexts }}>
          <Register />
        </TranslationContext.Provider>
      </MemoryRouter>
    );
  }

  // Verify rendering of role selection buttons and form inputs with translations
  test("renders role buttons and form inputs", () => {
    renderRegister({
      Doctor: "Doctor",
      Patient: "Patient",
      "Create Your Account": "Create Your Account",
    });

    expect(screen.getByRole("button", { name: /doctor/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /patient/i })).toBeInTheDocument();
    expect(screen.getByText(/create your account/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/enter name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
  });

  // Test switching roles updates displayed text accordingly
  test("allows switching role to doctor", () => {
    renderRegister({ Doctor: "Doctor", Patient: "Patient" });

    const doctorBtn = screen.getByRole("button", { name: /doctor/i });
    const patientBtn = screen.getByRole("button", { name: /patient/i });

    fireEvent.click(doctorBtn);
    expect(
      screen.getByText(/join our health platform and connect with patients/i)
    ).toBeInTheDocument();

    fireEvent.click(patientBtn);
    expect(
      screen.getByText(/start your health journey today/i)
    ).toBeInTheDocument();
  });

  // Verify successful register submission stores token and navigates home
  test("submits register and navigates on PATIENT success", async () => {
    renderRegister();

    fireEvent.change(screen.getByPlaceholderText(/enter name/i), {
      target: { value: "New User" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: "secret" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "AuthToken",
      "DUMMY_TOKEN"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
