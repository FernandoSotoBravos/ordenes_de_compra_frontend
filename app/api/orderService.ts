import { OrderCreateProps } from "../interfaces/OrderCreate.interface";
import { fetchWrapper } from "./axiosInstance";

const create = async (order: OrderCreateProps) => {
  return fetchWrapper
    .post("/orders", {
        data: order,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

export const orderService = {
  create,
};
