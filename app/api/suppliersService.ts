import {
  Supplier,
  createSupplier,
  updateSupplier,
} from "../interfaces/Suppliers.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/suppliers/", {
      params: {
        limit: limit,
        page: page,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const create = async (supplier: createSupplier) => {
  return fetchWrapper
    .post("/suppliers/", {
      data: supplier,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const update = async (id: number, supplier: updateSupplier) => {
  return fetchWrapper
    .put(`/suppliers/${id}`, {
      data: supplier,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const remove = async (id: number) => {
  return fetchWrapper
    .delete(`/suppliers/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const getById = async (id: string) => {
  return fetchWrapper
    .get(`/suppliers/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const suppliersService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
