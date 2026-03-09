import { IInventory } from "@/app/inventory/_interface";
import { axiosInstance } from "@/lib/axios";
import { catchAsync } from "@/lib/catchAsync";

export const inventoryService = {
  createInventory: catchAsync(async (payload: Partial<IInventory>) => {
    const response = await axiosInstance.post("/api/v1/inventories", payload);
    return response.data;
  }),

  getInventories: catchAsync(async (page: number, recordLimit: number) => {
    const response = await axiosInstance.get(
      `/api/v1/inventories?page=${page}&recordLimit=${recordLimit}`,
    );
    return response.data;
  }),

  getInventoryById: catchAsync(async (inventoryId: string) => {
    const response = await axiosInstance.get(`/api/v1/inventories/${inventoryId}`);
    return response.data;
  }),

  updateInventory: catchAsync(async (inventoryId: string, payload: Partial<IInventory>) => {
    const response = await axiosInstance.put(`/api/v1/inventories/${inventoryId}`, payload);
    return response.data;
  }),

  lockInventory: catchAsync(async (inventoryId: string) => {
    const response = await axiosInstance.put(`/api/v1/inventories/${inventoryId}/lock`);
    return response.data;
  }),
  
  releaseInventory: catchAsync(async (inventoryId: string) => {
    const response = await axiosInstance.put(`/api/v1/inventories/${inventoryId}/release`);
    return response.data;
  }),
};
