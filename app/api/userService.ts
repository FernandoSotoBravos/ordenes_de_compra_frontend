import { CreateUser, UpdatePassword } from "../interfaces/Users.interface";
import { fetchWrapper } from "./axiosInstance";

const create = async (token: string, newUser: CreateUser) => {
  return await fetchWrapper
    .post("/users/", {
      data: newUser,
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

const updatePassword = async (token: string, userId: number, newPassword: string) => {
  return fetchWrapper
    .put(`/users/${userId}/password`, {
      data: {
        new_password: newPassword,
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

const updatePasswordMe = async (token: string, newPassword: string) => {
  return fetchWrapper
    .put(`/users/me/password`, {
      data: {
        new_password: newPassword,
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

export const userService = {
  create,
  updatePassword,
  updatePasswordMe,
};
