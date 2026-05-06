<script setup lang="ts">
const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
const { request } = useApi();
const { token, ready } = useSupabaseAuth();
const router = useRouter();

const submitting = ref(false);
const notes = ref("");

watch(
  [ready, token],
  ([isReady, authToken]) => {
    if (isReady && !authToken) {
      void router.push("/login");
    }
  },
  { immediate: true },
);

const placeOrder = async () => {
  if (!items.value.length || submitting.value) return;

  if (!token.value) {
    await router.push("/login");
    return;
  }

  submitting.value = true;

  try {
    const order = await request<{ id: string }>("/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        restaurantId: items.value[0].restaurantId,
        notes: notes.value,
        items: items.value.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      }),
    });

    clearCart();
    await router.push(`/orders/${order.id}`);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
    <div class="space-y-4">
      <h1 class="text-3xl font-semibold text-white">Checkout</h1>

      <div
        v-if="items.length === 0"
        class="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10"
      >
        <p class="text-slate-300">
          Your cart is empty. Add menu items before checking out.
        </p>
      </div>

      <div v-else class="space-y-3">
        <article
          v-for="item in items"
          :key="item.id"
          class="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-white">{{ item.name }}</h2>
              <p class="text-sm text-slate-400">€{{ item.price.toFixed(2) }}</p>
            </div>
            <button class="text-sm text-red-300" @click="removeItem(item.id)">
              Remove
            </button>
          </div>

          <div class="mt-4 flex items-center gap-3">
            <button
              class="rounded-lg bg-white/10 px-3 py-2"
              @click="updateQuantity(item.id, item.quantity - 1)"
            >
              -
            </button>
            <span class="min-w-8 text-center">{{ item.quantity }}</span>
            <button
              class="rounded-lg bg-white/10 px-3 py-2"
              @click="updateQuantity(item.id, item.quantity + 1)"
            >
              +
            </button>
          </div>
        </article>
      </div>
    </div>

    <aside class="h-fit rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
      <h2 class="text-xl font-semibold text-white">Order summary</h2>
      <div class="mt-4 space-y-2 text-sm text-slate-300">
        <div class="flex justify-between">
          <span>Subtotal</span><span>€{{ subtotal.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Delivery</span
          ><span>€{{ subtotal >= 30 ? "0.00" : "2.99" }}</span>
        </div>
        <div
          class="flex justify-between border-t border-white/10 pt-3 text-base font-semibold text-white"
        >
          <span>Total</span>
          <span
            >€{{ (subtotal + (subtotal >= 30 ? 0 : 2.99)).toFixed(2) }}</span
          >
        </div>
      </div>

      <label class="mt-5 block text-sm text-slate-300">
        Delivery notes
        <textarea
          v-model="notes"
          class="mt-2 w-full rounded-2xl bg-slate-900 p-3 text-slate-100 ring-1 ring-white/10"
          rows="4"
          placeholder="Apartment number, door code..."
        />
      </label>

      <button
        class="mt-5 w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        :disabled="items.length === 0 || submitting || !token"
        @click="placeOrder"
      >
        {{
          submitting
            ? "Placing order..."
            : !token
              ? "Sign in to place order"
              : "Place order"
        }}
      </button>
    </aside>
  </section>
</template>
