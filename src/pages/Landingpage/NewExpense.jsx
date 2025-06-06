import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createExpenseAction,
  fetchPreviousExpenses,
  getExpensesSuggestions,
} from "../../Redux/Expenses/expense.action";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { getListOfBudgetsById } from "../../Redux/Budget/budget.action";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchCategories } from "../../Redux/Category/categoryActions";

const fieldStyles =
  "px-3 py-2 rounded bg-[#29282b] text-white border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00dac6] w-full text-base sm:max-w-[300px] max-w-[200px]";
const labelStyle = "text-white text-sm sm:text-base font-semibold mr-4";
const formRow = "mt-4 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
const firstFormRow =
  "mt-2 flex flex-col sm:flex-row sm:items-center gap-2 w-full";
const inputWrapper = { width: "150px" };

const NewExpense = ({ onClose, onSuccess }) => {
  const location = useLocation();
  // Get date from query param if present
  const searchParams = new URLSearchParams(location.search);
  const dateFromQuery = searchParams.get("date");

  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const { topExpenses, loading: loading } = useSelector(
    (state) => state.expenses || {}
  );
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
    date: dateFromQuery || today,
    creditDue: "",
  });
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [checkboxStates, setCheckboxStates] = useState([]);

  // Fetch budgets on component mount
  useEffect(() => {
    dispatch(getListOfBudgetsById(today));
  }, [dispatch, today]);

  // Update checkbox states when budgets change
  useEffect(() => {
    setCheckboxStates(budgets.map((budget) => budget.includeInBudget || false));
  }, [budgets]);

  // Fetch expenses suggestions
  useEffect(() => {
    dispatch(getExpensesSuggestions());
  }, [dispatch]);

  // Fetch categories on component mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Set initial type based on salary date logic if dateFromQuery is present
  React.useEffect(() => {
    if (dateFromQuery) {
      const newDate = new Date(dateFromQuery);
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
      if (isSalary) {
        setExpenseData((prev) => ({ ...prev, transactionType: "gain" }));
      } else {
        setExpenseData((prev) => ({ ...prev, transactionType: "loss" }));
      }
    }
  }, [dateFromQuery]);

  const fetchSuggestions = (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);

    const filtered = topExpenses.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(filtered);
    setLoadingSuggestions(false);
  };

  const highlightText = (text, inputValue) => {
    const regex = new RegExp(`(${inputValue})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === inputValue.toLowerCase() ? (
        <span key={index} style={{ fontWeight: 700, color: "#00b8a0" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData({ ...expenseData, [name]: value });

    // Clear the error for this field when the user updates it
    if (errors[name]) {
      setErrors({ ...errors, [name]: false });
    }
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

    // Clear the date error when the user updates it
    if (errors.date) {
      setErrors({ ...errors, date: false });
    }

    // Dispatch getListOfBudgetsById with the selected date
    dispatch(getListOfBudgetsById(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!expenseData.expenseName) newErrors.expenseName = true;
    if (!expenseData.amount) newErrors.amount = true;
    if (!expenseData.date) newErrors.date = true;
    if (!expenseData.transactionType) newErrors.transactionType = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const budgetIds = budgets
      .filter((budget, index) => checkboxStates[index])
      .map((budget) => budget.id);

    dispatch(
      createExpenseAction({
        date: expenseData.date,
        budgetIds: budgetIds,
        categoryId: expenseData.category,
        expense: {
          expenseName: expenseData.expenseName,
          amount: expenseData.amount,
          netAmount: expenseData.amount,
          paymentMethod: expenseData.paymentMethod,
          type: expenseData.transactionType.toLowerCase(),
          comments: expenseData.comments,
          creditDue: expenseData.creditDue || 0,
        },
      })
    );

    if (typeof onClose === "function") {
      onClose();
    } else {
      navigate(-1, {
        state: { toastMessage: "Expense created successfully!" },
      });
    }
    if (onSuccess) {
      onSuccess("Expense created successfully!");
    }
  };

  const handleLinkBudgets = () => {
    setShowTable(true);
  };

  const handleCloseTable = () => {
    setShowTable(false);
  };

  const handleCheckboxChange = (index) => {
    setCheckboxStates((prev) =>
      prev.map((state, i) => (i === index ? !state : state))
    );
  };
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

  const renderAmountInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="amount" className={labelStyle} style={inputWrapper}>
          Amount<span className="text-red-500"> *</span>
        </label>
        <TextField
          id="amount"
          name="amount"
          type="number"
          value={expenseData.amount || ""}
          onChange={(e) => {
            handleInputChange(e);

            // Clear the error when the user types
            if (errors.amount) {
              setErrors({ ...errors, amount: false });
            }
          }}
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
                borderColor: errors.amount ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: errors.amount ? "2px" : "1px",
                borderStyle: "solid",
              },
              "&:hover fieldset": {
                borderColor: errors.amount ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: errors.amount ? "2px" : "1px",
                borderStyle: "solid",
              },
              "&.Mui-focused fieldset": {
                borderColor: errors.amount ? "#ff4d4f" : "#00dac6",
                borderWidth: errors.amount ? "2px" : "2px",
                borderStyle: "solid",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: errors.amount ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: errors.amount ? "2px" : "1px",
                borderStyle: "solid",
              },
            },
          }}
        />
      </div>
    </div>
  );

  const renderDateInput = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center">
        <label htmlFor="date" className={labelStyle} style={inputWrapper}>
          Date<span className="text-red-500"> *</span>
        </label>
        <TextField
          id="date"
          name="date"
          type="date"
          value={expenseData.date || ""}
          onChange={(e) => handleDateChange(e)}
          variant="outlined"
          error={errors.date}
          InputProps={{
            className: fieldStyles,
            style: { height: "52px" },
          }}
          sx={{
            width: "100%",
            maxWidth: "300px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: errors.date ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: errors.date ? "2px" : "1px",
                borderStyle: "solid",
              },
              "&:hover fieldset": {
                borderColor: errors.date ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: errors.date ? "2px" : "1px",
                borderStyle: "solid",
              },
              "&.Mui-focused fieldset": {
                borderColor: errors.date ? "#ff4d4f" : "#00dac6",
                borderWidth: errors.date ? "2px" : "2px",
                borderStyle: "solid",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: errors.date ? "#ff4d4f" : "rgb(75, 85, 99)",
                borderWidth: errors.date ? "2px" : "1px",
                borderStyle: "solid",
              },
            },
          }}
        />
      </div>
    </div>
  );

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
          loading={loading}
          loadingText="Loading"
          noOptionsText={expenseData?.expenseName ? "No Data Found" : ""}
          value={expenseData?.expenseName || ""}
          onInputChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, expenseName: newValue }));
            fetchSuggestions(newValue);

            // Clear the error when the user types
            if (errors.expenseName) {
              setErrors({ ...errors, expenseName: false });
            }
          }}
          onChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, expenseName: newValue }));
          }}
          openOnFocus
          sx={{
            width: "100%",
            maxWidth: "300px",
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
                    {loadingSuggestions ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          renderOption={(props, option, { inputValue }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps} className="mb-2 ml-3">
                <div>{highlightText(option, inputValue)}</div>
              </li>
            );
          }}
        />
      </div>
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
          renderOption={(props, option, { inputValue }) => {
            const { key, ...optionProps } = props;
            return (
              <li
                key={key}
                {...optionProps}
                className="flex items-center mb-2 ml-3"
              >
                <img
                  src={require("../../assests/save-money.png")}
                  alt="category-icon"
                  className="w-5 h-5 mr-2"
                  style={{
                    filter:
                      "invert(50%) sepia(100%) saturate(500%) hue-rotate(150deg) brightness(1) contrast(1)",
                  }}
                />
                <div>{highlightText(option.name, inputValue)}</div>
              </li>
            );
          }}
          sx={{
            width: "100%",
            maxWidth: "300px",
          }}
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
          renderOption={(props, option, { inputValue }) => {
            const { key, ...optionProps } = props;
            return (
              <li
                key={key}
                {...optionProps}
                className="flex items-center mb-2 ml-3"
              >
                <div>{highlightText(option, inputValue)}</div>
              </li>
            );
          }}
          sx={{
            width: "100%",
            maxWidth: "300px",
          }}
        />
      </div>
      {errors.paymentMethod && (
        <span className="text-red-500 text-sm ml-[150px] sm:ml-[170px]">
          {errors.paymentMethod}
        </span>
      )}
    </div>
  );
  const renderTransactionTypeAutocomplete = () => (
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
            setExpenseData((prev) => ({ ...prev, transactionType: newValue }));

            // Clear the error when the user types
            if (errors.transactionType) {
              setErrors({ ...errors, transactionType: false });
            }
          }}
          onChange={(event, newValue) => {
            setExpenseData((prev) => ({ ...prev, transactionType: newValue }));

            // Clear the error when the user selects a value
            if (errors.transactionType) {
              setErrors({ ...errors, transactionType: false });
            }
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
                borderColor: errors.transactionType ? "#ff4d4f" : "#00dac6",
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
          renderOption={(props, option, { inputValue }) => {
            const { key, ...optionProps } = props;
            return (
              <li
                key={key}
                {...optionProps}
                className="flex items-center mb-2 ml-3"
              >
                <div>{highlightText(option, inputValue)}</div>
              </li>
            );
          }}
        />
      </div>
    </div>
  );

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
            checked={checkboxStates[row.index]}
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

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPageIndex(0);
  };

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
          <p className="text-white font-extrabold text-4xl">New Expense</p>
          <button
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center justify-center w-12 h-12 text-[32px] font-bold bg-[#29282b] rounded mt-[-10px]"
            style={{ color: "#00dac6" }}
          >
            ×
          </button>
        </div>
        <hr className="border-t border-gray-600 w-full mt-[-4px]" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-1 gap-4 items-center">
            {renderExpenseNameWithSuggestions()}
            {renderAmountInput()}
            {renderDateInput()}
          </div>
          <div className="flex flex-1 gap-4 items-center">
            {renderTransactionTypeAutocomplete()}
            {renderCategoryAutocomplete()}
            {renderPaymentMethodAutocomplete()}
          </div>
          <div className="flex flex-1 items-center">
            {renderInput("comments", "text", true)}
          </div>
        </div>

        <div className="mt-4 sm:mt-[50px] w-full flex flex-col sm:flex-row items-center justify-between gap-2">
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
                table.getRowModel().rows.map((row) => (
                  <div
                    key={row.id}
                    className="bg-[#29282b] border border-gray-600 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">
                        {row.original.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300 text-sm">In Budget</span>
                        <input
                          type="checkbox"
                          checked={checkboxStates[row.index]}
                          onChange={() => handleCheckboxChange(row.index)}
                          className="h-5 w-5 text-[#00dac6] border-gray-700 rounded focus:ring-[#00dac6]"
                        />
                      </div>
                    </div>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>
                        <span className="font-medium">Description:</span>{" "}
                        {row.original.description}
                      </p>
                      <p>
                        <span className="font-medium">Start Date:</span>{" "}
                        {row.original.startDate}
                      </p>
                      <p>
                        <span className="font-medium">End Date:</span>{" "}
                        {row.original.endDate}
                      </p>
                      <p>
                        <span className="font-medium">Remaining Amount:</span>{" "}
                        {row.original.remainingAmount}
                      </p>
                      <p>
                        <span className="font-medium">Amount:</span>{" "}
                        {row.original.amount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div
              className="hidden sm:block overflow-x-auto overflow-y-auto border border-gray-600 rounded"
              style={{ height: "260px" }}
            >
              <table className="w-full text-white border-collapse">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-2 sm:px-4 py-2 text-left bg-[#29282b] border-b border-gray-600 sticky top-0 z-10"
                          style={{
                            width: header.column.columnDef.size,
                            minWidth: header.column.columnDef.size,
                            maxWidth: header.column.columnDef.size,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : header.column.columnDef.header}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {budgets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="px-2 sm:px-4 py-2 text-center text-gray-400 border-b border-gray-600"
                        style={{ height: "200px" }}
                      >
                        No rows found
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="border-b border-gray-600">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-2 sm:px-4 py-2"
                            style={{
                              width: cell.column.columnDef.size,
                              minWidth: cell.column.columnDef.size,
                              maxWidth: cell.column.columnDef.size,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {cell.column.columnDef.cell
                              ? cell.column.columnDef.cell(cell)
                              : cell.getValue()}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex flex-row justify-between items-center bg-[#0b0b0b] py-2 z-20 relative gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={!table.getCanPreviousPage()}
                  className={`px-3 py-1 rounded text-sm ${
                    table.getCanPreviousPage()
                      ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Previous
                </button>
                <span className="text-white text-sm">
                  Page{" "}
                  <strong>
                    {pageIndex + 1} of {table.getPageCount()}
                  </strong>
                </span>
                <button
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={!table.getCanNextPage()}
                  className={`px-3 py-1 rounded text-sm ${
                    table.getCanNextPage()
                      ? "bg-[#00DAC6] text-black hover:bg-[#00b8a0]"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
              <div>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="px-3 py-1 bg-[#29282b] text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-[#00dac6] text-sm"
                >
                  {[5, 10, 20].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </select>
              </div>
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
      }      .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
      }
    }
    /* Existing scrollbar styles */
    .overflow-y-auto::-webkit-scrollbar {
      width: 8px;
    }
        `}
        </style>
      </div>
    </>
  );
};

export default NewExpense;
