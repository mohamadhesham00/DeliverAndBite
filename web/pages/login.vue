<script setup lang="ts">
const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");
const router = useRouter();
const { signIn, token, ready } = useSupabaseAuth();

// If the user is already signed in, redirect them to the home page.
watch(
  [ready, token],
  ([isReady, authToken]) => {
    if (isReady && authToken) {
      void router.push("/");
    }
  },
  { immediate: true },
);

const submit = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    await signIn(email.value, password.value);
    await router.push("/checkout");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Sign in failed";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="mx-auto max-w-md">
    <div class="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
      <p class="text-sm uppercase tracking-[0.3em] text-amber-300">
        Supabase auth
      </p>
      <h1 class="mt-3 text-3xl font-semibold text-white">Sign in</h1>
      <p class="mt-3 text-sm text-slate-300">
        Your session JWT will be stored by Supabase and sent automatically with
        your order.
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <label class="block text-sm text-slate-300">
          Email
          <input
            v-model="email"
            type="email"
            class="mt-2 w-full rounded-2xl bg-slate-900 p-3 text-slate-100 ring-1 ring-white/10"
            required
          />
        </label>

        <label class="block text-sm text-slate-300">
          Password
          <input
            v-model="password"
            type="password"
            class="mt-2 w-full rounded-2xl bg-slate-900 p-3 text-slate-100 ring-1 ring-white/10"
            required
          />
        </label>

        <p v-if="errorMessage" class="text-sm text-red-300">
          {{ errorMessage }}
        </p>

        <button
          class="w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 inline-flex items-center justify-center"
          :disabled="loading"
        >
          <template v-if="loading">
            <span
              class="mr-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
            ></span>
            <span>Signing in...</span>
          </template>
          <template v-else>
            <span>Sign in</span>
          </template>
        </button>
      </form>
    </div>
  </section>
</template>
