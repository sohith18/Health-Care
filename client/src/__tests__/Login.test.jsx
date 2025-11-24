// src/__tests__/Login.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../pages/Login";
import { TranslationContext } from "../store/TranslationContext";
import { MemoryRouter } from "react-router-dom";

// Mock react-router-dom’s useNavigate hook to intercept navigation calls during tests
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login", () => {
  // Setup global fetch mock and spy on localStorage.setItem before each test
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "DUMMY_TOKEN",
        user: { role: "PATIENT", slots: [] },
      }),
    });
    jest
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {});
  });

  // Restore all mocks after each test to avoid cross-test interference
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Utility to render Login wrapped with MemoryRouter and TranslationContext
  function renderLogin(translatedTexts = {}) {
    return render(
      <MemoryRouter>
        <TranslationContext.Provider value={{ translatedTexts }}>
          <Login />
        </TranslationContext.Provider>
      </MemoryRouter>
    );
  }

  // Verify login form renders expected headings, inputs, and button
  test("renders login form fields and button", () => {
    renderLogin({
      "Welcome Back": "Welcome Back",
      "Please login to your account": "Please login to your account",
      Email: "Email",
      Password: "Password",
      Login: "Login",
    });

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/please login to your account/i)).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  // Submit login as PATIENT and verify navigation to home and token storage
  test("submits login and navigates on PATIENT success", async () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/enter email/i);
    const passInput = screen.getByPlaceholderText(/enter password/i);
    const submitBtn = screen.getByRole("button", { name: /login/i });

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passInput, { target: { value: "secret" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "AuthToken",
      "DUMMY_TOKEN"
    );
  });

  // Submit login as DOCTOR with no slots, expect navigation to profile setup
  test("submits login and navigates on DOCTOR success with no slots (profile setup)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "DUMMY_TOKEN",
        user: { role: "DOCTOR", slots: [] },
      }),
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: "doc@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "AuthToken",
      "DUMMY_TOKEN"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/profile-change-doctor");
  });

  // Submit login as DOCTOR with slots, expect navigation to doctor home
  test("submits login and navigates on DOCTOR success with filled slots (doctor-home)", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "DUMMY_TOKEN",
        user: { role: "DOCTOR", slots: [{ id: 1 }] },
      }),
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: "doc@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "AuthToken",
      "DUMMY_TOKEN"
    );
    expect(mockNavigate).toHaveBeenCalledWith("/doctor-home");
  });

  // Clicking logo button navigates to home without submitting login form
  test("overlay logo button navigates home without submitting login", () => {
    renderLogin();

    const logoButton = screen.getByRole("button", { name: /logo/i });
    fireEvent.click(logoButton);

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Pressing Enter key in password input submits the login form
  test("pressing Enter in password submits the form", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "DUMMY_TOKEN",
        user: { role: "PATIENT", slots: [] },
      }),
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText(/enter email/i);
    const passInput = screen.getByPlaceholderText(/enter password/i);

    fireEvent.change(emailInput, { target: { value: "user@example.com" } });
    fireEvent.change(passInput, { target: { value: "secret" } });
    fireEvent.keyDown(passInput, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
      keyCode: 13,
    });

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Verify translated headings and buttons render correctly from TranslationContext
  test("renders translated headings and button from context", () => {
    const tr = {
      "Welcome Back": "Willkommen",
      "Please login to your account": "Bitte melde dich an",
      Login: "Anmelden",
    };

    renderLogin(tr);

    expect(screen.getByText("Willkommen")).toBeInTheDocument();
    expect(screen.getByText("Bitte melde dich an")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeInTheDocument();
  });

  // Fallback to default English strings when translation keys are missing
  test("falls back to default strings if translation key missing", () => {
    const tr = { Login: "Connexion" }; // Only button label translated

    renderLogin(tr);

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/please login to your account/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connexion" })).toBeInTheDocument();
  });

  // Navigates successfully after login submit when button label is translated
  test("navigates after submit when button label is translated", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        token: "DUMMY_TOKEN",
        user: { role: "PATIENT", slots: [] },
      }),
    });

    renderLogin({ Login: "Accedi" });

    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Accedi" }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Component rerenders correctly with updated translation context
  test("rerenders with a different translation pack (context update)", () => {
    const initial = {
      "Welcome Back": "Bienvenido",
      Login: "Iniciar sesión",
    };
    const updated = {
      "Welcome Back": "Bienvenue",
      Login: "Connexion",
    };

    const { rerender } = render(
      <MemoryRouter>
        <TranslationContext.Provider value={{ translatedTexts: initial }}>
          <Login />
        </TranslationContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Bienvenido")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();

    // Update context with new translations and rerender
    rerender(
      <MemoryRouter>
        <TranslationContext.Provider value={{ translatedTexts: updated }}>
          <Login />
        </TranslationContext.Provider>
      </MemoryRouter>
    );

    expect(screen.getByText("Bienvenue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Connexion" })).toBeInTheDocument();
  });

  // Supports rendering of non-Latin text translations correctly in headings and buttons
  test("supports non-Latin translations for headings and buttons", () => {
    const tr = {
      "Welcome Back": "欢迎回来",
      "Please login to your account": "请登录到你的账户",
      Login: "登录",
    };

    renderLogin(tr);

    expect(screen.getByText("欢迎回来")).toBeInTheDocument();
    expect(screen.getByText("请登录到你的账户")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
  });
});
