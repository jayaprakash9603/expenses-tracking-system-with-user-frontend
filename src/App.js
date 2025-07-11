import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import Authentication from "./pages/Authentication/Authentication";
import HomePage from "./pages/Home/HomePage";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getProfileAction } from "./Redux/Auth/auth.action";
import Parent from "./pages/DetailedExpensesTable/Parent";
import Loader from "./components/Loaders/Loader";
import CreateExpenses from "./components/CreateExpenses/CreateExpenses";
import ReportsGeneration from "./pages/ReportsGeneration";
import Upload from "./pages/Fileupload/Upload"; // Import Upload component
import Home from "./pages/Landingpage/Home";
import HomeContent from "./pages/Landingpage/HomeContent";
import ExpensesContent from "./pages/Landingpage/ExpensesContent";
import TransactionsContent from "./pages/Landingpage/TransactionsContent";
import CreditDueContent from "./pages/Landingpage/CreditDueContent";
import Budget from "./pages/Landingpage/Budget";
import EditExpense from "./pages/Landingpage/EditExpense";
import NewExpense from "./pages/Landingpage/NewExpense";
import Profile from "./pages/Landingpage/Profile";
import NewBudget from "./pages/Landingpage/NewBudget";
import EditBudget from "./pages/Landingpage/EditBudget";
import BudgetReport from "./pages/Landingpage/BudgetReport";
import Reports from "./pages/Landingpage/Reports";
import Cashflow from "./pages/Landingpage/CashFlow";
import CalendarView from "./pages/Landingpage/CalendarView";
import DayTransactionsView from "./pages/Landingpage/DayTransactionsView";
import CategoryFlow from "./pages/Landingpage/CategoryFlow";
import CreateCategory from "./pages/Landingpage/CreateCategory";
import EditCategory from "./pages/Landingpage/EditCategory";
import Utilities from "./pages/Landingpage/Utilities";
import Friends from "./pages/Landingpage/Friends";
import FriendExpenses from "./pages/Landingpage/FriendsExpenses";
import ExpensesView from "./pages/Landingpage/ExpensesView";
import SocketProvider from "./utils/SocketProvider";
import { initializeSocket } from "./services/socketService";

function App() {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const jwt = localStorage.getItem("jwt");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (jwt) {
      dispatch(getProfileAction(jwt)).finally(() => setLoading(false));

      navigate("/");
    } else {
      setLoading(false);
    }
  }, [jwt, dispatch]);

  if (loading) {
    return <Loader />;
  }

  // Redirect if JWT is invalid or not present
  if (!jwt || !auth.user) {
    return (
      <Routes>
        <Route path="/*" element={<Authentication />} />
      </Routes>
    );
  }

  return (
    <SocketProvider>
      <div className="">
        <Routes>
          {/* Other Routes */}

          <Route path="/" element={<Home />}>
            <Route index element={<Navigate to="/home" />} />
            <Route path="home" element={<HomeContent />} />
            <Route path="profile" element={<Profile />} />
            <Route path="friends" element={<Friends />} />

            <Route path="friends">
              <Route index element={<Friends />} />
              <Route path="expenses/:friendId" element={<FriendExpenses />} />
            </Route>
            <Route path="all" element={<Utilities />} />

            <Route path="upload">
              <Route index element={<Upload />} />
              <Route path=":friendId" element={<Upload />} />
            </Route>
            {/* Nested expenses route */}
            <Route path="expenses">
              <Route index element={<Cashflow />} />
              <Route path="create" element={<NewExpense />} />
              <Route path="create/:friendId" element={<NewExpense />} />
              <Route path="edit/:id" element={<EditExpense />} />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditExpense />}
              />
            </Route>
            <Route path="category-flow">
              <Route index element={<CategoryFlow />} />
              <Route path=":friendId" element={<CategoryFlow />} />
              <Route path="create" element={<CreateCategory />} />
              <Route path="create/:friendId" element={<CreateCategory />} />
              <Route path="edit/:id" element={<EditCategory />} />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditCategory />}
              />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditCategory />}
              />
            </Route>

            <Route path="transactions">
              <Route index element={<TransactionsContent />} />
              <Route path=":friendId" element={<TransactionsContent />} />
            </Route>
            <Route path="insights">
              <Route index element={<CreditDueContent />} />
              <Route path=":friendId" element={<CreditDueContent />} />
            </Route>
            <Route path="reports">
              <Route index element={<Reports />} />
              <Route path=":friendId" element={<Reports />} />
            </Route>
            <Route path="cashflow">
              <Route index element={<ExpensesView />} />
              <Route path=":friendId" element={<ExpensesView />} />
            </Route>
            <Route path="budget">
              <Route index element={<Budget />} />
              <Route path=":friendId" element={<Budget />} />
              <Route path="create" element={<NewBudget />} />
              <Route path="create/:friendId" element={<NewBudget />} />
              <Route path="edit/:id" element={<EditBudget />} />
              <Route
                path="edit/:id/friend/:friendId"
                element={<EditBudget />}
              />
              <Route path="report/:id" element={<BudgetReport />} />
              <Route
                path="report/:id/friend/:friendId"
                element={<BudgetReport />}
              />
            </Route>
            <Route path="/calendar-view">
              <Route index element={<CalendarView />} />
              <Route path=":friendId" element={<CalendarView />} />
            </Route>
            <Route path="/day-view">
              <Route path=":date" element={<DayTransactionsView />} />
              <Route
                path=":date/friend/:friendId"
                element={<DayTransactionsView />}
              />
            </Route>
          </Route>

          {/* Other Routes */}
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App;
