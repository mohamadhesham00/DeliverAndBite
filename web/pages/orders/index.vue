<script setup lang="ts">
type OrderSummaryItem = {
  id: string;
  quantity: number;
};

type OrderSummary = {
  id: string;
  status: string;
  paymentStatus: string;
  total: string | number;
  createdAt: string;
  restaurant: {
    name: string;
  };
  items: OrderSummaryItem[];
};

const { request } = useApi();
const { token, ready } = useSupabaseAuth();
const { start, stop } = useLoading();
const router = useRouter();

watch(
  [ready, token],
  ([isReady, authToken]) => {
    if (isReady && !authToken) {
      void router.push("/login");
    }
  },
  { immediate: true },
);

const { data, pending, error, refresh } = await useAsyncData<OrderSummary[]>(
  "orders-history",
  () =>
    request<OrderSummary[]>("/orders", {
      headers: { Authorization: `Bearer ${token.value || ""}` },
    }),
  { server: false, immediate: false },
);

// If token is already present on navigation, fetch immediately but don't
// block rendering — show the global loading indicator while fetching.
if (token.value) {
  start();
  void refresh().finally(() => stop());
} else {
  watch([ready, token], ([isReady, authToken]) => {
    if (isReady && authToken) {
      start();
      void refresh().finally(() => stop());
    }
  });
}
</script>

<template>
  <section class="mx-auto max-w-4xl space-y-6">
    <div>
      <p class="text-sm uppercase tracking-[0.3em] text-amber-300">
        DeliverAndBite
      </p>
      <h1
        class="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl"
      >
        Your orders
      </h1>
      <p class="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
        Review every placed order and open any order by its ID for full details.
      </p>
    </div>

    <p v-if="pending" class="text-slate-300">Loading your orders...</p>
    <p v-else-if="error" class="text-red-300">
      Could not load your orders right now.
    </p>

    <div v-else-if="data?.length" class="space-y-4">
      <article
        v-for="order in data"
        :key="order.id"
        class="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 transition hover:bg-white/7"
      >
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-400">
              {{ order.restaurant.name }}
            </p>
            <h2 class="mt-2 text-xl font-semibold text-white break-words">
              Order {{ order.id }}
            </h2>
            <p class="mt-2 text-sm text-slate-300">
              {{ order.items.length }} item{{
                order.items.length === 1 ? "" : "s"
              }}
              · Placed {{ new Date(order.createdAt).toLocaleString() }}
            </p>
          </div>

          <div class="grid gap-4 text-sm text-slate-300 sm:text-right">
            <div>
              <span class="text-slate-400">Status:</span>
              <span class="ml-2 font-semibold text-white">{{
                order.status
              }}</span>
            </div>
            <div>
              <span class="text-slate-400">Payment:</span>
              <span class="ml-2 font-semibold text-white">{{
                order.paymentStatus
              }}</span>
            </div>
            <div>
              <span class="text-slate-400">Total:</span>
              <span class="ml-2 font-semibold text-white"
                >€{{ Number(order.total).toFixed(2) }}</span
              >
            </div>
          </div>
        </div>

        <div
          class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"
        >
          <p class="text-sm text-slate-400">
            Click through to view order details by ID.
          </p>
          <NuxtLink
            :to="`/orders/${order.id}`"
            class="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Open order
          </NuxtLink>
        </div>
      </article>
    </div>

    <div v-else class="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
      <p class="text-slate-300">You haven’t placed any orders yet.</p>
    </div>
  </section>
</template>
