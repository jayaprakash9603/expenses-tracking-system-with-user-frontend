import { useNavigate } from "react-router";
import { api, API_BASE_URL } from "../../config/api";
import {
  GET_PROFILE_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  RESET_CLOUDINARY_STATE,
  UPDATE_PROFILE_FAILURE,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPLOAD_TO_CLOUDINARY_FAILURE,
  UPLOAD_TO_CLOUDINARY_REQUEST,
  UPLOAD_TO_CLOUDINARY_SUCCESS,
} from "./auth.actionType";
import axios from "axios";

// Redirect helper function
const redirectToHome = (navigate) => {
  navigate("/");
};

// Login User Action
export const loginUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/signin`,
      loginData.data
    );

    if (data.token) {
      localStorage.setItem("jwt", data.token);
    }

    // Dispatch LOGIN_SUCCESS with the token
    dispatch({ type: LOGIN_SUCCESS, payload: data.token });

    // Immediately fetch the user profile after login
    dispatch(getProfileAction(data.token));

    return { success: true }; // Return success to trigger navigation in component
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Login failed. Please try again.";
    console.log("Login error:", errorMessage);
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage });

    return {
      success: false,
      message: errorMessage,
    };
  }
};

const CLOUDINARY_UPLOAD_PRESET = "expense_tracker";
const CLOUDINARY_CLOUD_NAME = "dtun8attk";
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Action Creators
export const uploadToCloudinary = (file) => {
  return async (dispatch) => {
    dispatch({ type: UPLOAD_TO_CLOUDINARY_REQUEST });

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await axios.post(CLOUDINARY_UPLOAD_URL, uploadData);
      dispatch({
        type: UPLOAD_TO_CLOUDINARY_SUCCESS,
        payload: response.data.secure_url,
      });
    } catch (error) {
      dispatch({
        type: UPLOAD_TO_CLOUDINARY_FAILURE,
        payload: error.response?.data?.message || "Image upload failed",
      });
    }
  };
};

export const resetCloudinaryState = () => ({
  type: RESET_CLOUDINARY_STATE,
});

// Register User Action
export const registerUserAction = (loginData) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/signup`,
      loginData.data
    );

    if (data.token) {
      localStorage.setItem("jwt", data.token);
    }

    dispatch({ type: LOGIN_SUCCESS, payload: data.token });

    // Fetch the user profile after registration
    dispatch(getProfileAction(data.token));

    return { success: true };
  } catch (error) {
    console.log("Register error:", error);
    dispatch({ type: LOGIN_FAILURE, payload: error });

    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Get Profile Action
export const getProfileAction = (jwt) => async (dispatch) => {
  dispatch({ type: GET_PROFILE_REQUEST });

  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const firstName = data.firstName;

    console.log("First Name:", firstName);
    dispatch({ type: GET_PROFILE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_PROFILE_FAILURE, payload: error });
  }
};

// Update Profile Action
export const updateProfileAction = (reqData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });

  try {
    const token = localStorage.getItem("jwt");
    if (!token) {
      throw new Error("Authorization token is missing");
    }

    const { data } = await axios.put(`${API_BASE_URL}/api/users`, reqData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch({ type: UPDATE_PROFILE_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAILURE,
      payload: error.response?.data || error.message,
    });
  }
};

// Logout Action
export const logoutAction = () => (dispatch) => {
  // Remove JWT from localStorage
  localStorage.removeItem("jwt");

  // Dispatch the logout action to reset user state
  dispatch({ type: "LOGOUT" });

  // Optionally, redirect user to login page
  // navigate("/login");
};
