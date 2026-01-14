import axios from "axios";
import { signOut } from "next-auth/react";

// Base URL de la API
const baseUrl = "https://dev-bend.fcbravos.com/api/v1";

// Cliente Axios
const client = axios.create({
  baseURL: baseUrl,
});

/**
 * 🔒 Interceptor de REQUEST
 * Normaliza las URLs para evitar redirects:
 * - Elimina slash final del path
 * - Conserva query params
 */
client.interceptors.request.use((config) => {
  if (config.url) {
    // Si por error llega una URL absoluta, no la tocamos
    if (config.url.startsWith("http")) {
      return config;
    }

    const [path, query] = config.url.split("?");

    const normalizedPath =
      path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

    config.url = query
      ? `${normalizedPath}?${query}`
      : normalizedPath;
  }

  return config;
});

/**
 * 🔐 Interceptor de RESPONSE
 * Maneja expiración de sesión / permisos
 */
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    if (
      error.response.status === 401 ||
      error.response.status === 403
    ) {
      signOut({ callbackUrl: "/auth/signin" });
    }

    return Promise.reject(error);
  }
);

/**
 * Wrapper genérico de requests
 */
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

// API pública del wrapper
export const fetchWrapper = {
  get: request("GET"),
  post: request("POST"),
  put: request("PUT"),
  delete: request("DELETE"),
  patch: request("PATCH"),
};
