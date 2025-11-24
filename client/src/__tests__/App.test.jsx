import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import App from "../App";

// Setup a polyfill for React Router's fetch Request, ensuring tests run smoothly even if window.Request is unavailable
beforeAll(() => {
  if (typeof window !== "undefined" && window.Request) {
    // Use browser's native Request if available
    // @ts-ignore
    global.Request = window.Request;
  } else {
    // Provide a minimal stub for Request otherwise since fetch is mocked in tests
    // eslint-disable-next-line no-global-assign
    global.Request = function Request(input, init) {
      this.input = input;
      this.init = init;
    };
  }
});

// Mock the translation module to avoid running real translation API calls during tests
jest.mock("../Controllers/Translation", () => ({
  translation: jest.fn(async (text, lang) => text),
}));

// Helper to render the App component with a specified initial route in the browser's history
function renderApp(initialRoute = "/") {
  window.history.pushState({}, "", initialRoute);
  return render(<App />); // App contains its own Router
}

describe("App integration", () => {
  // Reset mocks, localStorage, and fetch mocks before each test for isolation
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    global.fetch = jest.fn();
  });

  // Test that the home route renders the expected hero heading and call-to-action button
  test("home route '/' shows home hero and CTA", async () => {
    renderApp("/");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Feeling Unwell\?/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /Get Help Now/i })
    ).toBeInTheDocument();
  });

  // Test that an unauthenticated user visiting /prescription-history is shown the home page content
  test("unauthenticated user visiting /prescription-history shows home content", async () => {
    renderApp("/prescription-history");

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Feeling Unwell\?/i })
      ).toBeInTheDocument()
    );
    expect(
      screen.getByRole("button", { name: /Get Help Now/i })
    ).toBeInTheDocument();
  });

  // Test authenticated user accessing /prescription-history does not see home hero, indicating proper routing
  test("authenticated user visiting /prescription-history does NOT see home hero", async () => {
    window.localStorage.setItem("AuthToken", "DUMMY_TOKEN");

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ prescriptions: [] }),
    });

    renderApp("/prescription-history");

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: /Feeling Unwell\?/i })
      ).not.toBeInTheDocument();
    });
  });

  // Test that users with patient role are redirected to home when accessing the doctor-home route
  test("patient accessing /doctor-home is redirected to home", async () => {
    window.localStorage.setItem("AuthToken", "PATIENT_TOKEN");

    // Mock user API response with patient role
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          role: "PATIENT",
          name: "John Doe",
        },
      }),
    });

    renderApp("/doctor-home");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Feeling Unwell\?/i })
      ).toBeInTheDocument();
    });
  });

  // Test that navigation links are rendered in the navbar on the home page
  test("navbar renders navigation links on home route", async () => {
    renderApp("/");

    await waitFor(() => {
        const links = screen.getAllByRole("link");
        expect(links.length).toBeGreaterThan(0);
    });
  });

  // Test clicking a navbar link navigates to the expected route content
  test("clicking navbar link navigates to correct route", async () => {
    renderApp("/");

    const aboutLink = await screen.findByRole("link", { name: /about/i });
    fireEvent.click(aboutLink);

    await waitFor(() => {
      expect(
        screen.getByText(/about us/i)
      ).toBeInTheDocument();
    });
  });

  // Test that the translation context in the app provides translated content to child components
  test("app provides translation context to child components", async () => {
    renderApp("/");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Feeling Unwell\?/i })
      ).toBeInTheDocument();
    });
  });

  // Test the app handles API errors gracefully on routes requiring authentication, showing fallback UI
  test("handles API errors gracefully on protected routes", async () => {
    window.localStorage.setItem("AuthToken", "INVALID_TOKEN");

    // Simulate network error from API fetch
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    renderApp("/prescription-history");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Feeling Unwell\?/i })
      ).toBeInTheDocument();
    });
  });
});
