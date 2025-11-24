// src/__tests__/Meeting.test.jsx

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
import VideoCall, {
  MyUILayout,
  MyParticipantList,
  MyFloatingLocalParticipant,
} from "../pages/meeting"; // Adjust path as necessary

// ---------------- Router mocks ----------------

// Mock navigation and location hooks from react-router-dom
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

// ---------------- Shared Stream mocks ----------------

// Mock for MyUILayout hook useCall
const mockCall = {
  endCall: jest.fn().mockResolvedValue(undefined),
};

// Mocks for VideoCall StreamVideoClient lifecycle methods
const mockStreamJoin = jest.fn().mockResolvedValue(undefined);
const mockStreamLeave = jest.fn().mockResolvedValue(undefined);

const mockStreamCall = jest.fn().mockImplementation(() => ({
  join: mockStreamJoin,
  leave: mockStreamLeave,
}));

const mockStreamConnectUser = jest.fn().mockResolvedValue(undefined);
const mockStreamDisconnect = jest.fn().mockResolvedValue(undefined);

let mockCallingState = "JOINING";
let mockParticipants = [];
let mockLocalParticipant = null;
let mockParticipantCount = 0;

let mockCamera = { disable: jest.fn().mockResolvedValue(undefined) };
let mockMicrophone = { disable: jest.fn().mockResolvedValue(undefined) };

// Jest mock for @stream-io/video-react-sdk exports and hooks
jest.mock("@stream-io/video-react-sdk", () => {
  function mockStreamVideoClient(config) {
    this.config = config;
    this.connectUser = mockStreamConnectUser;
    this.disconnect = mockStreamDisconnect;
    this.call = mockStreamCall;
  }

  return {
    __esModule: true,

    // Exported constructor used in VideoCall component
    StreamVideoClient: mockStreamVideoClient,

    // Component mocks for VideoCall render tree
    StreamVideo: ({ children }) => (
      <div data-testid="stream-video">{children}</div>
    ),
    StreamCall: ({ children }) => (
      <div data-testid="stream-call">{children}</div>
    ),

    // Component mocks for MyUILayout tree
    StreamTheme: ({ children }) => (
      <div data-testid="stream-theme">{children}</div>
    ),
    SpeakerLayout: () => <div data-testid="speaker-layout" />,
    CallControls: () => <div data-testid="call-controls" />,
    ParticipantView: ({ participant }) => (
      <div data-testid={`participant-${participant?.sessionId || "none"}`} />
    ),

    // Hook mocks used by MyUILayout
    useCall: () => mockCall,
    useCallStateHooks: () => ({
      useCameraState: () => ({ camera: mockCamera }),
      useMicrophoneState: () => ({ microphone: mockMicrophone }),
      useCallCallingState: () => mockCallingState,
      useParticipantCount: () => mockParticipantCount,
      useParticipants: () => mockParticipants,
      useLocalParticipant: () => mockLocalParticipant,
    }),

    // Enum for call states
    CallingState: {
      JOINED: "JOINED",
      LEFT: "LEFT",
      JOINING: "JOINING",
    },
  };
});

// ---------------- Helpers ----------------

// Renders UI element wrapped in MemoryRouter for routing context
function renderLayout(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

// Renders VideoCall component inside MemoryRouter
function renderVideoCall() {
  return render(
    <MemoryRouter>
      <VideoCall />
    </MemoryRouter>
  );
}

// ============================================================================
// MyUILayout tests
// ============================================================================

describe("MyUILayout (patient/doctor logic)", () => {
  // Setup mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockCallingState = "JOINING";
    mockParticipants = [];
    mockLocalParticipant = null;
    mockParticipantCount = 0;
    mockCamera = { disable: jest.fn().mockResolvedValue(undefined) };
    mockMicrophone = { disable: jest.fn().mockResolvedValue(undefined) };

    jest
      .spyOn(window.localStorage.__proto__, "getItem")
      .mockImplementation((k) => (k === "AuthToken" ? "DUMMY_TOKEN" : null));
    jest
      .spyOn(window.localStorage.__proto__, "removeItem")
      .mockImplementation(() => {});
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Shows connecting UI if call state is not JOINED
  test("shows connecting UI when callingState is not JOINED", () => {
    mockCallingState = "JOINING";
    renderLayout(<MyUILayout meeting_id="m1" role="patient" />);
    expect(screen.getByText(/connecting to meeting/i)).toBeInTheDocument();
  });

  // Patient sees warning banner if doctor disconnected (no remote participants)
  test("patient sees doctor disconnected banner when remote participants vanish", () => {
    mockCallingState = "JOINED";
    mockLocalParticipant = { sessionId: "local" };
    mockParticipants = [];
    mockParticipantCount = 1;

    renderLayout(<MyUILayout meeting_id="m1" role="patient" />);

    expect(
      screen.getByText(
        /doctor disconnected, please stay in the call while they reconnect/i
      )
    ).toBeInTheDocument();
  });

  // Doctor auto-ends call if patient leaves (participants only doctor)
  test("doctor auto-ends call when patient leaves", async () => {
    mockCallingState = "JOINED";
    mockLocalParticipant = { sessionId: "doc" };
    mockParticipants = [{ sessionId: "doc" }];
    mockParticipantCount = 1;

    renderLayout(<MyUILayout meeting_id="m1" role="doctor" />);

    await waitFor(() => {
      expect(mockCall.endCall).toHaveBeenCalled();
    });
  });

  // Doctor clicking "End meeting" triggers call end logic
  test("doctor End meeting button sets endingForEveryone and calls endCall", async () => {
    mockCallingState = "JOINED";
    mockLocalParticipant = { sessionId: "doc" };
    mockParticipants = [{ sessionId: "doc" }];
    mockParticipantCount = 1;

    renderLayout(<MyUILayout meeting_id="m1" role="doctor" />);

    const btn = screen.getByRole("button", { name: /end meeting/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(mockCall.endCall).toHaveBeenCalled();
    });
  });

  // Patient leaving deletes meeting, clears local storage, and navigates home
  test("patient leaving deletes meeting, clears activeMeeting and navigates home", async () => {
    mockCallingState = "LEFT";
    mockLocalParticipant = { sessionId: "p1" };
    mockParticipants = [{ sessionId: "p1" }];
    mockParticipantCount = 1;

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ msg: "deleted" }),
    });

    const removeItemSpy = jest
      .spyOn(window.localStorage.__proto__, "removeItem")
      .mockImplementation(() => {});

    mockCamera = { disable: jest.fn().mockResolvedValue(undefined) };
    mockMicrophone = { disable: jest.fn().mockResolvedValue(undefined) };

    renderLayout(<MyUILayout meeting_id="meet-123" role="patient" />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/meet/meet-123",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer DUMMY_TOKEN",
          }),
        })
      );
      expect(removeItemSpy).toHaveBeenCalledWith("activeMeeting");
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  // Doctor leaving after endingForEveryone deletes meeting and navigates to doctor home
  test("doctor leaving after endingForEveryone deletes meeting and navigates doctor-home", async () => {
    mockCallingState = "JOINED";
    mockLocalParticipant = { sessionId: "doc" };
    mockParticipants = [{ sessionId: "doc" }];
    mockParticipantCount = 1;

    const removeItemSpy = jest
      .spyOn(window.localStorage.__proto__, "removeItem")
      .mockImplementation(() => {});
    mockCamera = { disable: jest.fn().mockResolvedValue(undefined) };
    mockMicrophone = { disable: jest.fn().mockResolvedValue(undefined) };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ msg: "deleted" }),
    });

    const { rerender } = renderLayout(
      <MyUILayout meeting_id="meet-456" role="doctor" />
    );

    fireEvent.click(screen.getByRole("button", { name: /end meeting/i }));
    expect(mockCall.endCall).toHaveBeenCalled();

    mockCallingState = "LEFT";
    rerender(
      <MemoryRouter>
        <MyUILayout meeting_id="meet-456" role="doctor" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3000/meet/meet-456",
        expect.any(Object)
      );
      expect(removeItemSpy).toHaveBeenCalledWith("activeMeeting");
      expect(mockNavigate).toHaveBeenCalledWith("/doctor-home");
    });
  });

  // Doctor leaving without endingForEveryone skips deletion, only navigates doctor home
  test("doctor leaving without endingForEveryone keeps meeting data and only navigates doctor-home", async () => {
    mockCallingState = "LEFT";
    mockLocalParticipant = { sessionId: "doc" };
    mockParticipants = [{ sessionId: "doc" }];
    mockParticipantCount = 1;

    const removeItemSpy = jest
      .spyOn(window.localStorage.__proto__, "removeItem")
      .mockImplementation(() => {});

    mockCamera = { disable: jest.fn().mockResolvedValue(undefined) };
    mockMicrophone = { disable: jest.fn().mockResolvedValue(undefined) };

    renderLayout(<MyUILayout meeting_id="meet-999" role="doctor" />);

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
      expect(removeItemSpy).not.toHaveBeenCalledWith("activeMeeting");
      expect(mockNavigate).toHaveBeenCalledWith("/doctor-home");
    });
  });
});

// ============================================================================
// MyParticipantList tests
// ============================================================================

describe("MyParticipantList", () => {
  // Ensures ParticipantView components render for each participant prop
  test("renders ParticipantView for each participant", () => {
    const participants = [{ sessionId: "p1" }, { sessionId: "p2" }];

    render(
      <MemoryRouter>
        <MyParticipantList participants={participants} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("participant-p1")).toBeInTheDocument();
    expect(screen.getByTestId("participant-p2")).toBeInTheDocument();
  });
});

// ============================================================================
// MyFloatingLocalParticipant tests
// ============================================================================

describe("MyFloatingLocalParticipant", () => {
  // Renders ParticipantView if participant exists
  test("renders ParticipantView when participant exists", () => {
    const participant = { sessionId: "local" };

    render(
      <MemoryRouter>
        <MyFloatingLocalParticipant participant={participant} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("participant-local")).toBeInTheDocument();
  });

  // Renders empty container when participant is null (no ParticipantView)
  test("renders empty container when participant is null", () => {
    render(
      <MemoryRouter>
        <MyFloatingLocalParticipant participant={null} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("participant-none")).not.toBeInTheDocument();
  });
});

// ============================================================================
// VideoCall tests (client lifecycle, loading, error)
// ============================================================================

describe("VideoCall (client lifecycle, loading, error)", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseLocation.mockReturnValue({
      state: {
        specialization: "cardiology",
        create: true,
        callId: "call-123",
      },
    });

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

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  // Tests client creation, user connection, call joining, and caching activeMeeting for doctor
  test("creates client, uses headers, connects user, joins call and caches activeMeeting for doctor", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        role: "doctor",
        specialization: "cardiology",
        apiKey: "API_KEY",
        token: "STREAM_TOKEN",
        callId: "call-123",
        user: { _id: "doc-1", name: "Dr. Who", profile_picture: null },
      }),
    });

    const setItemSpy = jest.spyOn(window.localStorage.__proto__, "setItem");

    renderVideoCall();

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => expect(mockStreamJoin).toHaveBeenCalled());

    expect(mockStreamConnectUser).toHaveBeenCalledWith({
      id: "doc-1",
      name: "Dr. Who",
      token: "STREAM_TOKEN",
    });

    expect(mockStreamCall).toHaveBeenCalledWith("default", "call-123");

    // Verify fetch call uses correct headers and URL
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toContain("/meet/cardiology/call-123");
    expect(options).toMatchObject({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer DUMMY_TOKEN",
      },
    });

    // Confirm activeMeeting cache set for doctor
    expect(setItemSpy).toHaveBeenCalledWith(
      "activeMeeting",
      JSON.stringify({
        specialization: "cardiology",
        callId: "call-123",
      })
    );
  });

  // Verifies no caching of activeMeeting if user role is not doctor
  test("does not cache activeMeeting for non-doctor meetings", async () => {
    const setItemSpy = jest
      .spyOn(window.localStorage.__proto__, "setItem")
      .mockImplementation(() => {});

    mockUseLocation.mockReturnValueOnce({
      state: {
        specialization: "cardiology",
        create: true,
        callId: "call-patient",
      },
    });

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        role: "patient",
        specialization: "cardiology",
        apiKey: "API_KEY",
        token: "STREAM_TOKEN",
        callId: "call-patient",
        user: { _id: "pat-1", name: "Patient", profile_picture: null },
      }),
    });

    renderVideoCall();

    await waitFor(() => {
      expect(mockStreamConnectUser).toHaveBeenCalled();
    });

    // activeMeeting should not be cached for patients
    expect(setItemSpy).not.toHaveBeenCalledWith(
      "activeMeeting",
      expect.any(String)
    );
  });

  // Navigates home when unauthorized (401) response received from meet endpoint
  test("navigates home on 401 response from /meet", async () => {
    mockUseLocation.mockReturnValueOnce({
      state: {
        specialization: "cardiology",
        create: false,
        callId: "call-unauth",
      },
    });

    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ msg: "unauthorized" }),
    });

    renderVideoCall();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  // Verifies that disconnect is called on component unmount if client and call exist
  test("useEffect cleanup on unmount calls disconnect when client/call exist", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        role: "patient",
        specialization: "cardiology",
        apiKey: "API_KEY",
        token: "STREAM_TOKEN",
        callId: "call-999",
        user: { _id: "pat-1", name: "John", profile_picture: null },
      }),
    });

    const { unmount } = renderVideoCall();

    await waitFor(() => expect(mockStreamJoin).toHaveBeenCalled());

    await act(async () => {
      unmount();
    });

    await waitFor(() => {
      expect(mockStreamDisconnect).toHaveBeenCalled();
    });
  });

  // Confirms client does not construct when required meetDetails fields are missing
  test("does not construct client when meetDetails is missing required fields", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        role: "patient",
        specialization: "cardiology",
        // apiKey, token, user, and callId missing
      }),
    });

    renderVideoCall();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Expect no calls to connect user or create call instance
    expect(mockStreamConnectUser).not.toHaveBeenCalled();
    expect(mockStreamCall).not.toHaveBeenCalled();
  });
});
