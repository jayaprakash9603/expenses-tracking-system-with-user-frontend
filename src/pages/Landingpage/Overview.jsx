import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getExpensesSummaryAction } from "../../Redux/Expenses/expense.action";
import { Skeleton } from "@mui/material"; // ✅ Import Skeleton

const Overview = () => {
  const dispatch = useDispatch();
  const { summary, loading } = useSelector((state) => state.expenses || {});

  const totalExpenses = summary?.totalLosses || 0;
  const todayExpenses = summary?.todayExpenses || 0;
  const creditDue = -summary?.totalCreditDue || 0;
  const remainingBudget = summary?.totalGains || 0;

  useEffect(() => {
    dispatch(getExpensesSummaryAction());
  }, [dispatch]);

  const shimmerKeyframes = {
    "@keyframes shimmer": {
      "0%": { backgroundPosition: "-1000px 0" },
      "100%": { backgroundPosition: "1000px 0" },
    },
  };

  const skeletonStyle = {
    ...shimmerKeyframes,
    bgcolor: "#2c2c2c",
    backgroundImage:
      "linear-gradient(90deg, #2c2c2c 0%, #3a3a3a 50%, #2c2c2c 100%)",
    backgroundSize: "1000px 100%",
    animation: "shimmer 2s infinite linear",
    borderRadius: "8px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "640px",
        backgroundColor: "#1b1b1b",
        borderRadius: "8px",
        boxShadow: "0 0 8px rgba(0,0,0,0.2)",
        border: "1px solid #383838",
        padding: "20px",
        color: "white",
        height: "300px",
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", marginBottom: "16px" }}>
        <p
          style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "4px" }}
        >
          Financial Overview
        </p>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #505050",
            width: "100%",
          }}
        />
      </div>

      {/* Skeleton or Data */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            width: "100%",
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="100%"
              height={85}
              sx={skeletonStyle}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px",
            width: "100%",
            height: "auto",
          }}
        >
          <OverviewCard label="Total Expenses" value={`${totalExpenses}`} />
          <OverviewCard label="Remaining" value={`${remainingBudget}`} />
          <OverviewCard label="Today's Expenses" value={`${todayExpenses}`} />
          <OverviewCard label="Credit Due" value={`${creditDue}`} />
        </div>
      )}
    </div>
  );
};

const OverviewCard = ({ label, value }) => (
  <div
    style={{
      backgroundColor: "#2a2a2a",
      padding: "10px",
      borderRadius: "8px",
      textAlign: "center",
      height: "85px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    }}
  >
    <p style={{ fontSize: "12px", marginBottom: "4px" }}>{label}</p>
    <p style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>{value}</p>
  </div>
);

export default Overview;
