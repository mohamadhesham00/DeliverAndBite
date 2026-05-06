import { useSupabaseAuth } from "./useSupabaseAuth";

export function useApi() {
  const config = useRuntimeConfig();
  const { signOut } = useSupabaseAuth();

  const request = async <T>(path: string, options: RequestInit = {}) => {
    try {
      return await $fetch<T>(path, {
        baseURL: config.public.apiBase,
        ...options,
      });
    } catch (error) {
      const responseError = error as {
        status?: number;
        statusCode?: number;
        data?: { message?: string; error?: string };
        response?: {
          status?: number;
          _data?: { message?: string; error?: string };
        };
        message?: string;
      };

      const status =
        responseError.status ??
        responseError.statusCode ??
        responseError.response?.status;
      const message =
        responseError.data?.message ??
        responseError.data?.error ??
        responseError.response?._data?.message ??
        responseError.response?._data?.error ??
        responseError.message ??
        "";

      if (
        status === 401 &&
        message.toLowerCase().includes("session has expired")
      ) {
        await signOut();
      }

      throw error;
    }
  };

  return { request };
}
