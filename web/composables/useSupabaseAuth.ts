import { onMounted } from "vue";

type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  user?: { email?: string | null };
};

type SupabaseErrorResponse = {
  msg?: string;
  error_description?: string;
  message?: string;
};

const getSupabaseSignInErrorMessage = (error: unknown) => {
  const errorResponse = error as {
    data?: SupabaseErrorResponse;
    response?: { _data?: SupabaseErrorResponse };
    statusMessage?: string;
    message?: string;
  };

  const responseMessage =
    errorResponse.response?._data?.msg ??
    errorResponse.response?._data?.error_description ??
    errorResponse.response?._data?.message ??
    errorResponse.data?.msg ??
    errorResponse.data?.error_description ??
    errorResponse.data?.message ??
    errorResponse.statusMessage ??
    errorResponse.message ??
    "";

  const normalizedMessage = responseMessage.toLowerCase();

  if (
    normalizedMessage.includes("invalid_credentials") ||
    normalizedMessage.includes("invalid login credentials")
  ) {
    return "Incorrect email or password.";
  }

  return responseMessage || "Sign in failed.";
};

const storageKey = "deliverandbite.supabase.session";

export function useSupabaseAuth() {
  const token = useState<string>("supabase-token", () => "");
  const ready = useState<boolean>("supabase-auth-ready", () => false);

  const syncSession = async () => {
    if (typeof window === "undefined") return;

    const storedSession = window.localStorage.getItem(storageKey);
    if (!storedSession) {
      token.value = "";
      ready.value = true;
      return;
    }

    try {
      const session = JSON.parse(storedSession) as SupabaseSession;
      token.value = session.access_token ?? "";
    } catch {
      window.localStorage.removeItem(storageKey);
      token.value = "";
    }

    ready.value = true;
  };

  const signIn = async (email: string, password: string) => {
    const config = useRuntimeConfig();
    let session: SupabaseSession;

    try {
      session = await $fetch<SupabaseSession>(
        `${config.public.supabaseUrl}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            apikey: config.public.supabaseAnonKey,
            Authorization: `Bearer ${config.public.supabaseAnonKey}`,
            "Content-Type": "application/json",
          },
          body: { email, password },
        },
      );
    } catch (error) {
      throw new Error(getSupabaseSignInErrorMessage(error));
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify(session));
    }

    token.value = session.access_token;
    ready.value = true;
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }

    token.value = "";
    ready.value = true;
  };

  onMounted(() => {
    void syncSession();
  });

  return {
    token,
    ready,
    signIn,
    signOut,
  };
}
