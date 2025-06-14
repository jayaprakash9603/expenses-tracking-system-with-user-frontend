import {
  legacy_createStore,
  applyMiddleware,
  combineReducers,
  compose,
} from "redux";
import { thunk } from "redux-thunk";
import { authReducer } from "./Auth/auth.reducer";
import {
  expenseReducer,
  saveExpensesReducer,
  uploadReducer,
} from "./Expenses/expense.reducer";
import { budgetReducer } from "./Budget/budget.reducer";
import categoryReducer from "./Category/categoryReducer";
import friendsReducer from "./Friends/friendsReducer";

// Combine reducers
const rootreducers = combineReducers({
  auth: authReducer,
  expenses: expenseReducer,
  fileUpload: uploadReducer,
  savedExpenses: saveExpensesReducer,
  budgets: budgetReducer,
  categories: categoryReducer,
  friends: friendsReducer,
});

// Compose enhancer with DevTools support
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create store with DevTools and middleware
export const store = legacy_createStore(
  rootreducers,
  composeEnhancers(applyMiddleware(thunk))
);
