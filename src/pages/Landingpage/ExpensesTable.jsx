import React, { useEffect, useState } from "react";
import { Box, Menu, MenuItem, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteExpenseAction,
  getExpensesAction,
} from "../../Redux/Expenses/expense.action";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ExpensesTable = () => {
  const dispatch = useDispatch();
  const { expenses } = useSelector((state) => state.expenses || {});
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    dispatch(getExpensesAction());
  }, [dispatch]);

  const rows = Array.isArray(expenses)
    ? expenses.map((item) => ({
        id: item.id,
        date: item.date,
        ...item.expense,
      }))
    : [];

  // 🔧 Local action menu for each row
  const ActionMenu = ({ rowId }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      event.stopPropagation(); // prevents row click selection
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleEdit = () => {
      alert(`Edit row ${rowId}`);
      handleClose();
    };

    const handleDelete = () => {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete this expense?`
      );
      if (confirmDelete) {
        dispatch(deleteExpenseAction(rowId))
          .then(() => {
            dispatch(getExpensesAction());
          })
          .catch((error) => {
            console.error("Error deleting expense:", error);
            alert("Error deleting expense. Please try again.");
          })
          .finally(() => {
            handleClose();
          });
      } else {
        handleClose();
      }
    };

    return (
      <>
        <IconButton onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              bgcolor: "#1b1b1b", // Set the background of the popup
            },
          }}
        >
          <MenuItem
            onClick={handleEdit}
            sx={{
              color: "green", // Text color
              "&:hover": {
                backgroundColor: "#2a2a2a",
              },
            }}
          >
            <EditIcon sx={{ color: "green", marginRight: 1 }} />
            Edit
          </MenuItem>
          <MenuItem
            onClick={handleDelete}
            sx={{
              color: "red",
              "&:hover": {
                backgroundColor: "#2a2a2a",
              },
            }}
          >
            <DeleteIcon sx={{ color: "red", marginRight: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </>
    );
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
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
      renderCell: (params) => <ActionMenu rowId={params.row.id} />,
    },
  ];

  return (
    <Box sx={{ height: 700, width: "100%", bgcolor: "#121212" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => setPageSize(newSize)}
        rowsPerPageOptions={[10, 20, 50, 100]}
        checkboxSelection
        disableSelectionOnClick
        onSelectionModelChange={(newSelection) => {
          setSelectedIds(newSelection); // This will be an array of selected IDs
        }}
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
          "& .MuiDataGrid-sortIcon": {
            color: "#00dac6",
          },
          "& .MuiPaginationItem-root:hover, .MuiIconButton-root:hover": {
            backgroundColor: "rgba(0, 218, 198, 0.1)",
          },
        }}
      />
    </Box>
  );
};

export default ExpensesTable;
