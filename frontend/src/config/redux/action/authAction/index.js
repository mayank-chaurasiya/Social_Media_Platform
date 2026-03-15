import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/login", {
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      } else {
        return thunkAPI.rejectWithValue({
          message: "token not provided",
        });
      }
      return thunkAPI.fulfillWithValue(response.data.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || "Unable to login",
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/register", {
        name: user.name,
        username: user.username,
        email: user.email,
        password: user.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        return thunkAPI.fulfillWithValue(response.data.token);
      }

      return thunkAPI.rejectWithValue({
        message: "token not provided",
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to register user",
      );
    }
  },
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/get_user_and_profile", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          message: error.message || "Unable to fetch user profile",
        },
      );
    }
  },
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_all_users");
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || {
          message: error.message || "Unable to fetch all users",
        },
      );
    }
  },
);

export const sendConnectionRequest = createAsyncThunk(
  "user/sendConnectionRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/send_connection_request",
        {
          token: user.token,
          connectionId: user.user_id,
        },
      );
      thunkAPI.dispatch(getConnectionsRequest({ token: user.token }));
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to send connection request",
      );
    }
  },
);

export const getConnectionsRequest = createAsyncThunk(
  "user/getConnectionsRequest",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/get_connection_requests", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data.connections);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch connection requests",
      );
    }
  },
);

export const getMyConnectionsRequests = createAsyncThunk(
  "user/getMyConnectionRequests",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.get("/user/user_connection_request", {
        params: {
          token: user.token,
        },
      });
      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to fetch your connections",
      );
    }
  },
);

export const acceptConnection = createAsyncThunk(
  "user/acceptConnections",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/user/accept_connection_request",
        {
          token: user.token,
          requestId: user.connectionId,
          action_type: user.action,
        },
      );
      thunkAPI.dispatch(getMyConnectionsRequests({ token: user.token }));
      return thunkAPI.fulfillWithValue({
        ...response.data,
        requestId: user.connectionId,
        actionType: user.action,
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Unable to update connection request",
      );
    }
  },
);
