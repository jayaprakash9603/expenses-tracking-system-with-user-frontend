import { UPDATE_PROFILE_REQUEST } from "../Auth/auth.actionType";

import {
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  FETCH_PREVIOUS_EXPENSES_FAILURE,
  FETCH_PREVIOUS_EXPENSES_REQUEST,
  FETCH_PREVIOUS_EXPENSES_SUCCESS,
  GET_ALL_EXPENSES_FAILURE,
  GET_ALL_EXPENSES_REQUEST,
  GET_ALL_EXPENSES_SUCCESS,
  GET_EXPENSE_FAILURE,
  GET_EXPENSE_REQUEST,
  GET_EXPENSE_SUCCESS,
  RESET_UPLOAD_STATE,
  UPLOAD_FILE_FAILURE,
  UPLOAD_FILE_REQUEST,
  UPLOAD_FILE_SUCCESS,
} from "./expense.actionType";

const initialState = {
  expenses: [],
  previousExpenses: [],
  expense: null, // For single expense
  loading: false,
  error: null,
  uploadSuccess: false,
  uploadError: null,
};

export const expenseReducer = (state = initialState, action) => {
  switch (action.type) {
    // Request actions
    case GET_ALL_EXPENSES_REQUEST:
    case CREATE_EXPENSE_REQUEST:
    case UPDATE_PROFILE_REQUEST:
    case GET_EXPENSE_REQUEST:
    case DELETE_EXPENSE_REQUEST:
      return { ...state, error: null, loading: true };

    // Success actions
    case GET_ALL_EXPENSES_SUCCESS:
      return {
        ...state,
        expenses: action.payload,
        loading: false,
        error: null,
      };
    case CREATE_EXPENSE_SUCCESS:
      return {
        ...state,
        expenses: [...state.expenses, action.payload], // Assuming payload contains the new expense
        loading: false,
        error: null,
      };
    case GET_EXPENSE_SUCCESS:
      return { ...state, expense: action.payload, loading: false, error: null };
    case DELETE_EXPENSE_SUCCESS:
      const updatedExpenses = { ...state.expenses };

      // Loop through each date key and filter the deleted expense by id
      Object.keys(updatedExpenses).forEach((date) => {
        updatedExpenses[date] = updatedExpenses[date].filter(
          (expense) => expense.id !== action.payload
        );
      });

      return {
        ...state,
        expenses: updatedExpenses,
        loading: false,
      };

    // Failure actions
    case GET_ALL_EXPENSES_FAILURE:
    case GET_EXPENSE_FAILURE:
    case DELETE_EXPENSE_FAILURE:
      return { ...state, error: action.payload, loading: false };
    case FETCH_PREVIOUS_EXPENSES_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case FETCH_PREVIOUS_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        previousExpenses: action.payload,
      };
    case FETCH_PREVIOUS_EXPENSES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Default case
    default:
      return state;
  }
};

export const uploadReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPLOAD_FILE_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case UPLOAD_FILE_SUCCESS:
      return { ...state, loading: false, success: true, data: action.payload };
    case UPLOAD_FILE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case RESET_UPLOAD_STATE:
      return initialState;
    default:
      return state;
  }
};
