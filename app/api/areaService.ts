import {
  Area,
  createArea as CreateArea,
  updateArea,
} from "../interfaces/Areas.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/areas/", {
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

const create = async (area: CreateArea) => {
  return await fetchWrapper
    .post("/areas/", {
      data: area,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const update = async (id: number, area: updateArea) => {
  return fetchWrapper
    .put(`/areas/${id}`, {
      data: area,
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
    .delete(`/areas/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const getById = async (id: string) => {
  return fetchWrapper
    .get(`/areas/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const getByDepartment = async (token: string, department_id: number) => {
  return fetchWrapper
    .get(`/areas/by/${department_id}`, {
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

export const areaService = {
  getAll,
  getById,
  getByDepartment,
  create,
  update,
  remove,
};
