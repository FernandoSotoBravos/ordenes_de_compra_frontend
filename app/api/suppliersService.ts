import {
  Supplier,
  createSupplier,
  updateSupplier,
} from "../interfaces/Suppliers.interface";
import { fetchWrapper } from "./axiosInstance";

const exportExcel = async (token: string) => {
  return fetchWrapper
    .get("/suppliers/export", {
      headers: {
        Authorization: "Bearer " + token,
      },
      responseType: "blob",
    })
    .then((response) => {
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "catalogo_proveedores.xlsx";
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error al generar el Excel:", error);
      throw error;
    });
};

const getAll = async (token: string, limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/suppliers/", {
      params: {
        limit: limit,
        page: page,
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const getAllSmall = async (token: string, limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/suppliers/small", {
      params: {
        limit: limit,
        page: page,
      },
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const create = async (token: string, supplier: createSupplier) => {
  return fetchWrapper
    .post("/suppliers/", {
      data: supplier,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const update = async (token: string, id: number, supplier: updateSupplier) => {
  return fetchWrapper
    .put(`/suppliers/${id}`, {
      data: supplier,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const remove = async (token: string, id: number) => {
  return fetchWrapper
    .delete(`/suppliers/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const getById = async (token: string, id: string) => {
  return fetchWrapper
    .get(`/suppliers/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

export const suppliersService = {
  getAll,
  getAllSmall,
  getById,
  create,
  update,
  remove,
  exportExcel
};
