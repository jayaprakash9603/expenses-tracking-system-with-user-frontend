import React from "react";

const SummaryView = () => {
  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        backgroundColor: "rgb(11, 11, 11)",
        borderRadius: "8px",
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
        border: "1px solid rgb(0, 0, 0)",
        opacity: 1,
      }}
    >
      <div className="w-full flex justify-between items-center">
        <p className="text-white font-bold text-2xl">Expenses</p>
      </div>

      <hr className="border-t border-gray-600 w-full mt-2 mb-4" />
    </div>
  );
};

export default SummaryView;
