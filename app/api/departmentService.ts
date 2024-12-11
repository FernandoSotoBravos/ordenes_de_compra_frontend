import { CreateDepto } from "../interfaces/Departments.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/departments", {
      params: {
        limit: limit,
        page: page,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const create = async (department: CreateDepto) => {
  return fetchWrapper
    .post("/departments", {
      data: department,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const getById = async (id: string) => {
  return fetchWrapper
    .get(`/departments/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const getByDepartment = async (department: string) => {
  return fetchWrapper
    .get(`/departments/${department}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const departmentService = {
  getAll,
  getById,
  getByDepartment,
  create
};
