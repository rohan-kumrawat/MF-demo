import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Match against originalRequest.url which is the path only (no baseURL).
const AUTH_ENDPOINTS_NO_RETRY = new Set([
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
]);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 10000, // 10 second timeout for requests
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
    delete config.headers["content-type"];
  }

  return config;
});

// ─── Dedicated refresh call — bypasses apiClient to avoid interceptor loop ───
// FIX #4: Use plain axios (not apiClient) so a 401 on /auth/refresh does NOT
// re-enter this interceptor and cause infinite recursion → logout.
const refreshTokens = async (refreshToken: string) => {
  const response = await axios.post<{
    accessToken: string;
    refreshToken: string;
  }>(
    `${apiBaseUrl}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );
  return response.data;
};

// ─── Response Interceptor ────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // FIX #3: Safely extract just the pathname, stripping baseURL and query params.
    // originalRequest.url is always the path passed to apiClient (e.g. "/auth/login"),
    // never the full URL — Axios concatenates baseURL internally. But we strip
    // query strings defensively.
    const requestPath = (originalRequest?.url ?? "").split("?")[0];
    const isNoRetryEndpoint = AUTH_ENDPOINTS_NO_RETRY.has(requestPath);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isNoRetryEndpoint
    ) {
      // Another refresh is already in-flight — queue this request.
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        if (!refreshToken) throw new Error("No refresh token available");

        // FIX #4: refreshTokens uses plain axios, not apiClient.
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          await refreshTokens(refreshToken);

        useAuthStore.getState().setAccessToken(newAccessToken);
        useAuthStore.getState().setRefreshToken(newRefreshToken);

        // FIX #5: Reset flag BEFORE processQueue so queued requests
        // don't see isRefreshing=true and get re-queued.
        isRefreshing = false;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false; // FIX #5: reset before processQueue here too
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
      // No `finally` block — isRefreshing is now explicitly managed above
      // so both success and error paths reset it before processQueue runs.
    }

    return Promise.reject(error);
  },
);
