import React, { useEffect, useState } from "react";
import { Box, Menu, MenuItem, IconButton, Skeleton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteExpenseAction,
  getExpenseAction,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ToastNotification from "./ToastNotification";
import Modal from "./Modal";

const ExpensesTable = ({ expenses: propExpenses }) => {
  const dispatch = useDispatch();
  const { expenses: reduxExpenses, loading } = useSelector(
    (state) => state.expenses || {}
  );
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const navigate = useNavigate();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [expenseData, setExpenseData] = useState({});

  // Use propExpenses if provided, otherwise fall back to reduxExpenses
  const expenses = propExpenses || reduxExpenses;

  useEffect(() => {
    if (!propExpenses) {
      dispatch(getExpensesAction());
    }
  }, [dispatch, propExpenses]);

  const handleToastClose = () => {
    setToastOpen(false);
    setToastMessage("");
  };

  // Map expenses to rows, ensuring unique IDs
  const rows = Array.isArray(expenses)
    ? expenses
        .filter((item) => {
          const isValid = item && typeof item === "object" && item.id != null;
          if (!isValid) {
            console.warn("Invalid expense item:", item);
          }
          return isValid;
        })
        .map((item, index) => {
          const row = {
            id: item.id ?? `temp-${index}-${Date.now()}`,
            date: item.date || "",
            ...item.expense,
            expenseId: item.id ?? `temp-${index}-${Date.now()}`,
          };
          return row;
        })
    : [];

  // Action menu for each row (Edit and Delete buttons)
  const ActionMenu = ({ rowId, expenseId }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleEdit = () => {
      navigate(`/expenses/edit/${expenseId}`);
      dispatch(getExpenseAction(expenseId));
      handleClose();
    };

    const handleDelete = () => {
      const expense = rows.find((row) => row.expenseId === expenseId);
      if (expense) {
        setExpenseData({
          expenseName: expense.expenseName || "",
          amount: expense.amount || "",
          type: expense.type || "",
          paymentMethod: expense.paymentMethod || "",
          netAmount: expense.netAmount || "",
          comments: expense.comments || "",
          creditDue: expense.creditDue || "",
          date: expense.date || "",
        });
        setExpenseToDelete(expenseId);
        setIsDeleteModalOpen(true);
      }
      handleClose();
    };

    return (
      <>
        <IconButton onClick={handleClick}>
          <MoreVertIcon sx={{ color: "#fff" }} />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: { bgcolor: "#1b1b1b" },
          }}
        >
          <MenuItem
            onClick={handleEdit}
            sx={{
              color: "green",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            <EditIcon sx={{ color: "green", marginRight: 1 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{
              color: "red",
              "&:hover": { backgroundColor: "#2a2a2a" },
            }}
          >
            <DeleteIcon sx={{ color: "red", marginRight: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </>
    );
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      dispatch(deleteExpenseAction(expenseToDelete))
        .then(() => {
          dispatch(getExpensesAction());
          setToastMessage("Expense deleted successfully.");
          setToastOpen(true);
        })
        .catch((error) => {
          console.error("Error deleting expense:", error);
          setToastMessage("Error deleting expense. Please try again.");
          setToastOpen(true);
        })
        .finally(() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
          setExpenseData({});
        });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
    setExpenseData({});
  };

  // Define header names for the modal
  const headerNames = {
    expenseName: "Expense Name",
    amount: "Amount",
    type: "Type",
    paymentMethod: "Payment Method",
    netAmount: "Net Amount",
    comments: "Comments",
    creditDue: "Credit Due",
    date: "Date",
  };

  // Columns definition for DataGrid
  const columns = [
    { field: "id", headerName: "Index", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "expenseName", headerName: "Name", flex: 1 },
    { field: "amount", headerName: "Amount", type: "number", flex: 1 },
    { field: "type", headerName: "Type", flex: 1 },
    { field: "paymentMethod", headerName: "Payment", flex: 1 },
    { field: "netAmount", headerName: "Net Amount", type: "number", flex: 1 },
    { field: "comments", headerName: "Comments", flex: 1 },
    { field: "creditDue", headerName: "Credit Due", type: "number", flex: 1 },
    {
      field: "actions",
      headerName: "",
      width: 50,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <ActionMenu rowId={params.row.id} expenseId={params.row.expenseId} />
      ),
    },
  ];

  return (
    <>
      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />

      <Box
        sx={{ height: 700, width: "100%", bgcolor: "#121212", padding: "10px" }}
      >
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Skeleton
              variant="rectangular"
              height={40}
              sx={{ bgcolor: "#2c2c2c", borderRadius: 1 }}
            />
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={45}
                sx={{ bgcolor: "#1f1f1f", borderRadius: 1 }}
              />
            ))}
          </Box>
        ) : (
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(row) => row.id}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => setPageSize(newSize)}
            rowsPerPageOptions={[10, 20, 50, 100]}
            checkboxSelection
            disableSelectionOnClick
            onSelectionModelChange={(newSelection) =>
              setSelectedIds(newSelection)
            }
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#0b0b0b",
                color: "#00dac6",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-cell": {
                backgroundColor: "#1b1b1b",
                color: "#fff",
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor: "#28282a",
              },
              "& .MuiCheckbox-root svg": {
                fill: "#666666",
              },
              "& .Mui-checked .MuiSvgIcon-root": {
                color: "#00dac6",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor: "#1b1b1b",
                color: "#00dac6",
              },
              "& .MuiDataGrid-footerContainer .MuiTypography-root": {
                color: "#00dac6",
              },
              "& .MuiDataGrid-footerContainer .MuiPaginationItem-root": {
                color: "#00dac6",
              },
              "& .MuiPaginationItem-root, .MuiDataGrid-sortIcon, .MuiIconButton-root":
                {
                  color: "#00dac6",
                },
              "& .MuiPaginationItem-root:hover, .MuiIconButton-root:hover": {
                backgroundColor: "rgba(0, 218, 198, 0.1)",
              },
            }}
          />
        )}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          title="Deletion Confimation"
          data={expenseData}
          headerNames={headerNames}
          onApprove={handleConfirmDelete}
          onDecline={handleCancelDelete}
          approveText="Yes, Delete"
          declineText="No, Cancel"
        />
      </Box>
    </>
  );
};

export default ExpensesTable;
