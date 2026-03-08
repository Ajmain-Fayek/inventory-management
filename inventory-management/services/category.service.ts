import { axiosInstance } from "@/lib/axios";
import { catchAsync } from "@/lib/catchAsync";

export const categoryService = {
  getCategories: catchAsync(async () => {
    const response = await axiosInstance.get("/api/v1/categories");
    return response.data;
  }),
};
