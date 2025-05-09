import { fetchWrapper } from "./axiosInstance";

const getAll = async (token: string) => {
  return await fetchWrapper
    .get("/currency/", {
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

export const currencyService = {
  getAll,
};
