import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MonthlyReport = () => {
  // Data for the last 3 months and top 3 categories
  const expenseData = [
    { date: "2025-04-01", food: 50, entertainment: 30, bills: 100 },
    { date: "2025-03-01", food: 40, entertainment: 40, bills: 90 },
    { date: "2025-02-01", food: 60, entertainment: 20, bills: 110 },
  ];

  // Top 3 categories (you can decide based on your data)
  const pieData = [
    { name: "Food", value: 150 },
    { name: "Entertainment", value: 90 },
    { name: "Bills", value: 300 },
  ];

  return (
    <div
      style={{
        marginTop: "20px",
        width: "1460px",
        height: "400px", // Adjusted height for more space
        borderRadius: "8px",
        border: "1px solid rgb(80, 80, 80)",
        backgroundColor: "rgb(27, 27, 27)",
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
        padding: "16px",
      }}
    >
      {/* Container for all charts */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "20px", // Adjusted margin-top for better positioning
          flexWrap: "wrap", // Allows wrapping on smaller screens
          height: "80%", // Full height of the container
        }}
      >
        {/* Line Chart - Trend over the last 3 months */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            marginRight: "20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p
            style={{
              color: "white",
              fontWeight: "bold",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Expense Trend
          </p>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="food" stroke="#8884d8" />
              <Line type="monotone" dataKey="entertainment" stroke="#82ca9d" />
              <Line type="monotone" dataKey="bills" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Breakdown for the last 3 months */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            marginRight: "20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p
            style={{
              color: "white",
              fontWeight: "bold",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Monthly Expense Breakdown
          </p>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="food" fill="#8884d8" />
              <Bar dataKey="entertainment" fill="#82ca9d" />
              <Bar dataKey="bills" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Expense Distribution for top 3 categories */}
        <div
          style={{
            flex: "1 1 30%",
            minWidth: "300px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <p
            style={{
              color: "white",
              fontWeight: "bold",
              marginBottom: "10px",
              textAlign: "center",
            }}
          >
            Expense Distribution
          </p>
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={60}
                label
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? "#8884d8"
                        : index === 1
                        ? "#82ca9d"
                        : "#ff7300"
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;
