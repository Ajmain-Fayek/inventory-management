/* eslint-disable @typescript-eslint/no-explicit-any */
export const catchAsync = <T extends (...args: any[]) => Promise<any>>(fn: T) => {
  return async (...args: Parameters<T>): Promise<any> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      let formattedError;

      if (error.response) {
        formattedError = error.response.data;
      } else if (error.request) {
        formattedError = { success: false, message: "No response from server." };
      } else {
        formattedError = { success: false, message: error.message || "Unexpected error" };
      }

      throw formattedError;
    }
  };
};
