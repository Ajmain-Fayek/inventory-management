/* eslint-disable @typescript-eslint/no-explicit-any */
export const getErrorMessage = (error: any): string => {
  if (error?.message) return error.message;

  if (error?.response?.data?.message) return error.response.data.message;

  return "An unexpected error occurred.";
};
