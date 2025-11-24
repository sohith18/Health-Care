import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DoctorProfileChange from "../components/ProfileChangeDoctor";
import { TranslationContext } from "../store/TranslationContext";

// Mock useNavigate hook to simulate and verify navigation without changing route history
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock translation function to return input text for simplicity
jest.mock("../Controllers/Translation", () => ({
  translation: jest.fn(async (text, lang) => text),
}));

// Helper to render the component within routing and translation context
function renderDoctorProfile(translatedTexts = {}) {
  return render(
    <MemoryRouter>
      <TranslationContext.Provider value={{ translatedTexts }}>
        <DoctorProfileChange />
      </TranslationContext.Provider>
    </MemoryRouter>
  );
}

describe("DoctorProfileChange", () => {
  let getItemSpy;

  // Set up mocks for localStorage and fetch before each test
  beforeEach(() => {
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => {
        if (k === "AuthToken") return "DUMMY_TOKEN";
        return null;
      });
    window.alert = jest.fn();

    // Mock typical GET /user response and PUT /doctor response
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            qualifications: ["MBBS"],
            specializations: ["Cardiology"],
            experience: "5",
            description: "Seasoned cardiologist",
            gender: "Male",
            slots: [
              {
                timeInterval: "9am - 12pm",
                capacity: 10,
                isAvailable: true,
                _id: "s1",
              },
            ],
          },
        }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({ msg: "Updated" }),
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test loading doctor data and populating form fields
  test("loads doctor data from /user and populates form using parseSlot", async () => {
    renderDoctorProfile({
      "Doctor Profile Settings": "Doctor Profile Settings",
      Qualification: "Qualification",
      Specialization: "Specialization",
      "Available Slots": "Available Slots",
    });

    // Expect loading indicator initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait until form fields are populated
    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });

    // Check fetch request and headers
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("http://localhost:3000/user");
    expect(options.method).toBe("GET");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer DUMMY_TOKEN");

    // Validate input fields are filled with correct data
    expect(
      screen.getByPlaceholderText(/enter qualification/i)
    ).toHaveValue("MBBS");
    expect(
      screen.getByPlaceholderText(/enter experience/i)
    ).toHaveValue(5);
    expect(
      screen.getByPlaceholderText(/enter a brief description/i)
    ).toHaveValue("Seasoned cardiologist");
    expect(screen.getByDisplayValue("Male")).toBeInTheDocument();

    // Check specialization checkbox
    const cardioCheckbox = screen.getByLabelText(/cardiology/i);
    expect(cardioCheckbox).toBeChecked();

    // Check slot inputs
    const startInput = screen.getByPlaceholderText(/starting time/i);
    const endInput = screen.getByPlaceholderText(/ending time/i);
    const capacityInput = screen.getByPlaceholderText(/capacity/i);
    expect(startInput).toHaveValue("9am");
    expect(endInput).toHaveValue("12pm");
    expect(capacityInput).toHaveValue(10);
    const availableCheckbox = screen.getByLabelText(/available/i);
    expect(availableCheckbox).toBeChecked();
  });

  // Test handling non-OK or error responses from fetch
  test("handles non-OK and error responses when fetching doctor data", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    // Non-OK response
    global.fetch.mockReset();
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ user: { role: "DOCTOR" } }),
    });
    renderDoctorProfile();

    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });
    // Because ok is false, form should not be populated
    expect(
      screen.getByPlaceholderText(/enter qualification/i)
    ).toHaveValue("");

    // Rejected fetch simulating network error
    global.fetch.mockReset();
    global.fetch.mockRejectedValue(new Error("network fail"));

    renderDoctorProfile();

    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });

    expect(errorSpy).toHaveBeenCalled();
    const [[msg]] = errorSpy.mock.calls;
    expect(msg).toContain("Error fetching doctor data:");

    errorSpy.mockRestore();
  });

  // Test toggling specializations with expected French label fallbacks
  test("toggles specializations and respects French specialization labels", async () => {
    renderDoctorProfile({
      Specialization: "Spécialisation",
      "Other Specialization": "Autre spécialisation",
    });
    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Spécialisation")).toBeInTheDocument();
    expect(
      screen.getByText("Autre spécialisation")
    ).toBeInTheDocument();

    const cardioCheckbox = screen.getByLabelText(/cardiology/i);
    expect(cardioCheckbox).toBeChecked();

    // Toggle checkbox off
    fireEvent.click(cardioCheckbox);
    expect(cardioCheckbox).not.toBeChecked();

    const dermCheckbox = screen.getByLabelText(/dermatology/i);
    fireEvent.click(dermCheckbox);
    expect(dermCheckbox).toBeChecked();
  });

  // Test slot addition, editing, toggling availability, and removal
  test("adds, edits, toggles availability and removes slots", async () => {
    renderDoctorProfile();

    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });

    const initialStart = screen.getByPlaceholderText(/starting time/i);
    expect(initialStart).toBeInTheDocument();

    // Add a new slot
    fireEvent.click(screen.getByRole("button", { name: /add slot/i }));
    const allStartInputs = screen.getAllByPlaceholderText(/starting time/i);
    expect(allStartInputs.length).toBe(2);

    // Fill in second slot details
    const secondSlotContainer = allStartInputs[1].closest("div");
    const start2 = within(secondSlotContainer).getByPlaceholderText(
      /starting time/i
    );
    const end2 = within(secondSlotContainer).getByPlaceholderText(
      /ending time/i
    );
    const cap2 = within(secondSlotContainer).getByPlaceholderText(/capacity/i);

    fireEvent.change(start2, { target: { value: "10am" } });
    fireEvent.change(end2, { target: { value: "1pm" } });
    fireEvent.change(cap2, { target: { value: "15" } });

    expect(start2).toHaveValue("10am");
    expect(end2).toHaveValue("1pm");
    expect(cap2).toHaveValue(15);

    // Toggle availability checkbox
    const availCheckbox = within(
      secondSlotContainer
    ).getByLabelText(/available/i);
    fireEvent.click(availCheckbox);
    expect(availCheckbox).not.toBeChecked();

    // Remove the first slot
    const removeButtons = screen.getAllByRole("button", {
      name: /remove slot/i,
    });
    fireEvent.click(removeButtons[0]);
    // Verify only one slot remains
    expect(
      screen.getAllByPlaceholderText(/starting time/i).length
    ).toBe(1);
    expect(
      screen.getByPlaceholderText(/starting time/i)
    ).toHaveValue("10am");
  });

  // Test form submission for profile update, including payload format and navigation
  test("submits formatted payload via /doctor and navigates to /doctor-home", async () => {
    global.fetch.mockReset();
    global.fetch
      // GET /user response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            qualifications: [],
            specializations: [],
            experience: "",
            description: "",
            gender: "",
            slots: [],
          },
        }),
      })
      // PUT /doctor update response
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ msg: "Updated" }),
      });

    renderDoctorProfile();

    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });

    // Fill form fields
    fireEvent.change(
      screen.getByPlaceholderText(/enter qualification/i),
      { target: { value: "MS Ortho" } }
    );
    fireEvent.click(screen.getByLabelText(/orthopedic surgery/i));
    fireEvent.click(screen.getByLabelText(/pediatrics/i));
    fireEvent.change(
      screen.getByPlaceholderText(/enter other specialization/i),
      { target: { value: "Sports Medicine" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(/enter experience/i),
      { target: { value: "8" } }
    );
    fireEvent.change(
      screen.getByPlaceholderText(/enter a brief description/i),
      { target: { value: "Orthopedic specialist" } }
    );
    fireEvent.change(
      screen.getByRole("combobox", { name: /gender/i }),
      { target: { value: "Male" } }
    );

    // Add a slot
    fireEvent.click(screen.getByRole("button", { name: /add slot/i }));
    const start = screen.getByPlaceholderText(/starting time/i);
    const end = screen.getByPlaceholderText(/ending time/i);
    const cap = screen.getByPlaceholderText(/capacity/i);
    fireEvent.change(start, { target: { value: "10am" } });
    fireEvent.change(end, { target: { value: "1pm" } });
    fireEvent.change(cap, { target: { value: "25" } });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    const putCall = global.fetch.mock.calls[1];
    expect(putCall[0]).toBe("http://localhost:3000/doctor");
    expect(putCall[1].method).toBe("PUT");
    expect(putCall[1].headers["Content-Type"]).toBe("application/json");
    expect(putCall[1].headers.Authorization).toBe("Bearer DUMMY_TOKEN");
    const sentBody = JSON.parse(putCall[1].body);

    // Slots array should include the added slot with proper timeInterval and capacity
    expect(sentBody.slots[0]).toMatchObject({
      timeInterval: "10am - 1pm",
      capacity: 25,
      isAvailable: true,
    });
    // Other specialization should be empty string if not set
    expect(sentBody.otherSpecialization).toBe("");

    // Verify navigation to /doctor-home after successful update
    expect(mockNavigate).toHaveBeenCalledWith("/doctor-home");
  });

  // Test update guard: no API call if token missing; show failure alert
  test("handleUpdateDoctor respects AuthToken guard and shows failure alert when update fails", async () => {
    global.fetch.mockReset();
    // Mock getItem to return null for AuthToken
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => {
        if (k === "AuthToken") return null;
        return null;
      });

    renderDoctorProfile();

    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });

    // Click submit without token should not trigger fetch
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    expect(global.fetch).not.toHaveBeenCalled();

    // Now restore token and simulate failed update response
    jest.restoreAllMocks();
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => {
        if (k === "AuthToken") return "DUMMY_TOKEN";
        return null;
      });
    window.alert = jest.fn();

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: {
            qualifications: [],
            specializations: [],
            experience: "",
            description: "",
            gender: "",
            slots: [],
          },
        }),
      })
      // Simulate failed update response
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ msg: "" }),
      });

    renderDoctorProfile();

    await waitFor(() => {
      expect(
        screen.getByText(/doctor profile settings/i)
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(window.alert).toHaveBeenCalledWith("Failed to update");
  });

  // Test handling of plain string slots via parseSlot
  test("handles plain string slot via parseSlot", async () => {
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          qualifications: [],
          specializations: [],
          experience: "",
          description: "",
          gender: "",
          slots: ["7am - 9am"],
        },
      }),
    });

    renderDoctorProfile();

    // Validate timeInterval parsed into start and end inputs
    const start = await screen.findByPlaceholderText(/starting time/i);
    const end = screen.getByPlaceholderText(/ending time/i);

    expect(start).toHaveValue("7am");
    expect(end).toHaveValue("9am");
  });
});
