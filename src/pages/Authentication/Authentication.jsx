import React from "react";
import { Card, Grid } from "@mui/material";
import Login from "./Login";
import Register from "./Register";
import { Route, Routes } from "react-router-dom";

const Authentication = () => {
  return (
    <div>
      <Grid container>
        <Grid className="h-screen overflow-hidden" item xs={7}>
          <img
            className="h-full w-full"
            src="https://media.istockphoto.com/id/1342229007/photo/unrecognizable-woman-with-pad-calculating-her-monthly-spendings.jpg?s=612x612&w=0&k=20&c=-Aq893kOqW9qTLTVI7RGXStnuDOwALiYG1_We5hPneg="
            alt="alternative"
          />
        </Grid>

        <Grid item xs={5}>
          <div className="px-20 flex flex-col justify-center h-full">
            <Card className="card p-8">
              <div className="flex flex-col items-center mb-5 space-y-1">
                <h1 className="logo text-center">Expense Tracking System</h1>
                <p className="text-center text-sm w-[70&]">
                  Track all your expenses in one place with simpler way
                </p>
              </div>

              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </Card>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default Authentication;
