import { signOut } from "next-auth/react";
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

const addQuotizations = async (
  token: string,
  id: number,
  data: Documents[]
) => {
  return fetchWrapper
    .put(`/requisitions/${id}/quo`, {
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

const rejectQuotizations = async (token: string, props: ChangeStatus) => {
  return fetchWrapper
    .put(`/requisitions/${props.requisitionId}/quo/reject`, {
      data: { comments: props.comments, status: props.status },
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

const acceptQuotization = async (
  token: string,
  id: number,
  filename: string,
  reason: string
) => {
  return fetchWrapper
    .put(`/requisitions/${id}/quo/accept`, {
      data: { filename: filename, comments: reason },
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

const restoreRequi = async (token: string, id: string) => {
  return fetchWrapper
    .put(`/requisitions/${id}/restore`, {
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

const getMyRequisitions = async (token: string) => {
  return fetchWrapper
    .get("/requisitions/me", {
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
  document: string,
  quo: boolean = false
) => {
  return fetchWrapper
    .get(`/requisitions/${id}/document/${document}?quo=${quo}`, {
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
      return response;
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
  restoreRequi,
  getMyRequisitions,
  addQuotizations,
  acceptQuotization,
  rejectQuotizations,
};
