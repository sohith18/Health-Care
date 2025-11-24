import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfileDropdown from "../components/ProfileDropDown";
import { TranslationContext } from "../store/TranslationContext";

// Mock react-router-dom's useNavigate hook to intercept and verify navigation calls
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render ProfileDropdown inside routing and translation contexts with configurable props
function renderDropdown({
  route = "/",
  translatedTexts = {},
  handleDisplalog_out_name = jest.fn(),
} = {}) {
  return render(
    <TranslationContext.Provider value={{ translatedTexts }}>
      <MemoryRouter initialEntries={[route]}>
        <ProfileDropdown handleDisplalog_out_name={handleDisplalog_out_name} />
      </MemoryRouter>
    </TranslationContext.Provider>
  );
}

describe("ProfileDropdown", () => {
  let getItemSpy;
  let removeItemSpy;

  // Setup mocks for localStorage, fetch and clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    getItemSpy = jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => (k === "AuthToken" ? "DUMMY_TOKEN" : null));

    removeItemSpy = jest
      .spyOn(window.localStorage.__proto__, "removeItem")
      .mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { role: "PATIENT", name: "Alice" } }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  // Renders profile button with translation and ensures dropdown closed by default
  test("renders Profile button with translated label and closed dropdown by default", () => {
    renderDropdown({
      route: "/",
      translatedTexts: { Profile: "Perfil" },
    });

    expect(
      screen.getByRole("button", { name: /Perfil/i })
    ).toBeInTheDocument();

    expect(screen.queryByText(/Profile Settings/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
  });

  // Dropdown shows loading spinner when opened on profile routes
  test("dropdown is active on profile routes (path-based isActive)", async () => {
    renderDropdown({ route: "/profile-change" });

    await waitFor(() =>
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
    );
  });

  // Fetches user data with AuthToken and correct headers
  test("fetches user data with AuthToken and correct headers", async () => {
    renderDropdown({ route: "/profile-change" });

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [url, options] = global.fetch.mock.calls[0];

    expect(url).toBe("http://localhost:3000/user");
    expect(options).toMatchObject({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer DUMMY_TOKEN",
      },
    });
  });

  // Profile link points to doctor route on doctor role user
  test("profile link points to doctor route when user role is DOCTOR", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: "DOCTOR", name: "Doc" } }),
    });

    renderDropdown({ route: "/profile-change" });

    await waitFor(() =>
      expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument()
    );

    const profileLink = screen.getByRole("link", {
      name: /Profile Settings/i,
    });

    expect(profileLink.getAttribute("href")).toBe("/profile-change-doctor");
  });

  // Profile link points to patient route when user is not a doctor
  test("profile link points to patient route when user role is not DOCTOR", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: "PATIENT", name: "Pat" } }),
    });

    renderDropdown({ route: "/profile-change" });

    await waitFor(() =>
      expect(screen.getByText(/Profile Settings/i)).toBeInTheDocument()
    );

    const profileLink = screen.getByRole("link", {
      name: /Profile Settings/i,
    });

    expect(profileLink.getAttribute("href")).toBe("/profile-change");
  });

  // Shows Loading... message when dropdown expanded but user data is not yet loaded
  test("shows Loading... when dropdown expanded but userData not yet available", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ user: { role: "PATIENT" } }), 50)
        ),
    });

    renderDropdown({ route: "/" });

    const button = screen.getByRole("button", { name: /Profile/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
    );
  });

  // Ensures no fetch occurs when no AuthToken present
  test("does not call fetch when AuthToken is missing", async () => {
    getItemSpy.mockImplementation(() => null);

    renderDropdown({ route: "/profile-change" });

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  // Logout link clears local storage AuthToken, triggers handler and navigates home
  test("logout link clears AuthToken, calls handler, and navigates home", async () => {
    const logoutHandler = jest.fn();

    renderDropdown({
      route: "/profile-change",
      translatedTexts: { Logout: "Logout" },
      handleDisplalog_out_name: logoutHandler,
    });

    await waitFor(() =>
      expect(screen.getByText(/Logout/i)).toBeInTheDocument()
    );

    const logoutLink = screen.getByRole("link", { name: /Logout/i });
    fireEvent.click(logoutLink);

    expect(logoutHandler).toHaveBeenCalled();
    expect(removeItemSpy).toHaveBeenCalledWith("AuthToken");
    expect(mockNavigate).toHaveBeenCalledWith("/");
    // window.location.reload cannot be reliably tested in JSDOM, skipped here
  });

  // Verifies use of translated profile dropdown labels
  test("uses translated texts for Profile, Profile Settings and Logout", async () => {
    const translations = {
      Profile: "Perfil",
      "Profile Settings": "Configuración de perfil",
      Logout: "Cerrar sesión",
    };

    renderDropdown({
      route: "/profile-change",
      translatedTexts: translations,
    });

    expect(
      screen.getByRole("button", { name: /Perfil/i })
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText(/Configuración de perfil/i)).toBeInTheDocument()
    );

    expect(
      screen.getByRole("link", { name: /Cerrar sesión/i })
    ).toBeInTheDocument();
  });

  // Gracefully handles error in fetching user data without crashing
  test("handles error in getUserData: userData stays null and isFetching becomes false", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network failure"));

    renderDropdown({ route: "/profile-change" });

    await waitFor(() =>
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
    );

    expect(global.fetch).toHaveBeenCalled();
  });
});
