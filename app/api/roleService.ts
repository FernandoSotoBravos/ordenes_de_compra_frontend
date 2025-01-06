import {
  Role,
  RoleCreate,
  RoleUpdate,
} from "../interfaces/Roles.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/roles/", {
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

const create = async (concept: RoleCreate) => {
  return fetchWrapper
    .post("/roles/", {
      data: concept,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const update = async (id: number, concept: RoleUpdate) => {
  return fetchWrapper
    .put(`/roles/${id}`, {
      data: concept,
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
    .delete(`/roles/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const getById = async (id: string) => {
  return fetchWrapper
    .get(`/roles/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const getByArea = async (area_id: number) => {
  return fetchWrapper
    .get(`/roles/by/area/${area_id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const roleservice = {
  getAll,
  getById,
  getByArea,
  create,
  update,
  remove,
};
