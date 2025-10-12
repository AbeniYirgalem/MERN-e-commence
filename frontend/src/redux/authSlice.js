import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { setAuthToken } from "../api/axios";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  profileUpdating: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/register", data);
      // If backend returned token and user, persist token here so components can use it immediately
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (creds, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/login", creds);
      if (res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { fulfillWithValue }) => {
    // Backend does not currently require a logout endpoint; clear client-side
  setAuthToken(null);
    return fulfillWithValue();
  }
);

export const fetchUser = createAsyncThunk(
  "auth/fetchMe",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      if (token) setAuthToken(token);
      const res = await axios.get("/api/auth/me");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (data, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token || localStorage.getItem("token");
      if (token) setAuthToken(token);
      const res = await axios.put("/api/users/me", data);
      return res.data; // expect updated user or { user: updatedUser }
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/forgot-password", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, {
        password,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // backend may return { user, token } or { token, user } or the user directly
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token || state.token;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${action.payload.token}`;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
        state.token = action.payload.token || state.token;
        if (action.payload.token) {
          localStorage.setItem("token", action.payload.token);
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${action.payload.token}`;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("token");
      })

      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user || action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload?.message || "Session restore failed";
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      });
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.profileUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.profileUpdating = false;
        // backend may return { user } or the user directly
        state.user = action.payload.user || action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.profileUpdating = false;
        // store error object for UI to display field-level messages
        state.error = action.payload || { message: "Update failed" };
      });
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Failed" };
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || { message: "Failed" };
      });
  },
});

export default authSlice.reducer;
