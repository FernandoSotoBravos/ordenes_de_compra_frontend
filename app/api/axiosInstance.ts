import axios from "axios";
const baseUrl = "http://localhost:8000/api/v1";

const client = axios.create({ baseURL: baseUrl });

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      (error.response && error.response.status === 403) ||
      error.response.status === 401
    ) {
      window.location.href = "/login";
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
