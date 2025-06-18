import { Documents } from "../interfaces/Order.interface";
import {
  AddProductBase,
  EditProductRequisition,
} from "../interfaces/Product.interface";
import {
  RequisitionCreateProps,
  RequisitionUpdateHeaders,
  ChangeStatus,
} from "../interfaces/Requisitions.interface";
import { fetchWrapper } from "./axiosInstance";

const create = async (Requisition: RequisitionCreateProps, token: string) => {
  return fetchWrapper
    .post("/requisitions/", {
      data: Requisition,
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
  data: RequisitionUpdateHeaders
) => {
  return fetchWrapper
    .put(`/requisitions/headers/${id}`, {
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

const addItemToRequisition = async (
  token: string,
  id: number,
  data: AddProductBase
) => {
  return fetchWrapper
    .put(`/requisitions/${id}/add_product`, {
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

const updateItemRequisition = async (
  token: string,
  id: number,
  data: EditProductRequisition
) => {
  return fetchWrapper
    .put(`/requisitions/${id}/update_product`, {
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
    .put(`/requisitions/${id}/document`, {
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
    .delete(`/requisitions/${id}/document?filename=${filename}`, {
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

const deleteItemInRequisition = async (
  token: string,
  id: number,
  requisition_id: number
) => {
  return fetchWrapper
    .delete(`/requisitions/${requisition_id}/remove_product/${id}`, {
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
    .delete(`/requisitions/${id}?comments=${commentaries}`, {})
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const getById = async (token: string, id: string) => {
  return fetchWrapper
    .get(`/requisitions/${id}`, {
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
    .get("/requisitions/", {
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
    .post(`/requisitions/${props.requisitionId}/change_status`, {
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

const getRequisitionHistory = async (token: string, id: number) => {
  return fetchWrapper
    .get(`/requisitions/${id}/history`, {
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
    .get(`/requisitions/${id}/documents`, {
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
    .get(`/requisitions/${id}/document/${document}`, {
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

const downloadPDFRequisition = async (token: string, id: number) => {
  return fetchWrapper
    .get(`/requisitions/${id}/pdf`, {
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

export const requisitionService = {
  create,
  getAll,
  getById,
  updateHeaders,
  addItemToRequisition,
  updateItemRequisition,
  deleteItemInRequisition,
  remove,
  changeStatus,
  getRequisitionHistory,
  getDocuments,
  downloadDocument,
  downloadPDFRequisition,
  addDocument,
  deleteDocument,
};
