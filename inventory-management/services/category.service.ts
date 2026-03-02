import { axiosInstance } from "@/lib/axios";

export const categoryService = {
  getCategories: async () => {
    const response = await axiosInstance.get("/api/v1/categories");
    return response.data;
  },
};
