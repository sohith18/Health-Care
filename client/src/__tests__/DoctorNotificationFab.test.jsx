import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DoctorNotificationFab from "../components/DoctorNotificationFab";

// Mock react-router-dom's useNavigate hook to intercept and assert navigation calls
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// Enable fake timers globally to control heartbeat polling intervals in tests
beforeAll(() => {
  jest.useFakeTimers();
});

// Restore real timers after all tests complete
afterAll(() => {
  jest.useRealTimers();
});

describe("DoctorNotificationFab", () => {
  // Before each test, mock localStorage methods and console methods to avoid side effects
  beforeEach(() => {
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => {
        if (k === "AuthToken") return "DUMMY_TOKEN";
        if (k === "activeMeeting") return null;
        return null;
      });
    jest
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {});
    jest
      .spyOn(window.localStorage.__proto__, "removeItem")
      .mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  // After each test, restore all mocks and clear timers and fetch mocks
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllTimers();
    if (global.fetch?.mockClear) global.fetch.mockClear();
  });

  // Helper to render the DoctorNotificationFab component wrapped in a MemoryRouter at the given path
  function renderFabAt(pathname = "/") {
    return render(
      <MemoryRouter initialEntries={[pathname]}>
        <DoctorNotificationFab />
      </MemoryRouter>
    );
  }

  //
  // 1) No AuthToken present: role check ends early, component renders nothing and does not fetch
  //
  test("with no AuthToken, role check short-circuits and renders nothing", async () => {
    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => {
        if (k === "AuthToken") return null;
        return null;
      });

    global.fetch = jest.fn(); // fetch should not be called without token

    renderFabAt("/");

    // Assert the notification FAB button is not rendered at all
    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /doctor notifications/i })
      ).toBeNull();
    });

    // Confirm fetch was not invoked
    expect(global.fetch).not.toHaveBeenCalled();
  });

  //
  // 2) Authenticated doctor role: fetches user info and renders FAB button
  //
  test("fetches /user with GET and correct headers, enabling FAB for doctor role", async () => {
    // Mock fetch to return user with role DOCTOR
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { role: "DOCTOR" } }),
    });

    renderFabAt("/");

    // Wait for fetch call to happen
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Validate fetch call details
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe("http://localhost:3000/user");
    expect(options.method).toBe("GET");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer DUMMY_TOKEN");

    // Confirm FAB button is rendered for doctor notifications
    const fab = await screen.findByRole("button", {
      name: /doctor notifications/i,
    });
    expect(fab).toBeInTheDocument();
  });

  //
  // 3) Heartbeat polling: displays meeting notification badge when a meeting exists, hides it otherwise
  //
  test("heartbeat sets meeting notification when token+callId present, else clears notif and closes panel", async () => {
    // Mock fetch to first return DOCTOR role user, then meeting data with token and callId
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "DOCTOR" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "MEET_TOKEN",
          callId: "call-123",
          specialization: "cardio",
        }),
      });

    renderFabAt("/");

    const fab = await screen.findByRole("button", {
      name: /doctor notifications/i,
    });

    // Advance timer by 1 ms to trigger heartbeat polling
    jest.advanceTimersByTime(1);

    // Badge count "1" should appear signaling a meeting notification
    expect(screen.getByText("1")).toBeInTheDocument();

    // Validate second fetch call details for heartbeat
    const [hbUrl, hbOptions] = global.fetch.mock.calls[1];
    expect(hbUrl).toBe("http://localhost:3000/heartbeat");
    expect(hbOptions.method).toBe("GET");
    expect(hbOptions.headers["Content-Type"]).toBe("application/json");
    expect(hbOptions.headers.Authorization).toBe("Bearer DUMMY_TOKEN");

    // Click FAB to open meeting notification popup
    fireEvent.click(fab);
    expect(
      screen.getByText(/you have a meeting request\. join now\?/i)
    ).toBeInTheDocument();

    // Next heartbeat reports no meeting active
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: null, callId: null }),
    });

    // Advance timer to trigger next heartbeat
    jest.advanceTimersByTime(5000);

    // Popup should disappear when no meeting
    await waitFor(() => {
      expect(
        screen.queryByText(/you have a meeting request\. join now\?/i)
      ).toBeNull();
    });
  });

  //
  // 4) Outside click: clicks inside popup do not close it; clicks outside (mouse and touch) close popup
  //
  test("clicking inside popup keeps it open while clicking outside closes it (mouse and touch)", async () => {
    // Mock fetch for user info and meeting data
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "DOCTOR" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "MEET_TOKEN",
          callId: "call-123",
          specialization: "cardio",
        }),
      });

    const { container } = renderFabAt("/");

    const fab = await screen.findByRole("button", {
      name: /doctor notifications/i,
    });

    jest.advanceTimersByTime(1);

    // Open the popup by clicking FAB
    fireEvent.click(fab);
    const popupText = screen.getByText(
      /you have a meeting request\. join now\?/i
    );
    const popupCard = popupText.closest("div");
    expect(popupCard).toBeInTheDocument();

    // 4a) Click events inside popup do NOT close it
    fireEvent.mouseDown(popupCard);
    fireEvent.touchStart(popupCard);

    expect(
      screen.getByText(/you have a meeting request\. join now\?/i)
    ).toBeInTheDocument();

    // 4b) Clicking mouse outside popup and FAB closes popup
    fireEvent.mouseDown(container);

    await waitFor(() => {
      expect(
        screen.queryByText(/you have a meeting request\. join now\?/i)
      ).toBeNull();
    });

    // Re-open popup for touch outside click test
    fireEvent.click(fab);
    expect(
      screen.getByText(/you have a meeting request\. join now\?/i)
    ).toBeInTheDocument();

    // Touch event outside popup closes it
    fireEvent.touchStart(container);

    await waitFor(() => {
      expect(
        screen.queryByText(/you have a meeting request\. join now\?/i)
      ).toBeNull();
    });
  });

  //
  // 5) When no active meeting, clicking FAB shows "No new notifications." info popup without badge
  //
  test('when there is no meeting, FAB opens "No new notifications." info popup and shows no badge', async () => {
    // Mock fetch sequence for doctor user and heartbeat with no meeting
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "DOCTOR" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: null, callId: null }),
      });

    renderFabAt("/");

    const fab = await screen.findByRole("button", {
      name: /doctor notifications/i,
    });

    // Trigger initial heartbeat
    jest.advanceTimersByTime(1);

    // No badge should show since no active meeting
    expect(screen.queryByText("1")).toBeNull();

    // Clicking FAB opens info popup with message
    fireEvent.click(fab);
    expect(screen.getByText(/no new notifications\./i)).toBeInTheDocument();
  });

  //
  // 6) Rejecting a call: removes activeMeeting key, calls reject endpoint, closes notification panel
  //
  test("rejectCall removes activeMeeting, calls reject endpoint, and clears notification", async () => {
    // Mock fetch sequence: user role DOCTOR, active meeting with token and callId
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "DOCTOR" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "MEET_TOKEN",
          callId: "call-123",
          specialization: "cardio",
        }),
      });

    renderFabAt("/");

    const fab = await screen.findByRole("button", {
      name: /doctor notifications/i,
    });

    jest.advanceTimersByTime(1);

    // Open meeting notification popup
    fireEvent.click(fab);
    expect(
      screen.getByText(/you have a meeting request\. join now\?/i)
    ).toBeInTheDocument();

    // Mock reject endpoint response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ msg: "rejected" }),
    });

    // Click "No" button to reject call
    fireEvent.click(screen.getByRole("button", { name: /^no$/i }));

    // Confirm localStorage key "activeMeeting" removed
    await waitFor(() => {
      expect(window.localStorage.removeItem).toHaveBeenCalledWith(
        "activeMeeting"
      );
    });

    // Validate reject fetch call details
    const [rejectUrl, rejectOptions] = global.fetch.mock.calls[2];
    expect(rejectUrl).toBe(
      "http://localhost:3000/heartbeat/reject/call-123"
    );
    expect(rejectOptions.method).toBe("GET");
    expect(rejectOptions.headers["Content-Type"]).toBe("application/json");
    expect(rejectOptions.headers.Authorization).toBe("Bearer DUMMY_TOKEN");

    // Popup should close after rejection
    await waitFor(() => {
      expect(
        screen.queryByText(/you have a meeting request\. join now\?/i)
      ).toBeNull();
    });
  });

  //
  // 7) Joining a call: guard checks, sets activeMeeting key, navigates to video-call route, closes panel
  //
  test("joinCall stores activeMeeting, closes panel and navigates when callId and specialization exist", async () => {
    // Mock fetch sequence: doctor user info and meeting heartbeat
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { role: "DOCTOR" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "MEET_TOKEN",
          callId: "call-123",
          specialization: "cardio",
        }),
      });

    renderFabAt("/");

    const fab = await screen.findByRole("button", {
      name: /doctor notifications/i,
    });

    jest.advanceTimersByTime(1);

    // Open meeting notification popup
    fireEvent.click(fab);
    expect(
      screen.getByText(/you have a meeting request\. join now\?/i)
    ).toBeInTheDocument();

    // Click "Yes" button to join call
    fireEvent.click(screen.getByRole("button", { name: /^yes$/i }));

    // Verify localStorage activeMeeting was set with correct data
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "activeMeeting",
      JSON.stringify({ specialization: "cardio", callId: "call-123" })
    );

    // Confirm navigation called with correct route and state
    expect(mockNavigate).toHaveBeenCalledWith(
      "/video-call/meeting/cardio/call-123",
      expect.objectContaining({
        state: expect.objectContaining({
          specialization: "cardio",
          create: false,
          callId: "call-123",
        }),
      })
    );

    // Popup closes after navigating
    await waitFor(() => {
      expect(
        screen.queryByText(/you have a meeting request\. join now\?/i)
      ).toBeNull();
    });
  });
});
