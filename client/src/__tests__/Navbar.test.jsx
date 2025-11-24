import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TranslationContext } from "../store/TranslationContext";

// Stub dependent components used by Navbar for test isolation
jest.mock("../components/ProfileDropDown", () => () => <div>ProfileDropdownStub</div>);
jest.mock("../components/LanguageDropDown", () => (props) => (
  <button onClick={() => props.onLanguageChange("en")}>LangStub</button>
));

// Mock translation controller to avoid real API calls in tests
jest.mock("../Controllers/Translation", () => ({
  translation: jest.fn(async (text, lang) => text),
}));

// Utility to render Navbar with optional translation texts and language change handler within routing and context providers
function renderNavbar({ translatedTexts = {}, handleLanguageChange = jest.fn() } = {}) {
  return render(
    <TranslationContext.Provider value={{ translatedTexts, handleLanguageChange }}>
      <MemoryRouter initialEntries={["/"]}>
        <Navbar />
      </MemoryRouter>
    </TranslationContext.Provider>
  );
}

describe("Navbar (additional)", () => {
  afterEach(() => {
    // Restore mocks and clear fetch mocks to prevent test pollution
    jest.restoreAllMocks();
    if (global.fetch?.mockClear) global.fetch.mockClear();
  });

  // Validates authenticated PATIENT view: profile dropdown visible, login hidden, core links present
  test("authenticated PATIENT: shows ProfileDropdown and hides Login", async () => {
    jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((k) => {
      if (k === "AuthToken") return "DUMMY_TOKEN";
      return null;
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "PATIENT", name: "Alice" } }),
    });

    renderNavbar({
      translatedTexts: { Prescritions: "Prescriptions", "Video Call": "Video Call", Login: "Login" },
    });

    // Wait for ProfileDropdown stub to appear
    const profile = await screen.findByText(/ProfileDropdownStub/i);
    expect(profile).toBeInTheDocument();

    // Assert login link is hidden when user is authenticated
    expect(screen.queryByText(/login/i)).toBeNull();

    // Core links for patient should be visible
    expect(screen.getByText(/prescriptions/i)).toBeInTheDocument();
    expect(screen.getByText(/video call/i)).toBeInTheDocument();
  });

  // Validates authenticated DOCTOR view with appointments, login hidden, logo links to doctor home
  test("authenticated DOCTOR: shows Appointments, hides Login, and logo links to /doctor-home", async () => {
    jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((k) => {
      if (k === "AuthToken") return "DUMMY_TOKEN";
      return null;
    });
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "DOCTOR", name: "Dr X" } }),
    });

    renderNavbar({
      translatedTexts: { Appointments: "Appointments", Login: "Login" },
    });

    // Appointment menu item should be rendered
    const appt = await screen.findByText(/appointments/i);
    expect(appt).toBeInTheDocument();

    // Login should be hidden for authenticated doctor
    expect(screen.queryByText(/login/i)).toBeNull();

    // Logo link should point to /doctor-home for doctors
    const logoLink = screen.getByRole("link", { name: /company logo/i });
    expect(logoLink).toHaveAttribute("href", "/doctor-home");
  });

  // Verifies guest menu contains correct hrefs for navigation links
  test("guest menu has correct hrefs for logo, prescriptions, video call, login", () => {
    jest.spyOn(window.localStorage.__proto__, "getItem").mockReturnValue(null);
    global.fetch = jest.fn(); // No fetch expected without token

    renderNavbar({
      translatedTexts: {
        Prescritions: "Prescriptions",
        "Video Call": "Video Call",
        Login: "Login",
      },
    });

    // Logo link goes to home page
    const logo = screen.getByRole("link", { name: /company logo/i });
    expect(logo).toHaveAttribute("href", "/");

    // Prescriptions link goes to prescription history
    const prescriptions = screen.getByRole("link", { name: /prescriptions/i });
    expect(prescriptions).toHaveAttribute("href", "/prescription-history");

    // Video call link goes to video call page
    const video = screen.getByRole("link", { name: /video call/i });
    expect(video).toHaveAttribute("href", "/video-call");

    // Login link goes to login page
    const login = screen.getByRole("link", { name: /login/i });
    expect(login).toHaveAttribute("href", "/login");
  });

  // Checks that fetch call to /user includes Authorization header when token present
  test("with token, fetches /user with Authorization header", async () => {
    jest.spyOn(window.localStorage.__proto__, "getItem").mockImplementation((k) => {
      if (k === "AuthToken") return "DUMMY_TOKEN";
      return null;
    });
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "PATIENT", name: "Alice" } }),
    });
    global.fetch = fetchMock;

    renderNavbar();

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/user$/);
    expect(init.headers.Authorization).toBe("Bearer DUMMY_TOKEN");
  });
});
