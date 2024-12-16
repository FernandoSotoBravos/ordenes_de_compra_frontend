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

const getByDepartment = async (department_id: number) => {
  return fetchWrapper
    .get(`/areas/by/${department_id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

export const areaService = {
  getAll,
  getById,
  getByDepartment,
};
