import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DoctorDetails from "../components/DoctorDetails";
import { TranslationContext } from "../store/TranslationContext";

// Mock the translation module to avoid real API calls during tests
jest.mock("../Controllers/Translation", () => ({
  translation: jest.fn(async (text, lang) => text),
}));

describe("DoctorDetails", () => {
  // Setup mocks before each test: localStorage.getItem and window.alert
  beforeEach(() => {
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => {
        if (k === "AuthToken") return "DUMMY_TOKEN";
        return null;
      });
    window.alert = jest.fn();
  });

  // Restore all mocks after each test for clean isolation
  afterEach(() => {
    jest.restoreAllMocks();
    if (global.fetch?.mockClear) global.fetch.mockClear();
  });

  // Utility function to render DoctorDetails at a specific route with optional translations
  function renderAtPath(path = "/doctor/abc123", translatedTexts = {}) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <TranslationContext.Provider value={{ translatedTexts }}>
          <Routes>
            <Route path="/doctor/:id" element={<DoctorDetails />} />
          </Routes>
        </TranslationContext.Provider>
      </MemoryRouter>
    );
  }

  // Test that DoctorDetails shows loading state, then renders doctor details after fetch
  test("shows loading then renders fetched doctor details", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: ["MBBS", "MD"],
      specializations: ["Cardiology"],
      experience: 7,
      description: "Expert cardiologist",
      profile_picture: "",
      slots: [
        { _id: "s1", timeInterval: "9am - 10am", capacity: 5 },
        { _id: "s2", timeInterval: "10am - 11am", capacity: 0 },
      ],
    };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    renderAtPath("/doctor/doc-1");

    // Assert loading text appears initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for doctor name to appear after fetch resolves
    await waitFor(() => {
      expect(screen.getByText(/dr\. alice/i)).toBeInTheDocument();
    });

    // Assert summary fields are rendered
    expect(screen.getByText(/qualifications:/i)).toBeInTheDocument();
    expect(screen.getByText(/mbbs, md/i)).toBeInTheDocument();
    expect(screen.getByText(/cardiology/i)).toBeInTheDocument();
    expect(screen.getByText(/expert cardiologist/i)).toBeInTheDocument();

    // Assert slot buttons are enabled/disabled based on capacity
    const enabledBtn = screen.getByRole("button", { name: /9am - 10am/i });
    const disabledBtn = screen.getByRole("button", { name: /10am - 11am/i });
    expect(enabledBtn).toBeEnabled();
    expect(disabledBtn).toBeDisabled();
  });

  // Test that clicking a time slot books an appointment and triggers alert
  test("clicking a time books appointment via PUT /booking and alerts", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: [],
      specializations: [],
      experience: 1,
      description: "",
      profile_picture: "",
      slots: [{ _id: "s1", timeInterval: "9am - 10am", capacity: 2 }],
    };
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doctors: [doctor] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ msg: "Booking confirmed" }),
      });

    renderAtPath("/doctor/doc-1", {
      "Appointment booked at": "Appointment booked at",
      with: "with",
    });

    // Wait for doctor to load, then click time slot button
    await screen.findByText(/dr\. alice/i);
    const btn = await screen.findByRole("button", { name: /9am - 10am/i });
    fireEvent.click(btn);

    // Wait for fetch calls to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const [, putCall] = global.fetch.mock.calls;
    const [url, options] = putCall;

    // Assert PUT request is made with correct URL, method, headers, and body
    expect(url).toMatch(/\/booking$/);
    expect(options.method).toBe("PUT");
    expect(JSON.parse(options.body)).toEqual({ doctorID: "doc-1", slotID: "s1" });
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer DUMMY_TOKEN");

    // Assert alert is shown on success
    expect(window.alert).toHaveBeenCalled();
  });

  // Test that translated loading text is shown when provided in context
  test("uses translated loading text when provided", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: [],
      specializations: [],
      experience: 1,
      description: "",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    renderAtPath("/doctor/doc-1", {
      "Loading...": "Cargando...",
    });

    // Assert translated loading text appears
    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();

    // Wait for doctor name to appear after fetch resolves
    await screen.findByText(/dr\. alice/i);
  });

  // Test that default loading text is shown when translation is missing
  test("falls back to default loading when translation missing", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: [],
      specializations: [],
      experience: 1,
      description: "",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    // Render without translation for "Loading..."
    renderAtPath("/doctor/doc-1", {});

    // Assert default loading text appears
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    // Wait for doctor name to appear after fetch resolves
    await screen.findByText(/dr\. alice/i);
  });

  // Test that translated labels and N/A fallbacks are used for missing doctor fields
  test("uses translated labels and N/A fallbacks for missing doctor fields", async () => {
    const doctor = {
      _id: "doc-1",
      name: "",
      qualifications: null,
      specializations: null,
      experience: null,
      description: "",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    const translatedTexts = {
      "Unknown Doctor": "Médico desconocido",
      "Qualifications:": "Calificaciones:",
      "Specializations:": "Especializaciones:",
      "Experience:": "Experiencia:",
      "Description:": "Descripción:",
      "N/A": "No disponible",
      years: "años",
      "Available Timings": "Horarios disponibles",
      "No available times": "Sin horarios",
    };

    renderAtPath("/doctor/doc-1", translatedTexts);

    // Wait for doctor to load
    await screen.findByText(/Médico desconocido/i);

    // Assert translated labels are rendered
    expect(screen.getByText(/Calificaciones:/i)).toBeInTheDocument();
    expect(screen.getByText(/Especializaciones:/i)).toBeInTheDocument();
    expect(screen.getByText(/Experiencia:/i)).toBeInTheDocument();
    expect(screen.getByText(/Descripción:/i)).toBeInTheDocument();

    // Assert N/A fallbacks are rendered
    expect(screen.getAllByText(/No disponible/i).length).toBeGreaterThanOrEqual(3);

    // Assert translated "years" is rendered
    expect(screen.getByText(/años/i)).toBeInTheDocument();

    // Assert translated available timings header and empty state text
    expect(screen.getByText(/Horarios disponibles/i)).toBeInTheDocument();
    expect(screen.getByText(/Sin horarios/i)).toBeInTheDocument();
  });

  // Test that English labels are used when translations are missing
  test("falls back to English labels when translations missing", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Bob",
      qualifications: ["MBBS"],
      specializations: ["Dermatology"],
      experience: 3,
      description: "Skin specialist",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    // Render with unrelated translation keys
    renderAtPath("/doctor/doc-1", {
      foo: "bar",
    });

    // Wait for doctor to load
    await screen.findByText(/dr\. bob/i);

    // Assert English labels are rendered
    expect(screen.getByText(/Qualifications:/i)).toBeInTheDocument();
    expect(screen.getByText(/Specializations:/i)).toBeInTheDocument();
    expect(screen.getByText(/Experience:/i)).toBeInTheDocument();
    expect(screen.getByText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Timings/i)).toBeInTheDocument();
    expect(screen.getByText(/No available times/i)).toBeInTheDocument();
  });

  // Test that translated booking summary text is shown in alert after successful booking
  test("uses translated booking summary text in alert after successful booking", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: [],
      specializations: [],
      experience: 1,
      description: "",
      profile_picture: "",
      slots: [{ _id: "s1", timeInterval: "9am - 10am", capacity: 2 }],
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doctors: [doctor] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ msg: "Booking confirmed" }),
      });

    const translatedTexts = {
      "Appointment booked at": "Cita reservada a las",
      with: "con",
    };

    renderAtPath("/doctor/doc-1", translatedTexts);

    // Wait for doctor to load
    await screen.findByText(/dr\. alice/i);

    // Click time slot button
    const btn = await screen.findByRole("button", { name: /9am - 10am/i });
    fireEvent.click(btn);

    // Wait for fetch calls to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Assert translated booking summary alert is shown
    const alertCalls = window.alert.mock.calls.map((c) => String(c[0]));
    const summaryCall = alertCalls.find((msg) =>
      msg.includes("Cita reservada a las 9am - 10am con Dr. Alice")
    );
    expect(summaryCall).toBeDefined();
  });

  // Test that booking summary alert is shown even when translation keys are missing
  test("booking summary alert is shown even when translation keys missing", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: [],
      specializations: [],
      experience: 1,
      description: "",
      profile_picture: "",
      slots: [{ _id: "s1", timeInterval: "9am - 10am", capacity: 2 }],
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ doctors: [doctor] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ msg: "Booking confirmed" }),
      });

    // Render without translation keys for booking summary
    renderAtPath("/doctor/doc-1", {});

    // Wait for doctor to load
    await screen.findByText(/dr\. alice/i);

    // Click time slot button
    const btn = await screen.findByRole("button", { name: /9am - 10am/i });
    fireEvent.click(btn);

    // Wait for fetch calls to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Assert alert is shown with time and doctor name
    const alertCalls = window.alert.mock.calls.map((c) => String(c[0]));
    expect(alertCalls).toContain("Booking confirmed");
    const lastAlert = alertCalls[alertCalls.length - 1];
    expect(lastAlert).toContain("9am - 10am");
    expect(lastAlert).toContain("Dr. Alice");
  });

  // Test that /doctor endpoint is called with correct URL, method, headers, and body
  test("calls /doctor with correct URL, POST, headers, body and AuthToken", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: [],
      specializations: [],
      experience: 1,
      description: "",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    renderAtPath("/doctor/doc-1");

    // Wait for doctor to load
    await screen.findByText(/dr\. alice/i);

    // Assert fetch is called once with correct URL, method, headers, and body
    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("http://localhost:3000/doctor");
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer DUMMY_TOKEN");
    const parsedBody = JSON.parse(options.body);
    expect(parsedBody).toEqual({ id: "doc-1" });
  });

  // Test that error is logged when doctor fetch response is not ok
  test("logs error when doctor fetch response is not ok", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    renderAtPath("/doctor/doc-1");

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to fetch doctor details:",
        500
      );
    });

    consoleSpy.mockRestore();
  });

  // Test that error is logged when doctor fetch throws
  test("logs error when doctor fetch throws", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    global.fetch = jest.fn().mockRejectedValueOnce(new Error("network error"));

    renderAtPath("/doctor/doc-1");

    // Wait for error to be logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching doctors data:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });

  // Test that placeholder image and default alt are used when doctor photo and name are missing
  test("uses placeholder image and default alt when doctor photo and name missing", async () => {
    const doctor = {
      _id: "doc-1",
      name: "",
      qualifications: [],
      specializations: [],
      experience: 1,
      description: "",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    renderAtPath("/doctor/doc-1", {});

    // Wait for doctor to load
    await screen.findByText("Unknown Doctor");

    // Assert placeholder image and default alt are used
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://via.placeholder.com/150");
    expect(img).toHaveAttribute("alt", "Doctor");
  });

  // Test that "Unknown Doctor" and "N/A" are used when fields are missing and no translations
  test("falls back to Unknown Doctor and N/A when fields missing and no translations", async () => {
    const doctor = {
      _id: "doc-1",
      name: "",
      qualifications: null,
      specializations: null,
      experience: null,
      description: "",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    // Render without translations
    renderAtPath("/doctor/doc-1", {});

    // Wait for doctor to load
    await screen.findByText("Unknown Doctor");

    // Assert N/A fallbacks are rendered
    const naElements = screen.getAllByText("N/A");
    expect(naElements.length).toBeGreaterThanOrEqual(3);

    // Assert experience line contains "N/A years"
    const experienceLine = screen
      .getByText(/Experience:/i)
      .parentElement.textContent;
    expect(experienceLine).toContain("N/A");
    expect(experienceLine).toContain("years");
  });

  // Test that specializations are joined with comma and space
  test("renders specializations joined with comma and space", async () => {
    const doctor = {
      _id: "doc-1",
      name: "Dr. Alice",
      qualifications: [],
      specializations: ["Cardiology", "Neurology"],
      experience: 5,
      description: "",
      profile_picture: "",
      slots: [],
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ doctors: [doctor] }),
    });

    renderAtPath("/doctor/doc-1", {});

    // Wait for doctor to load
    await screen.findByText(/dr\. alice/i);

    // Assert specializations are joined with comma and space
    const specText = screen.getByText("Cardiology, Neurology");
    expect(specText).toBeInTheDocument();
  });
});
