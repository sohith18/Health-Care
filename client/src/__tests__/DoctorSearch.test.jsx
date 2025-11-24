import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DoctorSearch from "../components/DoctorSearch";
import { TranslationContext } from "../store/TranslationContext";

// Stub DoctorsInfo component to display count of doctorsData for test assertions
jest.mock("../components/DoctorsInfo", () => (props) => (
  <div data-testid="doctors-count">{props.doctorsData?.length ?? 0}</div>
));

// Mock window.scrollTo to avoid errors during tests since it’s not implemented in test environment
beforeAll(() => {
  Object.defineProperty(window, "scrollTo", {
    value: jest.fn(),
    writable: true,
  });
});

// Spy on console methods to silence logs during tests and enable assertions if needed
const logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});

describe("DoctorSearch", () => {
  // Before each test, mock localStorage.getItem to return a dummy AuthToken
  beforeEach(() => {
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => {
        if (k === "AuthToken") return "DUMMY_TOKEN";
        return null;
      });
  });

  // Restore all mocks and clear fetch mocks after each test for isolation
  afterEach(() => {
    jest.restoreAllMocks();
    if (global.fetch?.mockClear) global.fetch.mockClear();
  });

  // Helper to render DoctorSearch inside MemoryRouter and with optional translated text context
  function renderAt(url = "/doctor-search", translatedTexts = {}) {
    return render(
      <MemoryRouter initialEntries={[url]}>
        <TranslationContext.Provider value={{ translatedTexts }}>
          <Routes>
            <Route path="/doctor-search" element={<DoctorSearch />} />
          </Routes>
        </TranslationContext.Provider>
      </MemoryRouter>
    );
  }

  // Test that initial fetch body is correctly constructed from URL search params on mount
  test("uses initial URL search params for first fetch body", async () => {
    const initialUrl =
      "/doctor-search?name=Alice&gender=Female&experience=5&specialization=Cardiology";
    const doctors = [
      { _id: "d1", name: "Dr. Alice" },
      { _id: "d2", name: "Dr. Bob" },
    ];
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ doctors }),
    });

    renderAt(initialUrl);

    // Wait for the initial fetch call after component mounts
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Validate fetch POST body correctly includes URL parameters
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body).toEqual({
      name: "Alice",
      gender: "Female",
      experience: "5",
      specialization: "Cardiology",
    });
  });

  // Test that typing a name and clicking search triggers a new fetch with updated params
  test("typing name and clicking search triggers new fetch with updated params", async () => {
    const first = [{ _id: "d1", name: "Dr. A" }];
    const second = [{ _id: "d2", name: "Dr. Z" }];

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ doctors: first }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ doctors: second }),
      });

    renderAt("/doctor-search", {
      "Search Doctors": "Search Doctors",
      Search: "Search",
    });

    // Wait for first fetch to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Update input state with new name
    fireEvent.change(screen.getByPlaceholderText(/search doctors/i), {
      target: { value: "Zane" },
    });

    // Click search icon to trigger new search
    const icon = screen.getByAltText(/search/i);
    fireEvent.click(icon);

    // Wait for second fetch to occur with new params
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Validate second fetch body reflects updated search state
    const body2 = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(body2).toEqual({
      name: "Zane",
      gender: "",
      experience: "",
      specialization: "",
    });

    // Confirm stubbed DoctorsInfo shows expected count of doctors (1)
    expect(screen.getByTestId("doctors-count")).toHaveTextContent("1");
  });

  // Test French translations replace placeholders and alt text correctly
  test("renders French placeholder and alt text from translatedTexts instead of fallbacks", async () => {
    const doctors = [{ _id: "d1", name: "Dr. A" }];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ doctors }),
    });

    const frenchTexts = {
      "Search Doctors": "Rechercher des médecins",
      Search: "Rechercher",
    };

    renderAt("/doctor-search", frenchTexts);

    // Input placeholder should be the French translation
    const input = screen.getByPlaceholderText("Rechercher des médecins");
    expect(input).toBeInTheDocument();

    // Search icon alt text should be French
    const icon = screen.getByAltText("Rechercher");
    expect(icon).toBeInTheDocument();

    // Simulate typing and clicking search, fetch should be called
    fireEvent.change(input, { target: { value: "Alice" } });
    fireEvent.click(icon);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  // Test French translations render on filter labels and options
  test("renders French labels for filters (Search By, Gender, options, etc.)", async () => {
    const doctors = [];
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ doctors }),
    });

    const frenchTexts = {
      "Search By": "Rechercher par",
      Gender: "Sexe",
      "Select Gender": "Sélectionner le sexe",
      Male: "Homme",
      Female: "Femme",
      Experience: "Expérience",
      "Select Experience": "Sélectionner l'expérience",
      "1+ years": "1+ ans",
      "5+ years": "5+ ans",
      "10+ years": "10+ ans",
      Specialization: "Spécialité",
      "Select Specialization": "Sélectionner la spécialité",
      Cardiology: "Cardiologie",
      Neurology: "Neurologie",
      "Orthopedic Surgery": "Chirurgie orthopédique",
      Pediatrics: "Pédiatrie",
      Psychiatry: "Psychiatrie",
      Dermatology: "Dermatologie",
      "Internal Medicine": "Médecine interne",
      Orthodontics: "Orthodontie",
      "Loading...": "Chargement...",
    };

    renderAt("/doctor-search", frenchTexts);

    // Verify translated text appears in various labels and options
    expect(screen.getByText("Rechercher par")).toBeInTheDocument();
    expect(screen.getByText("Sexe")).toBeInTheDocument();

    const genderSelect = screen.getByRole("combobox", { name: /Sexe/i });
    expect(genderSelect).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Sélectionner le sexe" })
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Homme" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Femme" })).toBeInTheDocument();

    expect(screen.getByText("Expérience")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Sélectionner l'expérience" })
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "1+ ans" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "5+ ans" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "10+ ans" })).toBeInTheDocument();

    expect(screen.getByText("Spécialité")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Sélectionner la spécialité" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Cardiologie" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Neurologie" })
    ).toBeInTheDocument();
  });

  // Tests fallback to English text when translation keys are missing
  test("falls back to English text when translation key is missing", async () => {
    const doctors = [];
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ doctors }),
    });

    // Provide only some translations, omit others intentionally
    const partialFrenchTexts = {
      "Search Doctors": "Rechercher des médecins",
      // Missing "Search"
    };

    renderAt("/doctor-search", partialFrenchTexts);

    // Placeholder text should use available French translation
    expect(
      screen.getByPlaceholderText("Rechercher des médecins")
    ).toBeInTheDocument();

    // Alt attribute falls back to English since translation is missing
    expect(screen.getByAltText("search")).toBeInTheDocument();
  });

  // Test that empty or missing "name" URL param results in empty string in request body
  test("does not send unexpected default name when URL has no name param", async () => {
    const doctors = [];
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ doctors }),
    });

    // URL without "name" search param
    renderAt("/doctor-search");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Validate fetch body has empty string for name key
    const body = JSON.parse(global.fetch.mock.calls[0][1].body);
    expect(body.name).toBe("");
  });

  // Test fetch call configuration for doctor API: URL, POST method, JSON headers, AuthToken
  test("calls correct doctor API with POST, JSON headers and AuthToken", async () => {
    const doctors = [];
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ doctors }),
    });

    renderAt("/doctor-search");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const [url, options] = global.fetch.mock.calls[0];

    expect(url).toBe("http://localhost:3000/doctor");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer DUMMY_TOKEN");
  });

  // Tests handleSearch filters only include fields with non-empty values in request body
  test("handleSearch only includes non-empty filters in request body", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ doctors: [] }),
    });

    renderAt("/doctor-search");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Type name and specialization; leave gender and experience empty
    fireEvent.change(screen.getByPlaceholderText(/search doctors/i), {
      target: { value: "Alice" },
    });

    fireEvent.change(screen.getByLabelText(/Specialization/i), {
      target: { value: "Cardiology" },
    });

    // Click search button
    fireEvent.click(screen.getByAltText(/search/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const options = global.fetch.mock.calls[1][1];
    const body = JSON.parse(options.body);

    // Assert only non-empty filters are included with correct values
    expect(body.name).toBe("Alice");
    expect(body.specialization).toBe("Cardiology");

    // Empty fields should be empty strings
    expect(body.gender).toBe("");
    expect(body.experience).toBe("");
  });

  // Confirm specialties in the select dropdown include literals like Pediatrics, Psychiatry, Internal Medicine
  test("renders all built-in specialties with correct labels", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ doctors: [] }),
    });

    renderAt("/doctor-search");

    const select = screen.getByLabelText(/Specialization/i);

    expect(
      screen.getByRole("option", { name: "Pediatrics" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Psychiatry" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Internal Medicine" })
    ).toBeInTheDocument();

    // Confirm select contains these options
    expect(select).toContainElement(
      screen.getByRole("option", { name: "Pediatrics" })
    );
  });

  // Tests that changing filters updates fetch body accordingly on search
  test("changing gender, experience and specialization updates fetch body", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ doctors: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ doctors: [] }),
      });

    renderAt("/doctor-search");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Change gender, experience, and specialization fields
    fireEvent.change(screen.getByLabelText(/Gender/i), {
      target: { value: "Female" },
    });
    fireEvent.change(screen.getByLabelText(/Experience/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/Specialization/i), {
      target: { value: "Neurology" },
    });

    // Trigger search
    fireEvent.click(screen.getByAltText(/search/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const body = JSON.parse(global.fetch.mock.calls[1][1].body);
    expect(body.gender).toBe("Female");
    expect(body.experience).toBe("5");
    expect(body.specialization).toBe("Neurology");
  });
});

// Restore all console spies after all tests finish
afterAll(() => {
  logSpy.mockRestore();
  warnSpy.mockRestore();
  errSpy.mockRestore();
});
