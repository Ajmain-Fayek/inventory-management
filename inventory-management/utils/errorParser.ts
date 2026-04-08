/* eslint-disable @typescript-eslint/no-explicit-any */
export const getErrorMessage = (error: any): string => {
  const rawMessage =
    error?.response?.data?.message || error?.response?.data?.error || error?.message || "";
  const message = String(rawMessage).toLowerCase();

  if (message.includes("network error")) {
    return "We could not reach the server. Please check your connection and try again.";
  }
  if (message.includes("unauthorized")) {
    return "Your session has expired. Please sign in again.";
  }
  if (message.includes("forbidden")) {
    return "You do not have permission to perform this action.";
  }
  if (message.includes("being edited")) {
    return "This inventory is being edited by someone else. Please try again later.";
  }
  if (message.includes("not found")) {
    return "The requested record was not found.";
  }

  if (rawMessage) {
    return rawMessage;
  }

  return "Something went wrong. Please try again.";
};
