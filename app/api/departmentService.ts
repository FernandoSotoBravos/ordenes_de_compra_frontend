import { fetchWrapper } from "./axiosInstance";

const getAll = async () => {
  return fetchWrapper
    .get("/departments", {
      params: {
        limit: 10,
        page: 1,
      },
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
};
