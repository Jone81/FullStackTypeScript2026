import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  getProfileApi,
  loginApi,
  logoutApi,
  registerApi,
  setAccessToken,
  UserProfile,
} from "../api/client";

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ============================================================================
// Async Thunks (Chapter 12)
// ============================================================================
export const loginUser = createAsyncThunk<
  { user: UserProfile; accessToken: string },
  { userName: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ userName, password }, { rejectWithValue }) => {
  try {
    const loginRes = await loginApi(userName, password);
    const profile = await getProfileApi(loginRes.userId);
    const user: UserProfile = {
      ...profile,
      role: profile.userName === "jouni123" ? "admin" : "user",
    };
    return { user, accessToken: loginRes.accessToken };
  } catch (err: any) {
    return rejectWithValue(
      err?.message || "Invalid username or password. Please try again."
    );
  }
});

export const registerUser = createAsyncThunk<
  { user: UserProfile; accessToken: string },
  {
    userName: string;
    password: string;
    fullName: string;
    description: string;
    socialLinkPrimary?: string;
    socialLinkSecondary?: string;
  },
  { rejectValue: string }
>("auth/register", async (params, { rejectWithValue }) => {
  try {
    await registerApi(params);
    const loginRes = await loginApi(params.userName, params.password);
    const profile = await getProfileApi(loginRes.userId);
    const user: UserProfile = {
      ...profile,
      role: profile.userName === "jouni123" ? "admin" : "user",
    };
    return { user, accessToken: loginRes.accessToken };
  } catch (err: any) {
    return rejectWithValue(
      err?.message || "Registration failed. Username may already exist."
    );
  }
});

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await logoutApi();
});

// ============================================================================
// The Auth Slice & Reducers (Chapter 12)
// ============================================================================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserProfile; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      setAccessToken(action.payload.token);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      setAccessToken(null);
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserState: (state, action: PayloadAction<UserProfile>) => {
      state.user = {
        ...action.payload,
        role: state.user?.role || "user",
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload || "Login failed";
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {
  setCredentials,
  clearCredentials,
  clearError,
  updateUserState,
} = authSlice.actions;

export default authSlice.reducer;
