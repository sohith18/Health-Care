import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Appointments from "../pages/Appointments"; // adjust path if needed

describe("Appointments", () => {
  let getItemSpy, alertSpy;

  // Setup mocks before each test: mock localStorage.getItem, window.alert, and fetch
  beforeEach(() => {
    getItemSpy = jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => (k === "AuthToken" ? "DUMMY_TOKEN" : null));

    alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    global.fetch = jest.fn();
  });

  // Restore all mocks after each test for clean slate
  afterEach(() => {
    jest.restoreAllMocks();
    if (global.fetch?.mockClear) global.fetch.mockClear();
  });

  // Utility function to render the Appointments component
  function renderAppointments() {
    return render(<Appointments />);
  }

  // Test loading state followed by correct display of fetched appointment and prescriptions
  test("shows loading, then renders hydrated appointment and prescriptions from GET /booking", async () => {
    const bookings = [
      {
        _id: "b1",
        patient: { name: "Alice", profile_picture: "" },
        doctor: { name: "Dr X" },
        slot: { timeInterval: "9am - 10am" },
        prescription: {
          comments: "Take with food",
          medicines: [
            { name: "MedA", details: "1 tablet" },
            { name: "MedB", details: "1 tablet" },
          ],
        },
      },
    ];

    // Mock successful fetch returning bookings
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ bookings }),
    });

    renderAppointments();

    // Assert loading text appears initially
    expect(
      screen.getByText(/loading appointments\.\.\./i)
    ).toBeInTheDocument();

    // Wait for booking patient name to appear after data hydration
    await waitFor(() => {
      expect(screen.getByText(/patient: alice/i)).toBeInTheDocument();
    });

    // Assert other booking details rendered
    expect(screen.getByText(/doctor: dr x/i)).toBeInTheDocument();
    expect(screen.getByText(/slot:/i)).toBeInTheDocument();

    // Assert prescription comments input is populated
    expect(screen.getByPlaceholderText(/add comments/i)).toHaveValue(
      "Take with food"
    );

    // Assert medicines inputs are populated with correct values
    const medNameInputs = screen.getAllByPlaceholderText(/medicine name/i);
    const medDetailInputs = screen.getAllByPlaceholderText(
      /details \(e\.g\., 1 tablet twice a day\)/i
    );
    expect(medNameInputs).toHaveLength(2);
    expect(medDetailInputs).toHaveLength(2);
    expect(medNameInputs[0]).toHaveValue("MedA");
    expect(medDetailInputs[0]).toHaveValue("1 tablet");
  });

  // Test filtering appointments by patient name through search input field
  test("filters appointments by patient name using the search input", async () => {
    const bookings = [
      {
        _id: "b1",
        patient: { name: "Alice", profile_picture: "" },
        doctor: { name: "Dr X" },
        slot: { timeInterval: "9am - 10am" },
        prescription: { comments: "", medicines: [] },
      },
      {
        _id: "b2",
        patient: { name: "Bob", profile_picture: "" },
        doctor: { name: "Dr Y" },
        slot: { timeInterval: "10am - 11am" },
        prescription: { comments: "", medicines: [] },
      },
    ];
    // Mock fetch returning two bookings
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ bookings }),
    });

    renderAppointments();

    // Wait until patient "Alice" is rendered initially
    await screen.findByText(/patient: alice/i);

    // Simulate typing "ali" in search box
    const searchBox = screen.getByPlaceholderText(/search patients/i);
    fireEvent.change(searchBox, { target: { value: "ali" } });

    // Assert that appointment for Alice is shown and Bob's is filtered out
    expect(screen.getByText(/patient: alice/i)).toBeInTheDocument();
    expect(screen.queryByText(/patient: bob/i)).toBeNull();
  });

  // Test adding, updating, and removing medicines locally in the form
  test("Add/Update/Remove medicines locally", async () => {
    const bookings = [
      {
        _id: "b1",
        patient: { name: "Alice", profile_picture: "" },
        doctor: { name: "Dr X" },
        slot: { timeInterval: "9am - 10am" },
        prescription: { comments: "", medicines: [] },
      },
    ];
    // Mock fetch returning one booking
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ bookings }),
    });

    renderAppointments();

    // Wait for patient Alice to appear
    await screen.findByText(/patient: alice/i);

    // Simulate clicking "add medicine" button
    fireEvent.click(screen.getByRole("button", { name: /add medicine/i }));

    // Assert that one medicine input pair is added
    let medNames = screen.getAllByPlaceholderText(/medicine name/i);
    let medDetails = screen.getAllByPlaceholderText(
      /details \(e\.g\., 1 tablet twice a day\)/i
    );
    expect(medNames).toHaveLength(1);
    expect(medDetails).toHaveLength(1);

    // Simulate updating medicine name and details inputs
    fireEvent.change(medNames[0], { target: { value: "Amoxicillin" } });
    fireEvent.change(medDetails[0], {
      target: { value: "500mg twice daily" },
    });
    expect(medNames[0]).toHaveValue("Amoxicillin");
    expect(medDetails[0]).toHaveValue("500mg twice daily");

    // Simulate clicking "remove" button to delete medicine input
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));

    // Assert medicine inputs are removed from DOM
    expect(
      screen.queryByPlaceholderText(/medicine name/i)
    ).not.toBeInTheDocument();
  });

  // Test submitting prescription: checks POST request payload, Authorization header, and refetch GET calls
  test("Submit prescription success: POST body + Authorization header + refetch GET", async () => {
    const bookings = [
      {
        _id: "b1",
        patient: { name: "Alice", profile_picture: "" },
        doctor: { name: "Dr X" },
        slot: { timeInterval: "9am - 10am" },
        prescription: { comments: "", medicines: [] },
      },
    ];

    // Setup fetch mock sequence: initial GET, POST submit, then refetch GET
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ msg: "ok" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings }),
      });

    renderAppointments();

    // Wait for patient Alice to appear
    await screen.findByText(/patient: alice/i);

    // Fill prescription comments and add medicine details
    fireEvent.change(screen.getByPlaceholderText(/add comments/i), {
      target: { value: "Rest and hydrate" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add medicine/i }));
    fireEvent.change(screen.getByPlaceholderText(/medicine name/i), {
      target: { value: "Paracetamol" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(/details \(e\.g\., 1 tablet twice a day\)/i),
      { target: { value: "1 tab x 3 days" } }
    );

    // Submit the prescription form
    fireEvent.click(
      screen.getByRole("button", { name: /submit prescription/i })
    );

    // Wait for all fetch calls (3 total) to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    // Validate the second fetch call (POST) has correct endpoint, method, and headers
    const postCall = global.fetch.mock.calls[1];
    expect(postCall[0]).toMatch(/\/booking$/);
    expect(postCall[1].method).toBe("POST");
    expect(postCall[1].headers.Authorization).toBe("Bearer DUMMY_TOKEN");

    // Validate the POST body contents
    const sent = JSON.parse(postCall[1].body);
    expect(sent).toEqual({
      bookingID: "b1",
      medicines: [{ name: "Paracetamol", details: "1 tab x 3 days" }],
      comments: "Rest and hydrate",
    });

    // Confirm success alert shown to user
    expect(alertSpy).toHaveBeenCalledWith(
      "Prescription submitted successfully"
    );
  });

  // Test failed prescription submission (non-OK POST response) triggers failure alert
  test("Submit prescription failure: non-OK response triggers failure alert", async () => {
    const bookings = [
      {
        _id: "b1",
        patient: { name: "Alice", profile_picture: "" },
        doctor: { name: "Dr X" },
        slot: { timeInterval: "9am - 10am" },
        prescription: { comments: "", medicines: [] },
      },
    ];

    // Mock fetch sequence: successful GET, failed POST
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ msg: "bad" }),
      });

    renderAppointments();

    // Wait for patient Alice to appear
    await screen.findByText(/patient: alice/i);

    // Attempt to submit prescription
    fireEvent.click(screen.getByRole("button", { name: /submit prescription/i }));

    // Wait for fetch calls to complete
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    // Confirm failure alert triggered
    expect(alertSpy).toHaveBeenCalledWith("Failed to submit prescription");
  });

  // Test when GET /booking returns non-OK, UI shows fallback message 'No appointments found'
  test("GET /booking non-OK shows 'No appointments found'", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ msg: "server error" }),
    });

    renderAppointments();

    // Wait for no bookings found message to appear after loading ends
    await waitFor(() => {
      expect(
        screen.getByText(/no appointments found/i)
      ).toBeInTheDocument();
    });
  });

  // Test behavior when no AuthToken is present: fetch is not called and UI shows fallback message
  test("when no AuthToken, stops fetching and shows 'No appointments found'", async () => {
    // Override getItem to simulate absence of AuthToken
    getItemSpy.mockImplementation((k) => null);
    renderAppointments();

    // Wait for UI to show no appointments found message and verify fetch not called
    await waitFor(() => {
      expect(
        screen.getByText(/no appointments found/i)
      ).toBeInTheDocument();
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
