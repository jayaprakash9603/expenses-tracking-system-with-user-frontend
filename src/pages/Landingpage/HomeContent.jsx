import React from "react";

const HomeContent = () => {
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
              height: "250px",
              backgroundColor: "rgb(27, 27, 27)",
              borderRadius: "8px",
              boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
              border: "1px solid rgb(56, 56, 56)",
              opacity: 1,
            }}
          ></div>

          {/* Second box - 800px */}
          <div
            data-quest-tour="aa8c19fbd-3a9b-414d-894f-ac9075c23f88"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              width: "800px",
              height: "250px",
              backgroundColor: "rgb(27, 27, 27)",
              borderRadius: "8px",
              boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
              border: "1px solid rgb(56, 56, 56)",
              opacity: 1,
            }}
          ></div>
        </div>

        {/* Third box - 1420px */}
        <div
          style={{
            marginTop: "30px",
            width: "1420px",
            height: "200px",
            backgroundColor: "rgb(35, 35, 35)",
            borderRadius: "8px",
            border: "1px solid rgb(70, 70, 70)",
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
            opacity: 1,
          }}
        ></div>

        {/* Fourth box - same width as third (1420px) */}
        <div
          style={{
            marginTop: "20px",
            width: "1420px",
            height: "270px",
            backgroundColor: "rgb(45, 45, 45)",
            borderRadius: "8px",
            border: "1px solid rgb(80, 80, 80)",
            boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
            opacity: 1,
          }}
        ></div>
      </div>

      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default HomeContent;
