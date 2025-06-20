import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import {
  createExpenseAction,
  editExpenseAction,
  fetchPreviousExpenses,
  getExpenseAction,
  getExpensesSuggestions,
} from "../../Redux/Expenses/expense.action";
import {
  getListOfBudgetsByExpenseId,
  getListOfBudgetsById,
} from "../../Redux/Budget/budget.action";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Use the same fieldStyles, labelStyle, formRow, firstFormRow, inputWrapper as NewExpense
const fieldStyles =
  "px-3 py-2 rounded bg-[#29282b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-base sm:max-w-[300px] max-w-[200px] border-0";
const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const formRow = "mt-4 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
const firstFormRow =
  "mt-2 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
const inputWrapper = { width: "150px" };

const EditExpense = ({}) => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { id, friendId } = useParams();
  const { expense } = useSelector((state) => state.expenses || {});
  const { budgets, error: budgetError } = useSelector(
    (state) => state.budgets || {}
  );
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state) => state.categories || {});
  const dispatch = useDispatch();

  const [expenseData, setExpenseData] = useState({
    expenseName: "",
    amount: "",
    netAmount: "",
    paymentMethod: "cash",
    transactionType: "loss",
    comments: "",
    date: today,
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [checkboxStates, setCheckboxStates] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Get topExpenses from Redux, just like NewExpense
  const { topExpenses, loading: loadingTopExpenses } = useSelector(
    (state) => state.expenses || {}
  );

  // Fetch budgets and expense data on component mount
  useEffect(() => {
    const fetchDate = expense?.date || today;
    console.log(
      "Initial fetch budgets with expenseId:",
      id,
      "date:",
      fetchDate
    );
    dispatch(
      getListOfBudgetsByExpenseId({
        id,
        date: fetchDate,
        targetId: friendId || "",
      })
    );
    dispatch(getExpenseAction(id || "", friendId || ""));
  }, [dispatch]);

  // Fetch expense name suggestions (same as NewExpense)
  useEffect(() => {
    dispatch(getExpensesSuggestions(friendId || ""));
  }, [dispatch]);

  // Update checkbox states when budgets change
  useEffect(() => {
    console.log("Budgets updated:", budgets);
    setCheckboxStates(budgets.map((budget) => !!budget.includeInBudget));
  }, [budgets]);

  // Update form data when expense is fetched
  useEffect(() => {
    if (expense) {
      console.log("Expense data received:", expense);
      setExpenseData({
        expenseName: expense.expense.expenseName || "",
        amount: expense.expense.amount || "",
        netAmount: expense.expense.netAmount || "",
        paymentMethod: expense.expense.paymentMethod || "cash",
        transactionType: expense.expense.type || "loss",
        comments: expense.expense.comments || "",
        date: expense.date || today,
        category: expense.expense.category || "",
      });
    }
  }, [expense, today]);

  // Fetch suggestions based on input (same as NewExpense)
  const fetchSuggestions = (query) => {
    if (!query || !query.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    const filtered = (topExpenses || []).filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
    setLoadingSuggestions(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData({ ...expenseData, [name]: value });
  };

  const handleDateChange = (e) => {
    const { value } = e.target;
    const newDate = new Date(value);

    const lastDayOfMonth = new Date(
      newDate.getFullYear(),
      newDate.getMonth() + 1,
      0
    );

    let salaryDate = new Date(lastDayOfMonth);
    if (salaryDate.getDay() === 6) {
      salaryDate.setDate(salaryDate.getDate() - 1);
    } else if (salaryDate.getDay() === 0) {
      salaryDate.setDate(salaryDate.getDate() - 2);
    }

    const isSalary = newDate.toDateString() === salaryDate.toDateString();

    setExpenseData((prevState) => ({
      ...prevState,
      date: value,
      transactionType: isSalary ? "gain" : "loss",
    }));

    console.log("Fetching budgets for expenseId:", id, "date:", value);
    dispatch(
      getListOfBudgetsByExpenseId({ id, date: value, targetId: friendId || "" })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!expenseData.expenseName)
      newErrors.expenseName = "Expense title is required.";
    if (!expenseData.amount) newErrors.amount = "Amount is required.";
    if (!expenseData.date) newErrors.date = "Date is required.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const budgetIds = budgets
      .filter((_, index) => checkboxStates[index])
      .map((budget) => budget.id);

    try {
      await dispatch(
        editExpenseAction(
          id,
          {
            date: expenseData.date,
            budgetIds: budgetIds,
            expense: {
              expenseName: expenseData.expenseName,
              amount: expenseData.amount,
              netAmount: expenseData.amount,
              paymentMethod: expenseData.paymentMethod,
              type: expenseData.transactionType,
              comments: expenseData.comments,
              category: expenseData.category || "",
            },
          },
          friendId || ""
        )
      );
      setToastMessage("Expense updated successfully!");
      setOpenToast(true);
      navigate(-1, {
        state: { successMessage: "Expense updated successfully!" },
      });
    } catch (err) {
      console.error("Error updating expense:", err);
      setToastMessage("Something went wrong!");
      setOpenToast(true);
    }
  };

  const handleLinkBudgets = () => {
    const fetchDate = expense?.date || today;

    setShowTable(true);
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prev) => {
      const newStates = prev.map((state, i) => (i === index ? !state : state));
      console.log(`Checkbox ${index} changed. New checkboxStates:`, newStates);
      return newStates;
    });
  };

  // Highlight matching text in suggestions (update: highlight text, not background)
  const highlightText = (text, inputValue) => {
    if (!inputValue) return text;
    const regex = new RegExp(
      `(${inputValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          style={{
            background: "none",
            color: "#00dac6",
            fontWeight: 700,
            padding: 0,
          }}
        >
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  // Render input fields with consistent style and required asterisk
  const renderInput = (id, type = "text", isTextarea = false) => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor={id} className={labelStyle} style={inputWrapper}>
          {id
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
          {["expenseName", "amount", "date", "transactionType"].includes(
            id
          ) && <span className="text-red-500"> *</span>}
        </label>
        {isTextarea ? (
          <textarea
            id={id}
            name={id}
            value={expenseData[id]}
            onChange={handleInputChange}
            placeholder={`Enter ${id}`}
            rows="3"
            className={fieldStyles}
            style={{
              height: "80px",
              borderColor: errors[id] ? "#ff4d4f" : "rgb(75, 85, 99)",
              borderWidth: errors[id] ? "2px" : "1px",
            }}
          />
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            value={expenseData[id]}
            onChange={handleInputChange}
            placeholder={`Enter ${id}`}
            className={fieldStyles}
            style={{
              borderColor: errors[id] ? "#ff4d4f" : "rgb(75, 85, 99)",
              borderWidth: errors[id] ? "2px" : "1px",
            }}
          />
        )}
      </div>
      {errors[id] && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors[id]}
        </span>
      )}
    </div>
  );

  const renderSelect = (id, options) => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor={id} className={labelStyle} style={inputWrapper}>
          {id
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
        </label>
        <select
          id={id}
          name={id}
          value={expenseData[id]}
          onChange={handleInputChange}
          className={fieldStyles}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {errors[id] && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors[id]}
        </span>
      )}
    </div>
  );

  const renderCustomDateInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="date" className={labelStyle} style={inputWrapper}>
          Date<span className="text-red-500"> *</span>
        </label>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            value={expenseData.date ? dayjs(expenseData.date) : null}
            onChange={(newValue) => {
              if (newValue) {
                const formatted = dayjs(newValue).format("YYYY-MM-DD");
                handleDateChange({ target: { value: formatted } });
              }
            }}
            sx={{
              background: "#1b1b1b",
              borderRadius: 2,
              color: "#fff",
              ".MuiInputBase-input": {
                color: "#fff",
                height: 32,
                fontSize: 18,
              },
              ".MuiSvgIcon-root": { color: "#00dac6" },
              width: 300,
              height: 56,
              minHeight: 56,
              maxHeight: 56,
            }}
            slotProps={{
              textField: {
                size: "medium",
                variant: "outlined",
                sx: {
                  color: "#fff",
                  height: 56,
                  minHeight: 56,
                  maxHeight: 56,
                  width: 300,
                  fontSize: 18,
                  "& .MuiInputBase-root": {
                    height: 56,
                    minHeight: 56,
                    maxHeight: 56,
                  },
                  "& input": {
                    height: 32,
                    fontSize: 18,
                  },
                },
                inputProps: {
                  max: dayjs().format("YYYY-MM-DD"),
                },
              },
            }}
            disableFuture
            format="DD-MM-YYYY"
          />
        </LocalizationProvider>
      </div>
      {errors.date && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.date}
        </span>
      )}
    </div>
  );

  const renderCategoryAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="category" className={labelStyle} style={inputWrapper}>
          Category
        </label>
        <Autocomplete
          autoHighlight
          options={categories}
          getOptionLabel={(option) => option.name || ""}
          value={
            categories.find((cat) => cat.id === expenseData.category) || null
          }
          onInputChange={(event, newValue) => {
            const matchedCategory = categories.find(
              (cat) => cat.name.toLowerCase() === newValue.toLowerCase()
            );
            setExpenseData((prev) => ({
              ...prev,
              category: matchedCategory ? matchedCategory.id : "",
            }));
          }}
          onChange={(event, newValue) => {
            setExpenseData((prev) => ({
              ...prev,
              category: newValue ? newValue.id : "",
            }));
          }}
          noOptionsText="No options found"
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search category"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                className: fieldStyles,
              }}
            />
          )}
          renderOption={(props, option, { inputValue }) => (
            <li
              {...props}
              style={{
                fontSize: "0.92rem",
                paddingTop: 4,
                paddingBottom: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 300,
              }}
              title={option.name}
            >
              {highlightText(option.name, inputValue)}
            </li>
          )}
          sx={{ width: "100%", maxWidth: "300px" }}
        />
      </div>
      {errors.category && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.category}
        </span>
      )}
    </div>
  );

  const renderPaymentMethodAutocomplete = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="paymentMethod"
          className={labelStyle}
          style={inputWrapper}
        >
          Payment Method
        </label>
        <Autocomplete
          autoHighlight
          options={["Cash", "Credit Need to Paid", "Credit Paid"]}
          getOptionLabel={(option) => option}
          value={expenseData.paymentMethod || ""}
          onInputChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, paymentMethod: newValue }));
          }}
          onChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, paymentMethod: newValue }));
          }}
          noOptionsText="No options found"
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select payment method"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                className: fieldStyles,
              }}
            />
          )}
          renderOption={(props, option, { inputValue }) => (
            <li
              {...props}
              style={{
                fontSize: "0.92rem",
                paddingTop: 4,
                paddingBottom: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 300,
              }}
              title={option}
            >
              {highlightText(option, inputValue)}
            </li>
          )}
          sx={{ width: "100%", maxWidth: "300px" }}
        />
      </div>
      {errors.paymentMethod && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.paymentMethod}
        </span>
      )}
    </div>
  );

  // DataGrid columns for budgets (with checkbox like EditBudget)
  const dataGridColumns = [
    {
      field: "includeInBudget",
      headerName: (
        <input
          type="checkbox"
          checked={checkboxStates.length > 0 && checkboxStates.every(Boolean)}
          ref={(el) => {
            if (el) {
              el.indeterminate =
                checkboxStates.some(Boolean) && !checkboxStates.every(Boolean);
            }
          }}
          onChange={(e) => {
            const checked = e.target.checked;
            setCheckboxStates(Array(budgets.length).fill(checked));
          }}
          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          style={{ accentColor: "#00b8a0", marginLeft: 2, marginRight: 2 }}
        />
      ),
      flex: 0.25,
      minWidth: 40,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <input
          type="checkbox"
          checked={checkboxStates[params.row.index]}
          onChange={() => handleCheckboxChange(params.row.index)}
          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          style={{ accentColor: "#00b8a0" }}
        />
      ),
    },
    { field: "name", headerName: "Name", flex: 1, minWidth: 120 },
    { field: "description", headerName: "Description", flex: 1, minWidth: 120 },
    { field: "startDate", headerName: "Start Date", flex: 1, minWidth: 100 },
    { field: "endDate", headerName: "End Date", flex: 1, minWidth: 100 },
    {
      field: "remainingAmount",
      headerName: "Remaining Amount",
      flex: 1,
      minWidth: 120,
    },
    { field: "amount", headerName: "Amount", flex: 1, minWidth: 100 },
  ];

  // DataGrid rows for budgets
  const dataGridRows = Array.isArray(budgets)
    ? budgets.map((item, index) => ({
        ...item,
        index,
        id: item.id ?? `temp-${index}-${Date.now()}`,
        includeInBudget: checkboxStates[index],
      }))
    : [];

  // Map checkboxStates to DataGrid selection model
  const selectedIds = dataGridRows
    .filter((_, idx) => checkboxStates[idx])
    .map((row) => row.id);

  const handleDataGridSelection = (newSelection) => {
    // Map DataGrid selection to checkboxStates
    const newCheckboxStates = dataGridRows.map((row, idx) =>
      newSelection.includes(row.id)
    );
    setCheckboxStates(newCheckboxStates);
  };

  const columns = useMemo(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        size: 150,
      },
      {
        header: "In Budget",
        accessorKey: "includeInBudget",
        size: 80,
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={checkboxStates[row.index] || false}
            onChange={() => handleCheckboxChange(row.index)}
            className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
          />
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        size: 200,
      },
      {
        header: "Start Date",
        accessorKey: "startDate",
        size: 120,
      },
      {
        header: "End Date",
        accessorKey: "endDate",
        size: 120,
      },
      {
        header: "Remaining Amount",
        accessorKey: "remainingAmount",
        size: 120,
      },
      {
        header: "Amount",
        accessorKey: "amount",
        size: 100,
      },
    ],
    [checkboxStates]
  );

  const table = useReactTable({
    data: budgets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount: Math.ceil(budgets.length / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
  });

  const handleOnClose = () => {
    navigate(-1);
  };

  // Render input fields with consistent style and required asterisk
  const renderExpenseNameWithSuggestions = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label
          htmlFor="expenseName"
          className={labelStyle}
          style={inputWrapper}
        >
          Expense Name<span className="text-red-500"> *</span>
        </label>
        <Autocomplete
          freeSolo
          autoHighlight
          options={suggestions}
          loading={loadingTopExpenses || loadingSuggestions}
          loadingText="Loading"
          noOptionsText={expenseData?.expenseName ? "No Data Found" : ""}
          value={expenseData?.expenseName || ""}
          onInputChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, expenseName: newValue }));
            fetchSuggestions(newValue);
          }}
          onChange={(event, newValue) => {
            setExpenseData((prev) => ({
              ...prev,
              expenseName: newValue || "",
            }));
          }}
          openOnFocus
          sx={{
            width: "100%",
            maxWidth: "300px",
            "& .MuiAutocomplete-option": {
              fontSize: "0.92rem", // smaller font size for options
              paddingTop: "4px",
              paddingBottom: "4px",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: errors.expenseName ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: errors.expenseName ? "2px" : "1px",
              },
              "&:hover fieldset": {
                borderColor: errors.expenseName ? "#ff4d4f" : "rgb(75, 85, 99)",
              },
              "&.Mui-focused fieldset": {
                borderColor: errors.expenseName ? "#ff4d4f" : "#00dac6",
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Enter expense name"
              variant="outlined"
              error={errors.expenseName}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingTopExpenses || loadingSuggestions ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
                className: fieldStyles,
              }}
            />
          )}
          renderOption={(props, option, { inputValue }) => (
            <li
              {...props}
              style={{
                fontSize: "0.92rem",
                paddingTop: 4,
                paddingBottom: 12,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 300,
              }}
              title={option}
            >
              {highlightText(option, inputValue)}
            </li>
          )}
        />
      </div>
      {errors.expenseName && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.expenseName}
        </span>
      )}
    </div>
  );

  return (
    <>
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
      <div
        className="flex flex-col relative new-expense-container"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          border: "1px solid rgb(0, 0, 0)",
          padding: "20px",
        }}
      >
        <div className="w-full flex justify-between items-center mb-1">
          <p className="text-white font-extrabold text-4xl">Edit Expense</p>
          <button
            onClick={handleOnClose}
            className="flex items-center justify-center w-12 h-12 text-[32px] font-bold bg-[#29282b] rounded mt-[-10px]"
            style={{ color: "#00dac6" }}
          >
            ×
          </button>
        </div>
        <hr className="border-t border-gray-600 w-full mt-[-4px]" />

        <div className={firstFormRow}>
          {/* Expense Name (MUI Autocomplete with suggestions) */}
          {renderExpenseNameWithSuggestions()}
          {/* Amount (MUI TextField) */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center">
              <label
                htmlFor="amount"
                className={labelStyle}
                style={inputWrapper}
              >
                Amount<span className="text-red-500"> *</span>
              </label>
              <TextField
                id="amount"
                name="amount"
                type="number"
                value={expenseData.amount || ""}
                onChange={(e) =>
                  setExpenseData((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="Enter amount"
                variant="outlined"
                error={errors.amount}
                InputProps={{
                  className: fieldStyles,
                  style: {
                    height: "52px",
                    borderColor: errors.amount ? "#ff4d4f" : "rgb(75, 85, 99)",
                    borderWidth: errors.amount ? "2px" : "1px",
                  },
                }}
                sx={{
                  width: "100%",
                  maxWidth: "300px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: errors.amount
                        ? "#ff4d4f"
                        : "rgb(75, 85, 99)",
                      borderWidth: errors.amount ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.amount
                        ? "#ff4d4f"
                        : "rgb(75, 85, 99)",
                      borderWidth: errors.amount ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.amount ? "#ff4d4f" : "#00dac6",
                      borderWidth: errors.amount ? "2px" : "2px",
                      borderStyle: "solid",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.amount
                        ? "#ff4d4f"
                        : "rgb(75, 85, 99)",
                      borderWidth: errors.amount ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                  },
                }}
              />
            </div>
            {errors.amount && (
              <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
                {errors.amount}
              </span>
            )}
          </div>
          {/* Date (MUI DatePicker) */}
          {renderCustomDateInput()}
        </div>
        <div className={formRow}>
          {/* Transaction Type (MUI Autocomplete) */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center">
              <label
                htmlFor="transactionType"
                className={labelStyle}
                style={inputWrapper}
              >
                Transaction Type<span className="text-red-500"> *</span>
              </label>
              <Autocomplete
                autoHighlight
                options={["Gain", "Loss"]}
                getOptionLabel={(option) => option}
                value={expenseData.transactionType || ""}
                onInputChange={(event, newValue) => {
                  setExpenseData((prev) => ({
                    ...prev,
                    transactionType: newValue,
                  }));
                }}
                onChange={(event, newValue) => {
                  setExpenseData((prev) => ({
                    ...prev,
                    transactionType: newValue,
                  }));
                }}
                noOptionsText="No options found"
                sx={{
                  width: "100%",
                  maxWidth: "300px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: errors.transactionType
                        ? "#ff4d4f"
                        : "rgb(75, 85, 99)",
                      borderWidth: errors.transactionType ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                    "&:hover fieldset": {
                      borderColor: errors.transactionType
                        ? "#ff4d4f"
                        : "rgb(75, 85, 99)",
                      borderWidth: errors.transactionType ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: errors.transactionType
                        ? "#ff4d4f"
                        : "#00dac6",
                      borderWidth: errors.transactionType ? "2px" : "2px",
                      borderStyle: "solid",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: errors.transactionType
                        ? "#ff4d4f"
                        : "rgb(75, 85, 99)",
                      borderWidth: errors.transactionType ? "2px" : "1px",
                      borderStyle: "solid",
                    },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select transaction type"
                    variant="outlined"
                    error={errors.transactionType}
                    InputProps={{
                      ...params.InputProps,
                      className: fieldStyles,
                    }}
                  />
                )}
                renderOption={(props, option, { inputValue }) => (
                  <li
                    {...props}
                    style={{
                      fontSize: "0.92rem",
                      paddingTop: 4,
                      paddingBottom: 12,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 300,
                    }}
                    title={option}
                  >
                    {highlightText(option, inputValue)}
                  </li>
                )}
              />
            </div>
            {errors.transactionType && (
              <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
                {errors.transactionType}
              </span>
            )}
          </div>
          {/* Category (MUI Autocomplete) */}
          {renderCategoryAutocomplete()}
          {/* Payment Method (MUI Autocomplete) */}
          {renderPaymentMethodAutocomplete()}
        </div>
        <div className={formRow}>
          {/* Comments (MUI TextField multiline) */}
          <div className="flex flex-col flex-1">
            <div className="flex items-center">
              <label
                htmlFor="comments"
                className={labelStyle}
                style={inputWrapper}
              >
                Comments
              </label>
              <TextField
                id="comments"
                name="comments"
                value={expenseData.comments || ""}
                onChange={(e) =>
                  setExpenseData((prev) => ({
                    ...prev,
                    comments: e.target.value,
                  }))
                }
                placeholder="Enter comments (optional)"
                variant="outlined"
                multiline
                minRows={3}
                maxRows={5}
                InputProps={{
                  className: fieldStyles,
                  style: { height: "auto" },
                }}
                sx={{
                  width: "100%",
                  maxWidth: "920px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgb(75, 85, 99)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgb(75, 85, 99)",
                      borderWidth: "1px",
                      borderStyle: "solid",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00dac6",
                      borderWidth: "2px",
                      borderStyle: "solid",
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
          <button
            onClick={handleLinkBudgets}
            className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[150px]"
          >
            Link Budgets
          </button>
          {showTable && (
            <button
              onClick={handleCloseTable}
              className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a] mt-2 sm:mt-0 hidden sm:block"
            >
              X
            </button>
          )}
        </div>

        {showTable && (
          <div className="mt-4 sm:mt-6 w-full relative">
            <div className="block sm:hidden space-y-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleCloseTable}
                  className="px-2 py-1 bg-[#29282b] text-white border border-gray-700 rounded hover:bg-[#3a3a3a]"
                >
                  X
                </button>
              </div>
              {budgets.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No rows found
                </div>
              ) : (
                budgets.map((row, index) => (
                  <div
                    key={row.id}
                    className="bg-[#29282b] border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">
                        {row.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm">In Budget</span>
                        <input
                          type="checkbox"
                          checked={checkboxStates[index]}
                          onChange={() => handleCheckboxChange(index)}
                          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
                        />
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>
                        <span className="font-medium">Description:</span>{" "}
                        {row.description}
                      </p>
                      <p>
                        <span className="font-medium">Start Date:</span>{" "}
                        {row.startDate}
                      </p>
                      <p>
                        <span className="font-medium">End Date:</span>{" "}
                        {row.endDate}
                      </p>
                      <p>
                        <span className="font-medium">Remaining Amount:</span>{" "}
                        {row.remainingAmount}
                      </p>
                      <p>
                        <span className="font-medium">Amount:</span>{" "}
                        {row.amount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="hidden sm:block">
              <Box
                sx={{
                  height: 320,
                  width: "100%",
                  background: "#29282b",
                  borderRadius: 2,
                  border: "1px solid #444",
                }}
              >
                <DataGrid
                  rows={dataGridRows}
                  columns={dataGridColumns}
                  getRowId={(row) => row.id}
                  disableRowSelectionOnClick
                  pageSizeOptions={[5, 10, 20]}
                  selectionModel={selectedIds}
                  onRowSelectionModelChange={handleDataGridSelection}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: pageSize },
                    },
                  }}
                  rowHeight={41}
                  headerHeight={32}
                  sx={{
                    color: "#fff",
                    border: 0,
                    "& .MuiDataGrid-columnHeaders": { background: "#222" },
                    "& .MuiDataGrid-row": { background: "#29282b" },
                    "& .MuiCheckbox-root": { color: "#00dac6 !important" },
                    fontSize: "0.92rem",
                  }}
                />
              </Box>
            </div>
          </div>
        )}

        {budgetError && (
          <div className="text-red-500 text-sm mt-4">
            Error: {budgetError.message || "Failed to load budgets."}
          </div>
        )}

        <div className="w-full flex justify-end mt-4 sm:mt-8">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#00DAC6] text-black font-semibold rounded hover:bg-[#00b8a0] w-full sm:w-[120px]"
          >
            Submit
          </button>
        </div>

        <style>
          {`
          input[type="date"]::-webkit-calendar-picker-indicator {
            background: url('https://cdn-icons-png.flaticon.com/128/8350/8350450.png') no-repeat;
            background-size: 18px;
            filter: invert(1) brightness(100) contrast(100);
          }
          input[type="date"], input[type="number"] {
            color: white;
          }
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
            appearance: none;
          }
          .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
          }
          .overflow-y-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
          .overflow-x-auto::-webkit-scrollbar {
            height: 8px;
          }
          .overflow-x-auto::-webkit-scrollbar-track {
            background: #1b1b1b;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb {
            background: #00dac6;
            border-radius: 4px;
          }
          .overflow-x-auto::-webkit-scrollbar-thumb:hover {
            background: #00b8a0;
          }
            @media (max-width: 640px) {
      .new-expense-container {
        width: 100vw !important;
        height: auto !important;
        padding: 16px;
      }
      .form-row {
        flex-direction: column !important;
        gap: 12px;
      }
      .field-styles {
        max-width: 100% !important;
        width: 100% !important;
        padding: 8px;
        font-size: 0.875rem;
      }
      .label-style {
        width: 100% !important;
        font-size: 0.875rem;
      }
      .input-wrapper {
        width: 100% !important;
      }
      .error-message {
        margin-left: 0 !important;
        text-align: left;
      }
      .budget-card {
        padding: 12px;
        font-size: 0.875rem;
      }
      .table-container {
        display: none !important;
      }
      .mobile-card-container {
        display: block !important;
      }
      .submit-button {
        bottom: 16px !important;
        right: 16px !important;
        width: 100% !important;
        max-width: 120px;
      }
      .link-budget-button,
      .close-table-button {
        width: 100% !important;
        padding: 8px 16px;
        font-size: 0.875rem;
      }
      .autocomplete-container {
        max-width: 100% !important;
      }
      .textarea-field {
        rows: 2 !important;
        font-size: 0.875rem;
      }
      .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
      }
      .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
      }
    }
        `}
        </style>
        <Snackbar
          open={openToast}
          autoHideDuration={3000}
          onClose={() => setOpenToast(false)}
        >
          <MuiAlert
            onClose={() => setOpenToast(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {toastMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    </>
  );
};

export default EditExpense;
