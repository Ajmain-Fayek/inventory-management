import { axiosInstance } from "@/lib/axios";
import { catchAsync } from "@/lib/catchAsync";

export const tagService = {
  getTags: catchAsync(async (name: string) => {
    const response = await axiosInstance.get(`/api/v1/tags?tag=${name}`);
    return response.data;
  }),

  createTag: catchAsync(async (name: string) => {
    const payload = { tag: name };
    const response = await axiosInstance.post(`/api/v1/tags`, payload);
    return response.data;
  }),
};
