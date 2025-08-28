"use client";

import React from "react";
import Box from "@mui/material/Box";
import { keyframes } from "@mui/system";

// Keyframes that cycle the box-shadow color between green, red, white and blue
const colorCycle = keyframes`
  0%   { box-shadow: 0 20px 40px -10px rgba(0,200,0,0.95); }
  25%  { box-shadow: 0 20px 40px -10px rgba(255,0,0,0.95); }
  50%  { box-shadow: 0 20px 40px -10px rgba(255,255,255,0.95); }
  75%  { box-shadow: 0 20px 40px -10px rgba(0,0,255,0.95); }
  100% { box-shadow: 0 20px 40px -10px rgba(0,200,0,0.95); }
`;

export default function Home() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
    </Box>
  );
}
