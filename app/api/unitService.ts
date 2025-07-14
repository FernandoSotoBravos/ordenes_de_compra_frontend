import { Unit } from "../interfaces/Unit.interface";
import { fetchWrapper } from "./axiosInstance";

const getAll = async (
  token: string,
  limit: number = 10,
  page: number = 1,
) => {
  return fetchWrapper
    .get("/units/", {
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

export const unitService = {
  getAll,
};
