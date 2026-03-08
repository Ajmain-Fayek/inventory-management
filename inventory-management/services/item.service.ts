import { axiosInstance } from "@/lib/axios";
import { catchAsync } from "@/lib/catchAsync";

export const itemService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createItem: catchAsync(async (payload: any, inventoryId: string) => {
    const response = await axiosInstance.post(`/api/v1/inventories/${inventoryId}/items`, payload);
    return response.data;
  }),

  getInvItems: catchAsync(async (inventoryId: string, page: number, recordLimit: number) => {
    const response = await axiosInstance.get(
      `/api/v1/inventories/${inventoryId}/items?page=${page}&recordLimit=${recordLimit}`,
    );
    return response.data;
  }),

  getItemById: catchAsync(async (itemId: string, inventoryId: string) => {
    const response = await axiosInstance.get(`/api/v1/inventories/${inventoryId}/items/${itemId}`);
    return response.data;
  }),

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateItem: catchAsync(async (payload: any, inventoryId: string, itemId: string) => {
    const response = await axiosInstance.put(
      `/api/v1/inventories/${inventoryId}/items/${itemId}`,
      payload,
    );
    return response.data;
  }),
};
