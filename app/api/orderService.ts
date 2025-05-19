import {
  ChangeStatus,
  Documents,
  OrderCreateProps,
  OrderUpdateHeaders,
} from "../interfaces/Order.interface";
import { AddProduct, EditProduct } from "../interfaces/Product.interface";
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

const updateHeaders = async (
  token: string,
  id: number,
  data: OrderUpdateHeaders
) => {
  return fetchWrapper
    .put(`/orders/headers/${id}`, {
      data: data,
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

const addItemToOrder = async (token: string, id: number, data: AddProduct) => {
  return fetchWrapper
    .put(`/orders/${id}/add_product`, {
      data: data,
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

const updateItemOrder = async (
  token: string,
  id: number,
  data: EditProduct
) => {
  return fetchWrapper
    .put(`/orders/${id}/update_product`, {
      data: data,
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

const addDocument = async (token: string, id: number, data: Documents[]) => {
  return fetchWrapper
    .put(`/orders/${id}/document`, {
      data: { documents: data },
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

const deleteDocument = async (token: string, filename: string, id: number) => {
  return fetchWrapper
    .delete(`/orders/${id}/document?filename=${filename}`, {
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

const deleteItemInOrder = async (
  token: string,
  id: number,
  order_id: number
) => {
  return fetchWrapper
    .delete(`/orders/${order_id}/remove_product/${id}`, {
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

const getById = async (token: string, id: string) => {
  return fetchWrapper
    .get(`/orders/${id}`, {
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

const getOrderHistory = async (token: string, id: number) => {
  return fetchWrapper
    .get(`/orders/${id}/history`, {
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

const getDocuments = async (token: string, id: number) => {
  return fetchWrapper
    .get(`/orders/${id}/documents`, {
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

const downloadDocument = async (
  token: string,
  id: number,
  document: string
) => {
  return fetchWrapper
    .get(`/orders/${id}/document/${document}`, {
      responseType: "blob",
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

const downloadPDFOrder = async (token: string, id: number) => {
  return fetchWrapper
    .get(`/orders/${id}/pdf`, {
      responseType: "blob",
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

export const orderService = {
  create,
  getAll,
  getById,
  updateHeaders,
  addItemToOrder,
  updateItemOrder,
  deleteItemInOrder,
  remove,
  changeStatus,
  getOrderHistory,
  getDocuments,
  downloadDocument,
  downloadPDFOrder,
  addDocument,
  deleteDocument
};
