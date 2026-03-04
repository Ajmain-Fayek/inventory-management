import { axiosInstance } from "@/lib/axios";

export const inventoryService = {
  createInventory: async (payload: any) => {
    const response = await axiosInstance.post("/api/v1/inventories", payload);
    return response.data;
  },

  getInventories: async (page: number, recordLimit: number) => {
    const response = await axiosInstance.get(
      `/api/v1/inventories?page=${page}&recordLimit=${recordLimit}`,
    );
    return response.data;
  },
  getInventoryById: async (inventoryId: string) => {
    const response = await axiosInstance.get(`/api/v1/inventories/${inventoryId}`);
    return response.data;
  },

  getInvItems: async (inventoryId: string, page: number, recordLimit: number) => {
    const response = await axiosInstance.get(
      `/api/v1/inventories/${inventoryId}/items?page=${page}&recordLimit=${recordLimit}`,
    );
    return response.data;
  },

  // addItem: async (data: { name: string; quantity: number }) => {
  //   const response = await axiosInstance.post("/api/v1/inventory/items", data);
  //   return response.data;
  // },
};
