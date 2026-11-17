import { describe, expect, it } from "vitest";
import authReducer, {
  clearCredentials,
  clearError,
  loginUser,
  setCredentials,
} from "./authSlice";

describe("authSlice", () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  it("should return the initial state", () => {
    expect(authReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should handle setCredentials", () => {
    const mockUser = {
      id: "2",
      updatedAt: "2026-11-17T00:00:00Z",
      userName: "jouni123",
      fullName: "Jouni Kurki",
      role: "admin" as const,
    };
    const nextState = authReducer(
      initialState,
      setCredentials({ user: mockUser, token: "mock-jwt-token" })
    );
    expect(nextState.isAuthenticated).toBe(true);
    expect(nextState.user).toEqual(mockUser);
    expect(nextState.token).toBe("mock-jwt-token");
  });

  it("should handle clearCredentials", () => {
    const loggedInState = {
      user: {
        id: "2",
        updatedAt: "2026-11-17T00:00:00Z",
        userName: "jouni123",
        fullName: "Jouni Kurki",
      },
      token: "mock-jwt-token",
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };
    const nextState = authReducer(loggedInState, clearCredentials());
    expect(nextState).toEqual(initialState);
  });

  it("should handle loginUser.pending and loginUser.rejected", () => {
    const pendingState = authReducer(
      initialState,
      loginUser.pending("req-1", { userName: "jouni123", password: "wrong" })
    );
    expect(pendingState.isLoading).toBe(true);
    expect(pendingState.error).toBeNull();

    const rejectedState = authReducer(
      pendingState,
      loginUser.rejected(
        new Error("Rejected"),
        "req-1",
        { userName: "jouni123", password: "wrong" },
        "Invalid credentials"
      )
    );
    expect(rejectedState.isLoading).toBe(false);
    expect(rejectedState.isAuthenticated).toBe(false);
    expect(rejectedState.error).toBe("Invalid credentials");

    const clearedState = authReducer(rejectedState, clearError());
    expect(clearedState.error).toBeNull();
  });
});
