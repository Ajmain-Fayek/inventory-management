import { axiosInstance } from "@/lib/axios";
import { catchAsync } from "@/lib/catchAsync";

export const userService = {
  getUser: catchAsync(async (email: string) => {
    const response = await axiosInstance.get(`/api/v1/users?user=${email}`);
    return response.data;
  }),

  getProfileData: catchAsync(async () => {
    const response = await axiosInstance.get("/api/v1/users/me/profile");
    return response.data;
  }),

  getAdminDashboardData: catchAsync(async () => {
    const response = await axiosInstance.get("/api/v1/users/admin/dashboard");
    return response.data;
  }),

  updateUsersByAdmin: catchAsync(
    async (
      userIds: string[],
      action: "BLOCK" | "UNBLOCK" | "MAKE_ADMIN" | "REMOVE_ADMIN" | "DELETE",
    ) => {
      const response = await axiosInstance.patch("/api/v1/users/admin/users", { userIds, action });
      return response.data;
    },
  ),
};
