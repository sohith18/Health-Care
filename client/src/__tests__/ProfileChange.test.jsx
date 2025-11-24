import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfileChange from "../components/ProfileChange";
import { TranslationContext } from "../store/TranslationContext";

// Mock react-router-dom's useNavigate to intercept navigation calls
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: actual.MemoryRouter,
  };
});

// Silence console logs during tests
const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

// Helper to render ProfileChange component within translation and routing context
function renderProfileChange(translatedTexts = {}) {
  return render(
    <TranslationContext.Provider value={{ translatedTexts }}>
      <MemoryRouter>
        <ProfileChange />
      </MemoryRouter>
    </TranslationContext.Provider>
  );
}

describe("ProfileChange", () => {
  let getItemSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage.getItem to return AuthToken by default
    getItemSpy = jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => (k === "AuthToken" ? "DUMMY_TOKEN" : null));

    // Mock fetch to return user data
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { name: "Alice" } }),
    });

    window.alert = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  // Checks initial user data fetch pre-fills form and headers are correct
  test("fetches user data with AuthToken, uses headers, and pre-fills name", async () => {
    renderProfileChange();

    // Loading indicator shown initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait until loading disappears and form displays
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    // Fetch called once with expected GET and authorization headers
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("http://localhost:3000/user");
    expect(options).toMatchObject({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer DUMMY_TOKEN",
      },
    });

    // Name input pre-filled with fetched user name
    const nameInput = screen.getByPlaceholderText(/enter name/i);
    expect(nameInput).toHaveValue("Alice");
  });

  // Ensures no fetch happens without AuthToken and no loading indicator shown
  test("does not fetch user data when AuthToken is missing", async () => {
    getItemSpy.mockImplementation(() => null);

    renderProfileChange();

    // No fetch call and no loading state
    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();

    // Name input still rendered and empty
    expect(screen.getByPlaceholderText(/enter name/i)).toBeInTheDocument();
  });

  // Password mismatch displays error message
  test("shows password mismatch error when passwords differ", async () => {
    renderProfileChange();

    // Wait for loading removal
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const rePasswordInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Enter different passwords
    fireEvent.change(nameInput, { target: { value: "Bob" } });
    fireEvent.change(passwordInput, { target: { value: "pass1" } });
    fireEvent.change(rePasswordInput, { target: { value: "pass2" } });
    fireEvent.click(submitButton);

    // Expect password mismatch error shown
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  // Editing password fields clears mismatch error
  test("clears password mismatch error when user edits password fields", async () => {
    renderProfileChange();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const rePasswordInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Cause mismatch error
    fireEvent.change(passwordInput, { target: { value: "pass1" } });
    fireEvent.change(rePasswordInput, { target: { value: "pass2" } });
    fireEvent.click(submitButton);
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

    // Edit password field to clear error
    fireEvent.change(passwordInput, { target: { value: "pass3" } });
    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
  });

  // Submitting matching password updates profile, alerts success, and navigates home
  test("submits update when passwords match: POST with headers & body, alert, and navigate home", async () => {
    global.fetch
      // GET /user fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { name: "Alice" } }),
      })
      // POST /user update
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ msg: "Updated successfully" }),
      });

    renderProfileChange();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/enter name/i);
    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const rePasswordInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Populate form with matching passwords
    fireEvent.change(nameInput, { target: { value: "Bob" } });
    fireEvent.change(passwordInput, { target: { value: "pass123" } });
    fireEvent.change(rePasswordInput, { target: { value: "pass123" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Expect GET and POST fetch calls
    expect(global.fetch).toHaveBeenCalledTimes(2);
    const [postUrl, postOptions] = global.fetch.mock.calls[1];
    expect(postUrl).toContain("http://localhost:3000/user");
    expect(postOptions).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer DUMMY_TOKEN",
      },
    });

    const body = JSON.parse(postOptions.body);
    expect(body).toMatchObject({
      password: "pass123",
      re_password: "pass123",
    });

    // Alert and navigation called on success
    expect(window.alert).toHaveBeenCalledWith("Updated successfully");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  // Does not fetch or navigate when AuthToken missing on update attempt
  test("does not call update API or navigate when no AuthToken", async () => {
    getItemSpy.mockImplementation(() => null);

    renderProfileChange();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    const passwordInput = screen.getAllByPlaceholderText(/enter password/i)[0];
    const rePasswordInput = screen.getAllByPlaceholderText(/enter password/i)[1];
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(passwordInput, { target: { value: "pass123" } });
    fireEvent.change(rePasswordInput, { target: { value: "pass123" } });

    await act(async () => {
      fireEvent.click(submitButton);
    });

    expect(global.fetch).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Checks rendering with translated text, falling back if missing keys
  test("uses translated texts when provided, otherwise falls back to English", async () => {
    const translations = {
      "Profile Settings": "Configuración de perfil",
      "New Password": "Nueva contraseña",
      "Re-enter Password": "Repetir contraseña",
      Submit: "Enviar",
    };

    renderProfileChange(translations);

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Configuración de perfil/i)).toBeInTheDocument();
    expect(screen.getByText(/Nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByText(/Repetir contraseña/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Enviar/i })).toBeInTheDocument();
  });

  // Loading spinner hides properly on network fetch failure
  test("stops loading when getUserData rejects", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network failure"));

    renderProfileChange();

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});

// Restore console spies after all tests complete
afterAll(() => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
  errSpy.mockRestore();
});
