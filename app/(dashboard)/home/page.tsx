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

export default function Home({
  src = "/placeholder.png",
  alt = "Imagen",
  size = 320,
}: {
  src?: string;
  alt?: string;
  size?: number;
}) {
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
      {/* <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          width: size,
          height: "auto",
          borderRadius: 2,
          animation: `${colorCycle} 6s linear infinite`,
          // make the shadow smoother and add a subtle transform animation
          transition: "transform 300ms ease",
          "&:hover": { transform: "translateY(-6px)" },
          // ensure the image sits on top of the animated shadow
          position: "relative",
          zIndex: 1,
        }}
      /> */}
    </Box>
  );
}
