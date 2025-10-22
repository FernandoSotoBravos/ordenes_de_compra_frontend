import axios from "axios";
// const baseUrl = process.env.REACT_APP_API_URL;
const baseUrl = "https://bend.fcbravos.com/api/v1";
// const baseUrl = "http://localhost:8013/api/v1";

import { signOut } from "next-auth/react";
const client = axios.create({ baseURL: baseUrl });

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response === undefined) {
      return Promise.reject(error);
    }

    if (
      (error.response && error.response.status === 403) ||
      error.response.status === 401
    ) {
      signOut({ callbackUrl: "/auth/signin" });
    }
    return Promise.reject(error);
  }
);

const request = (method: string) => async (url: string, options: any) => {
  try {
    const response = await client({
      method,
      url,
      ...options,
    });
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const fetchWrapper = {
  get: request("GET"),
  post: request("POST"),
  put: request("PUT"),
  delete: request("DELETE"),
  patch: request("PATCH"),
};
