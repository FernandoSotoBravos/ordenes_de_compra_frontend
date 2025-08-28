"use client";
import * as React from "react";
import { Box, Typography } from "@mui/material";
import { SignInPage } from "@toolpad/core/SignInPage";
import { providerMap } from "../../../auth";
import signIn from "./actions";

function Subtitle() {
  return (
    <Typography variant="body2" color="textSecondary">
      FC Bravos de Juárez
    </Typography>
  );
}

function Title() {
  return (
    <Typography variant="h2"></Typography>
  )
}

export default function SignIn() {
  return (
    <SignInPage
      providers={providerMap}
      signIn={signIn}
      slots={{
        subtitle: Subtitle,
        title: Title
      }}
      sx={{
        '.mui-1og1qar img ': {
          width: 100,
          height: 100
        }
      }}
    />
  );
}
