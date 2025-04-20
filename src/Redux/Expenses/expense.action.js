import axios from "axios";
import { api } from "../../config/api";
import {
  CREATE_EXPENSE_FAILURE,
  CREATE_EXPENSE_REQUEST,
  CREATE_EXPENSE_SUCCESS,
  DELETE_EXPENSE_FAILURE,
  DELETE_EXPENSE_REQUEST,
  DELETE_EXPENSE_SUCCESS,
  EDIT_EXPENSE_FAILURE,
  EDIT_EXPENSE_REQUEST,
  EDIT_EXPENSE_SUCCESS,
  FETCH_PREVIOUS_EXPENSES_FAILURE,
  FETCH_PREVIOUS_EXPENSES_REQUEST,
  FETCH_PREVIOUS_EXPENSES_SUCCESS,
  GET_ALL_EXPENSES_FAILURE,
  GET_ALL_EXPENSES_REQUEST,
  GET_ALL_EXPENSES_SUCCESS,
  GET_EXPENSE_FAILURE,
  GET_EXPENSE_REQUEST,
  GET_EXPENSE_SUCCESS,
} from "./expense.actionType";

const token = localStorage.getItem("jwt");
export const getExpensesAction =
  (jwt, sortOrder = "desc") =>
  async (dispatch) => {
    dispatch({ type: GET_ALL_EXPENSES_REQUEST });

    const token = localStorage.getItem("jwt"); // ✅ move inside the function

    if (!token) {
      console.error("JWT not found in localStorage");
      dispatch({ type: GET_ALL_EXPENSES_FAILURE, payload: "JWT not found" });
      return;
    }

    try {
      const { data } = await api.get(`/api/expenses/groupedByDate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          sortOrder,
        },
      });

      dispatch({ type: GET_ALL_EXPENSES_SUCCESS, payload: data });
    } catch (error) {
      console.log("Error fetching expenses: ", error);
      dispatch({ type: GET_ALL_EXPENSES_FAILURE, payload: error });
    }
  };

export const getExpenseAction = (id) => async (dispatch) => {
  dispatch({ type: GET_EXPENSE_REQUEST });

  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    console.error("JWT not found in localStorage");
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.get(`/api/expenses/expense/${id}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    dispatch({ type: GET_EXPENSE_SUCCESS, payload: data });
    console.log("get users expense", data);
  } catch (error) {
    console.log("error user expense error ", error);
    dispatch({ type: GET_EXPENSE_FAILURE, payload: error });
  }
};
export const createExpenseAction = (expenseData) => async (dispatch) => {
  dispatch({ type: CREATE_EXPENSE_REQUEST });

  const jwt = localStorage.getItem("jwt");

  if (!jwt) {
    console.error("JWT not found in localStorage");
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: "JWT not found" });
    return;
  }

  try {
    const { data } = await api.post(
      `/api/expenses/add-expense`,
      expenseData, // Send the expense data in the body of the POST request
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    dispatch({ type: CREATE_EXPENSE_SUCCESS, payload: data });
    console.log("Expense created successfully:", data);
  } catch (error) {
    dispatch({ type: CREATE_EXPENSE_FAILURE, payload: error.message });
    console.error("Error creating expense:", error);
  }
};

export const editExpenseAction =
  (expenseId, updatedData) => async (dispatch) => {
    dispatch({ type: EDIT_EXPENSE_REQUEST });

    try {
      const response = await api.put(
        `/api/expenses/edit-expense/${expenseId}`,
        updatedData
      ); // Adjust the API endpoint
      dispatch({ type: EDIT_EXPENSE_SUCCESS, payload: response.data });
      console.log("Expense edited successfully:", response.data);
    } catch (error) {
      dispatch({ type: EDIT_EXPENSE_FAILURE, payload: error.message });
      console.error("Error editing expense:", error);
    }
  };

export const deleteExpenseAction = (id) => async (dispatch) => {
  dispatch({ type: DELETE_EXPENSE_REQUEST });

  try {
    await api.delete(`/api/expenses/delete/${id}`);
    dispatch({
      type: DELETE_EXPENSE_SUCCESS,
      payload: "Expense deleted successfully",
    });
    console.log("Expense deleted successfully");
  } catch (error) {
    dispatch({
      type: DELETE_EXPENSE_FAILURE,
      payload: error.message,
    });
    console.error("Error deleting expense:", error);
  }
};

export const fetchPreviousExpenses =
  (expenseName, date) => async (dispatch) => {
    dispatch({ type: FETCH_PREVIOUS_EXPENSES_REQUEST });

    console.log(
      "Fetching previous expenses for:",
      expenseName,
      "on date:",
      date
    );

    try {
      const response = await axios.get(
        `http://localhost:8080/api/expenses/before/${expenseName}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response from backend:", response);

      dispatch({
        type: FETCH_PREVIOUS_EXPENSES_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.log("Error fetching previous expenses:", error);

      dispatch({
        type: FETCH_PREVIOUS_EXPENSES_FAILURE,
        payload: error.response?.data || error.message,
      });
    }
  };
