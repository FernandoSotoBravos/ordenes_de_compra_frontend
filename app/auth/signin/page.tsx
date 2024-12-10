"use client";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { SignInPage } from "@toolpad/core/SignInPage";
import { providerMap } from "../../../auth";
import signIn from "./actions";

function Logo() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
      <img
        src="https://seeklogo.com/images/B/bravos-de-juarez-logo-87DD22C999-seeklogo.com.png"
        width="120"
        height="120"
        alt="logo_business"
      />
    </Box>
  );
}

function Subtitle() {
  return (
    <Typography variant="body2" color="textSecondary">
      FC Bravos de Juárez
    </Typography>
  );
}

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
      slots={{
        subtitle: Subtitle,
        title: Logo,
      }}
    />
  );
}
