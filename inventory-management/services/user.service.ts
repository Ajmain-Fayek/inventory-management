import { axiosInstance } from "@/lib/axios";
import { catchAsync } from "@/lib/catchAsync";

export const userService = {
  getUser: catchAsync(async (email: string) => {
    const response = await axiosInstance.get(`/api/v1/users?user=${email}`);
    return response.data;
  }),
};
