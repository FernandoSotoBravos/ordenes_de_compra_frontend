import { ChangeStatus, OrderCreateProps } from "../interfaces/Order.interface";
import { fetchWrapper } from "./axiosInstance";

const create = async (order: OrderCreateProps, token: string) => {
  return fetchWrapper
    .post("/orders/", {
      data: order,
      headers: {
        Authorization: "Bearer " + token,
      },
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
  token: string,
  limit: number = 10,
  page: number = 1,
  status: string = ""
) => {
  let params: { limit: number; page: number; status?: string } = {
    limit: limit,
    page: page,
  };

  if (status) {
    params.status = status;
  }
  return fetchWrapper
    .get("/orders/", {
      params: params,
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

const changeStatus = async (token: string, props: ChangeStatus) => {
  return fetchWrapper
    .post(`/orders/${props.orderId}/change_status`, {
      data: {
        status: props.status,
        comments: props.comments,
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

const getOrderHistory = async (id: number) => {
  return fetchWrapper
    .get(`/orders/${id}/history`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const getDocuments = async (id: number) => {
  return fetchWrapper
    .get(`/orders/${id}/documents`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

const downloadDocument = async (id: number, document: string) => {
  return fetchWrapper
    .get(`/orders/${id}/document/${document}`, {
      responseType: "blob",
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      throw error;
    });
};

export const orderService = {
  create,
  getAll,
  getById,
  update,
  remove,
  changeStatus,
  getOrderHistory,
  getDocuments,
  downloadDocument,
};
