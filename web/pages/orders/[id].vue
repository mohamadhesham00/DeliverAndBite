<script setup lang="ts">
const route = useRoute();
const { request } = useApi();
const { token, ready } = useSupabaseAuth();
const { start, stop } = useLoading();
const router = useRouter();

type OrderLineItem = {
  id: string;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  menuItem: {
    name: string;
    category: string;
  };
};

type OrderDetails = {
  id: string;
  status: string;
  paymentStatus: string;
  subtotal: string | number;
  deliveryFee: string | number;
  total: string | number;
  notes?: string | null;
  createdAt: string;
  restaurant: {
    name: string;
    cuisine: string;
  };
  items: OrderLineItem[];
};

watch(
  [ready, token],
  ([isReady, authToken]) => {
    if (isReady && !authToken) {
      void router.push("/login");
    }
  },
  { immediate: true },
);

const { data, pending, error, refresh } =
  await useAsyncData<OrderDetails | null>(
    () =>
      request<OrderDetails | null>(`/orders/${route.params.id}`, {
        headers: { Authorization: `Bearer ${token.value || ""}` },
      }),
    { server: false, immediate: false },
  );

// If token already exists (user just signed in), fetch immediately but
// don't block rendering — show the global loading indicator while fetching.
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
  <section class="mx-auto max-w-3xl">
    <div class="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 sm:p-8">
      <p class="text-sm uppercase tracking-[0.3em] text-amber-300">
        Order details
      </p>
      <h1 class="mt-3 text-3xl font-black tracking-tight text-white">
        Your order is being prepared
      </h1>
      <p class="mt-3 max-w-2xl text-sm text-slate-300">
        View the status, totals, and item breakdown for this order by its ID.
      </p>
      <p v-if="pending" class="mt-4 text-slate-300">Loading order details...</p>
      <p v-else-if="error" class="mt-4 text-red-300">
        Could not load the order. Make sure your token is valid.
      </p>
      <div v-else class="mt-6 space-y-6">
        <div
          class="grid gap-6 rounded-2xl bg-slate-900 p-4 ring-1 ring-white/10 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-400">
              Order ID
            </p>
            <p class="mt-1 font-semibold text-white break-words">
              {{ data?.id }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-400">
              Status
            </p>
            <p class="mt-1 font-semibold text-white break-words">
              {{ data?.status }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-400">
              Payment
            </p>
            <p class="mt-1 font-semibold text-white">
              {{ data?.paymentStatus }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.24em] text-slate-400">
              Total
            </p>
            <p class="mt-1 font-semibold text-white">
              €{{ Number(data?.total || 0).toFixed(2) }}
            </p>
          </div>
        </div>

        <div class="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <div
            class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 class="text-lg font-semibold text-white">
                {{ data?.restaurant.name }}
              </h2>
              <p class="text-sm text-slate-400">
                {{ data?.restaurant.cuisine }}
              </p>
            </div>
            <p class="text-sm text-slate-400">
              Placed {{ new Date(data?.createdAt || "").toLocaleString() }}
            </p>
          </div>

          <div class="mt-5 space-y-3">
            <article
              v-for="item in data?.items || []"
              :key="item.id"
              class="flex items-start justify-between gap-4 rounded-2xl bg-slate-900 p-4 ring-1 ring-white/10"
            >
              <div>
                <p class="font-medium text-white">{{ item.menuItem.name }}</p>
                <p class="text-sm text-slate-400">
                  {{ item.menuItem.category }} · Qty {{ item.quantity }}
                </p>
              </div>
              <p class="font-semibold text-white">
                €{{ Number(item.lineTotal).toFixed(2) }}
              </p>
            </article>
          </div>

          <div
            class="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm text-slate-300"
          >
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span class="font-medium text-white"
                >€{{ Number(data?.subtotal || 0).toFixed(2) }}</span
              >
            </div>
            <div class="flex justify-between">
              <span>Delivery</span>
              <span class="font-medium text-white"
                >€{{ Number(data?.deliveryFee || 0).toFixed(2) }}</span
              >
            </div>
            <div
              class="flex justify-between border-t border-white/10 pt-3 text-base font-semibold text-white"
            >
              <span>Total</span>
              <span>€{{ Number(data?.total || 0).toFixed(2) }}</span>
            </div>
          </div>

          <p
            v-if="data?.notes"
            class="mt-5 rounded-2xl bg-slate-900 p-4 text-sm text-slate-300 ring-1 ring-white/10"
          >
            <span class="font-semibold text-white">Notes:</span>
            {{ data.notes }}
          </p>
        </div>
      </div>
      <NuxtLink
        to="/orders"
        class="mt-6 inline-flex rounded-xl bg-white/5 px-4 py-3 font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/10"
      >
        Back to orders
      </NuxtLink>
      <NuxtLink
        to="/"
        class="mt-6 inline-flex rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
      >
        Back to menu
      </NuxtLink>
    </div>
  </section>
</template>
