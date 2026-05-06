export {};

declare global {
  const computed: <T>(getter: () => T) => { value: T };
  const useState: <T>(key: string, init: () => T) => { value: T };
  const useAsyncData: <T>(
    key: string,
    handler: () => Promise<T>,
  ) => Promise<{
    data: { value: T | null };
    pending: { value: boolean };
    error: { value: unknown };
  }>;
  const useRouter: () => { push: (path: string) => Promise<void> };
  const useRoute: () => { params: Record<string, string | string[]> };
  const useRuntimeConfig: () => {
    public: { apiBase: string; supabaseUrl: string; supabaseAnonKey: string };
  };
  const ref: <T>(value: T) => { value: T };
  const $fetch: <T>(
    path: string,
    options?: Record<string, unknown>,
  ) => Promise<T>;
}
