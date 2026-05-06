<script setup lang="ts">
const { cartToast, hideCartToast } = useCart();
const { token, signOut } = useSupabaseAuth();
const { loading } = useLoading();
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <header class="border-b border-white/10 bg-slate-950/95 backdrop-blur">
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"
      >
        <NuxtLink to="/" class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 text-sm font-black tracking-tight text-slate-950 shadow-lg shadow-amber-400/20"
          >
            DB
          </div>
          <div class="leading-tight">
            <div class="text-lg font-black tracking-tight sm:text-xl">
              <span class="text-white">Deliver</span>
              <span class="text-amber-300">AndBite</span>
            </div>
            <p class="text-[10px] uppercase tracking-[0.35em] text-slate-400">
              Food delivery made sharp
            </p>
          </div>
        </NuxtLink>
        <div class="flex items-center gap-2 sm:gap-3">
          <NuxtLink
            v-if="token"
            to="/orders"
            class="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Orders
          </NuxtLink>
          <NuxtLink
            v-if="!token"
            to="/login"
            class="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Sign in
          </NuxtLink>
          <button
            v-else
            class="rounded-full bg-white/5 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
            @click="signOut"
          >
            Sign out
          </button>
          <NuxtLink
            to="/checkout"
            class="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Checkout
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <NuxtPage />
      <div
        v-if="loading"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 backdrop-blur-sm"
      >
        <div
          class="inline-flex items-center gap-3 rounded-2xl bg-slate-900/95 px-6 py-4 ring-1 ring-white/10 shadow-2xl"
        >
          <span
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/70 border-t-transparent"
          ></span>
          <span class="text-base font-semibold text-white">Loading…</span>
        </div>
      </div>
    </main>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="cartToast.visible"
        class="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-slate-900/95 p-4 shadow-2xl ring-1 ring-white/10"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-emerald-300">Added to cart</p>
            <p class="mt-1 text-sm text-slate-200">{{ cartToast.message }}</p>
            <NuxtLink
              to="/checkout"
              class="mt-3 inline-flex rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
            >
              Go to cart
            </NuxtLink>
          </div>
          <button
            class="rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
            aria-label="Close toast"
            @click="hideCartToast"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
