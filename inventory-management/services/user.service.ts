import { axiosInstance } from "@/lib/axios";

export const userService = {
  getUser: async (email: string) => {
    const response = await axiosInstance.get(`/api/v1/users?user=${email}`);
    return response.data;
  },
};
