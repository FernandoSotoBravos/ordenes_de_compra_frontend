import {
  Concept,
  updateConcept,
  createConcept,
} from "../interfaces/Concepts.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/concepts/", {
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

const create = async (concept: createConcept) => {
  return fetchWrapper
    .post("/concepts/", {
      data: concept,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const update = async (id: number, concept: updateConcept) => {
  return fetchWrapper
    .put(`/concepts/${id}`, {
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
    .delete(`/concepts/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const getById = async (id: string) => {
  return fetchWrapper
    .get(`/concepts/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const getByArea = async (token: string, area_id: number) => {
  return fetchWrapper
    .get(`/concepts/by/area/${area_id}`, {
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

export const conceptService = {
  getAll,
  getById,
  getByArea,
  create,
  update,
  remove,
};
