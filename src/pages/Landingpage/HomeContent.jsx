import React from "react";
import { useNavigate } from "react-router";

const HomeContent = () => {
  const navigate = useNavigate();

  const handleClick = (route) => {
    navigate(route);
  };
  return (
    <div className="bg-[#1b1b1b]">
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>

      <div
        className="flex flex-col items-center"
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
        {/* Horizontal layout for both divs */}
        <div
          className="flex flex-row justify-center items-start gap-4"
          style={{ marginTop: "40px" }}
        >
          {/* First box - 600px */}
          <div
            data-quest-tour="aa8c19fbd-3a9b-414d-894f-ac9075c23f88"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              width: "600px",
              height: "300px",
              backgroundColor: "rgb(27, 27, 27)",
              borderRadius: "8px",
              boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
              border: "1px solid rgb(56, 56, 56)",
              opacity: 1,
              padding: "16px",
            }}
          >
            <div style={{ width: "100%" }}>
              <p
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "17px",
                  marginBottom: "2px",
                }}
              >
                Overview
              </p>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid rgb(80, 80, 80)",
                  width: "100%",
                }}
              />
            </div>
          </div>

          {/* Second box - 800px */}
          <div
            data-quest-tour="aa8c19fbd-3a9b-414d-894f-ac9075c23f88"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              width: "800px",
              height: "300px",
              backgroundColor: "rgb(27, 27, 27)",
              borderRadius: "8px",
              boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
              border: "1px solid rgb(56, 56, 56)",
              padding: "16px",
              opacity: 1,
            }}
          >
            <div style={{ width: "100%" }}>
              <p
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "18px",
                  marginBottom: "2px",
                }}
              >
                Recent Expenses
              </p>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid rgb(80, 80, 80)",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Third box - 1420px */}
        <div
          style={{
            marginTop: "30px",
            width: "1420px",
            height: "170px",
            borderRadius: "8px",
            border: "1px solid rgb(80, 80, 80)",
            backgroundColor: "rgb(27, 27, 27)",
            borderRadius: "8px",
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
            border: "1px solid rgb(56, 56, 56)",
            opacity: 1,
            padding: "16px",
          }}
        >
          <div style={{ width: "100%" }}>
            <p
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "2px",
              }}
            >
              Quick Access
            </p>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgb(80, 80, 80)",
                width: "100%",
              }}
            />
          </div>
          <div className="flex items-center justify-center space-x-32">
            <div
              className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
              style={{
                top: "447px",
                left: "393px",
              }}
              onClick={() => handleClick("/expenses")}
            >
              <div className="w-[48px] h-[48px] bg-[#f11f99] rounded-full flex items-center justify-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
                  alt="Expense Icon"
                  className="w-6 h-6"
                />
              </div>

              <div className="text-white font-bold">+ New Expense</div>
            </div>

            <div
              className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
              style={{
                top: "447px",
                left: "393px",
              }}
              onClick={() => handleClick("/create")}
            >
              <div className="w-[48px] h-[48px] bg-[#222255] rounded-full flex items-center justify-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
                  alt="Expense Icon"
                  className="w-6 h-6"
                />
              </div>

              <div className="text-white font-bold">+ New Expense</div>
            </div>
            <div
              className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
              style={{
                top: "447px",
                left: "393px",
              }}
              onClick={() => handleClick("/expenses")}
            >
              <div className="w-[48px] h-[48px] bg-[#124241] rounded-full flex items-center justify-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
                  alt="Expense Icon"
                  className="w-6 h-6"
                />
              </div>

              <div className="text-white font-bold">+ Upload File</div>
            </div>
            <div
              className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
              style={{
                top: "447px",
                left: "393px",
              }}
              onClick={() => handleClick("/budget")}
            >
              <div className="w-[48px] h-[48px] bg-[#682b3b] rounded-full flex items-center justify-center">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/2488/2488980.png"
                  alt="Expense Icon"
                  className="w-6 h-6"
                />
              </div>

              <div className="text-white font-bold">+ New Budget</div>
            </div>
          </div>
        </div>

        {/* Fourth box - same width as third (1420px) */}
        <div
          style={{
            marginTop: "20px",
            width: "1420px",
            height: "260px",
            borderRadius: "8px",
            border: "1px solid rgb(80, 80, 80)",
            backgroundColor: "rgb(27, 27, 27)",
            borderRadius: "8px",
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
            border: "1px solid rgb(56, 56, 56)",
            opacity: 1,
            padding: "16px",
          }}
        >
          <div style={{ width: "100%" }}>
            <p
              style={{
                color: "white",
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "2px",
              }}
            >
              Monthly Report
            </p>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid rgb(80, 80, 80)",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>

      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default HomeContent;
