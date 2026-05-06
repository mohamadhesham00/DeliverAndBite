<script setup lang="ts">
const { request } = useApi();
const { addItem, items: cartItems } = useCart();

type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string | number;
  imageUrl?: string | null;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  imageUrl?: string | null;
  menuItems: MenuItem[];
};

const { data, pending, error } = await useAsyncData("menu-items", () =>
  request<Restaurant[]>("/menu-items"),
);
const selectedCategory = ref("All");

const categories = computed(() => {
  const allCategories =
    data.value?.flatMap((restaurant) =>
      restaurant.menuItems.map((item) => item.category),
    ) ?? [];
  return ["All", ...new Set(allCategories)];
});

const restaurants = computed(() =>
  (data.value ?? [])
    .map((restaurant) => ({
      ...restaurant,
      menuItems: restaurant.menuItems.filter(
        (item) =>
          selectedCategory.value === "All" ||
          item.category === selectedCategory.value,
      ),
    }))
    .filter((restaurant) => restaurant.menuItems.length > 0),
);
</script>

<template>
  <section class="space-y-8">
    <div
      class="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-transparent p-6 sm:p-8"
    >
      <div
        class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="max-w-3xl">
          <p class="text-sm uppercase tracking-[0.3em] text-amber-300">
            DeliverAndBite
          </p>
          <h1
            class="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl"
          >
            Delicious food, delivered with bite.
          </h1>
          <p
            class="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base"
          >
            Browse live menus, save your cart, sign in with Supabase, and track
            every order from checkout to confirmation.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm sm:text-base">
          <div class="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p class="text-slate-400">Brand</p>
            <p class="mt-1 font-semibold text-white">Logo-ready UI</p>
          </div>
          <div class="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p class="text-slate-400">Orders</p>
            <p class="mt-1 font-semibold text-white">List + detail views</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category"
        class="rounded-full px-4 py-2 text-sm ring-1 ring-white/10 transition"
        :class="
          selectedCategory === category
            ? 'bg-amber-400 text-slate-950'
            : 'bg-white/5 text-slate-200 hover:bg-white/10'
        "
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <p v-if="pending" class="text-slate-300">Loading menu...</p>
    <p v-else-if="error" class="text-red-300">Failed to load menu items.</p>

    <div v-else class="space-y-8">
      <article
        v-for="restaurant in restaurants"
        :key="restaurant.id"
        class="space-y-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-semibold text-white">
              {{ restaurant.name }}
            </h2>
            <p class="text-sm text-slate-400">{{ restaurant.cuisine }}</p>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div
            v-for="item in restaurant.menuItems"
            :key="item.id"
            class="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="h-48 w-full object-cover"
            />
            <div class="space-y-3 p-5">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="text-lg font-semibold text-white">
                    {{ item.name }}
                  </h3>
                  <p class="text-sm text-slate-400">{{ item.category }}</p>
                </div>
                <span
                  class="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-semibold text-amber-300"
                >
                  €{{ Number(item.price).toFixed(2) }}
                </span>
              </div>
              <p class="text-sm leading-6 text-slate-300">
                {{ item.description }}
              </p>
              <button
                :disabled="
                  cartItems.length > 0 &&
                  cartItems[0].restaurantId !== restaurant.id &&
                  !cartItems.find((i) => i.id === item.id)
                "
                :title="
                  cartItems.length > 0 &&
                  cartItems[0].restaurantId !== restaurant.id &&
                  !cartItems.find((i) => i.id === item.id)
                    ? 'Clear your cart to add items from this restaurant'
                    : ''
                "
                class="w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-950 transition"
                :class="
                  cartItems.length > 0 &&
                  cartItems[0].restaurantId !== restaurant.id &&
                  !cartItems.find((i) => i.id === item.id)
                    ? 'bg-white/10 cursor-not-allowed opacity-60'
                    : 'bg-amber-400 hover:bg-amber-300'
                "
                @click="
                  addItem({
                    id: item.id,
                    restaurantId: restaurant.id,
                    name: item.name,
                    price: Number(item.price),
                  })
                "
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
