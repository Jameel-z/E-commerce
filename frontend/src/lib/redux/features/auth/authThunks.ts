// lib/redux/features/auth/authThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/types/apiClient";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.loginUser(email, password);

      // Set HttpOnly cookie with the token
      const setTokenRes = await fetch("/api/auth/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.access_token }),
      });

      if (!setTokenRes.ok) throw new Error("Failed to set token");

      return response.access_token;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Authentication failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      await apiClient.registerUser(userData);

      // note that when registerd, we need next to login to get the token, so we will use login user that we already have
      const loginResponse = await apiClient.loginUser(
        userData.email,
        userData.password
      );

      const setTokenRes = await fetch("/api/auth/set-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: loginResponse.access_token }),
      });

      if (!setTokenRes.ok) throw new Error("Failed to set token");

      return loginResponse.access_token;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Registrayion failed"
      );
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/validate-token", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Not authenticated");

      const { token } = await res.json();
      return token;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Authentication check failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/auth/clear-token", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Logout failed");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Logout failed"
      );
    }
  }
);
