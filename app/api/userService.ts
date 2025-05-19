import { CreateUser, UpdatePassword } from "../interfaces/Users.interface";
import { fetchWrapper } from "./axiosInstance";

const create = async (newUser: CreateUser) => {
  return await fetchWrapper
    .post("/users/", {
      data: newUser,
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      return error;
    });
};

const updatePassword = async (userId: number, newPassword: string) => {
  return fetchWrapper
    .put(`/users/${userId}/password`, {
      data: {
        new_password: newPassword,
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
};
