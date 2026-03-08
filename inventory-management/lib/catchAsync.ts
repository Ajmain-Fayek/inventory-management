/* eslint-disable @typescript-eslint/no-explicit-any */

export const catchAsync = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  return async (...args: Parameters<T>): Promise<any> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      // Axios Response Error (4xx, 5xx)
      if (error.response) {
        return error.response.data;
      }

      // Axios Request Error (No res)
      if (error.request) {
        return { success: false, message: "No response from server. Check your connection." };
      }

      // Generic Error (crash, error)
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
    }
  };
};
