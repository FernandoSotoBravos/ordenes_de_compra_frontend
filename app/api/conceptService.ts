import {
  Concept,
  updateConcept,
  createConcept,
} from "../interfaces/Concepts.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (token: string, limit: number = 10, page: number = 1) => {
  return fetchWrapper
    .get("/concepts/", {
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
      return error;
    });
};

const create = async (token: string, concept: createConcept) => {
  return fetchWrapper
    .post("/concepts/", {
      data: concept,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const update = async (token: string, id: number, concept: updateConcept) => {
  return fetchWrapper
    .put(`/concepts/${id}`, {
      data: concept,
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const remove = async (token: string, id: number) => {
  return fetchWrapper
    .delete(`/concepts/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const getById = async (token: string, id: string) => {
  return fetchWrapper
    .get(`/concepts/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
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
