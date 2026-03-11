import axios from "axios";

const getBaseURL = () => {
  if (typeof window === "undefined") {
    return `${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/api/proxy`;
  }
  return "/api/proxy";
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthMe = error.config?.url?.includes("/api/v1/auth/me");
    if (error.response?.status === 401 && !isAuthMe) {
      if (typeof window !== "undefined") {
        if (!window.location.pathname.startsWith("/auth/login")) {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
    }
    return Promise.reject(error);
  },
);
