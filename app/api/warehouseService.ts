import { Role, RoleCreate, RoleUpdate } from "../interfaces/Roles.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (token: string, limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/warehouses/", {
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

const create = async (concept: RoleCreate) => {
  return fetchWrapper
    .post("/warehouses/", {
      data: concept,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const update = async (id: number, concept: RoleUpdate) => {
  return fetchWrapper
    .put(`/warehouses/${id}`, {
      data: concept,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const remove = async (id: number) => {
  return fetchWrapper
    .delete(`/warehouses/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const getById = async (id: string) => {
  return fetchWrapper
    .get(`/warehouses/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

export const warehouseService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
