import { OrderCreateProps } from "../interfaces/Order.interface";
import { fetchWrapper } from "./axiosInstance";

const create = async (order: OrderCreateProps) => {
  return fetchWrapper
    .post("/orders/", {
      data: order,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return Promise.reject(error);
    });
};

const update = async (id: number, concept: any) => {
  return fetchWrapper
    .put(`/orders/${id}`, {
      data: concept,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const remove = async (id: number, commentaries: string) => {
  return fetchWrapper
    .delete(`/orders/${id}?comments=${commentaries}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const getById = async (id: string) => {
  return fetchWrapper
    .get(`/orders/${id}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};

const getAll = async (
  limit: number = 50,
  page: number = 1,
  status: string = ""
) => {
  let params: { limit: number; page: number; status?: string } = {
    limit: limit,
    page: 2,
  };

  if (status) {
    params.status = status;
  }
  return fetchWrapper
    .get("/orders/", {
      params: params,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const changeStatus = async (id: number, status: string) => {
  return fetchWrapper
    .patch(`/orders/${id}/${status}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

export const orderService = {
  create,
  getAll,
  getById,
  update,
  remove,
  changeStatus,
};
