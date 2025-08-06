import { fetchWrapper } from "./axiosInstance";

const getAll = async (
  token: string,
  limit: number = 10,
  page: number = 1,
  extra: number = 0
) => {
  return fetchWrapper
    .get("/taxes/", {
      params: {
        limit: limit,
        page: page,
        extra: extra,
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

export const taxService = {
  getAll,
};
