# DeliverAndBite Frontend Guide (Nuxt 4)

This README is a **full frontend guide** for the `web` app and includes a **line-by-line explanation** of the current source files in this folder.

---

## 1) What this frontend does

The frontend is a Nuxt 4 application that provides:

- Menu browsing by restaurant/category
- Cart management in client state
- Supabase sign-in (without official SDK, using REST auth endpoint)
- Checkout flow with JWT-authenticated order creation
- Orders history and order detail pages
- Global app shell with header, toast, and loading overlay

---

## 2) Tech stack

- **Nuxt 4**
- **Vue 3 (`<script setup>`)**
- **Tailwind CSS**
- **TypeScript**

---

## 3) Frontend folder structure

```text
web/
  app.vue
  nuxt.config.ts
  package.json
  tsconfig.json
  assets/
    css/
      tailwind.css
  composables/
    useApi.ts
    useCart.ts
    useLoading.ts
    useSupabaseAuth.ts
  pages/
    index.vue
    login.vue
    checkout.vue
    orders/
      index.vue
      [id].vue
  plugins/
  types/
    nuxt-shims.d.ts
```

---

## 4) Setup and run

From workspace root:

```bash
pnpm install
pnpm --filter @deliverandbite/web dev
```

Build:

```bash
pnpm --filter @deliverandbite/web build
```

---

## 5) Environment variables

The frontend uses runtime config keys:

- `NUXT_PUBLIC_API_BASE`
- `NUXT_PUBLIC_SUPABASE_URL`
- `NUXT_PUBLIC_SUPABASE_ANON_KEY`

Example:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
NUXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

---

## 6) High-level request/auth flow

1. User opens app.
2. `useSupabaseAuth()` restores JWT from `localStorage` on mount.
3. Protected pages (`checkout`, `orders`) watch `ready + token` and redirect to `/login` if not authenticated.
4. API calls are made through `useApi()` using `runtimeConfig.public.apiBase`.
5. Authenticated requests attach `Authorization: Bearer <token>`.

---

## 7) Line-by-line explanations

> Note: explanations follow current file content in this project.

---

### 7.1 `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  modules: ["@nuxtjs/tailwindcss"],
  css: ["~/assets/css/tailwind.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:3001",
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL ?? "",
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    },
  },
});
```

- Line 1: Exports Nuxt config object.
- Line 2: Registers Tailwind module.
- Line 3: Loads global Tailwind stylesheet.
- Line 4: Declares runtime config block.
- Line 5: Starts public (client-visible) config section.
- Line 6: Sets backend base URL from env or localhost fallback.
- Line 7: Sets Supabase URL from env.
- Line 8: Sets Supabase anon key from env.
- Lines 9–11: Close nested objects.

---

### 7.2 `package.json`

- `name`: package name for the frontend workspace.
- `private`: prevents accidental npm publish.
- `scripts.dev`: runs local Nuxt dev server.
- `scripts.build`: builds production bundle.
- `scripts.generate`: static generation mode.
- `scripts.lint`: lints TypeScript files.
- `dependencies`: runtime libs (`nuxt`, `vue`).
- `devDependencies`: tooling (Tailwind, ESLint, TypeScript, typings).

---

### 7.3 `tsconfig.json`

- `extends`: inherits repo root TS base config.
- `compilerOptions.baseUrl`: sets local base for path mapping.
- `paths.~/*` and `paths.@/*`: alias shortcuts to project root.
- `include`: compile all `ts`, `vue`, and custom type declarations.

---

### 7.4 `assets/css/tailwind.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  color-scheme: dark;
}

body {
  @apply bg-slate-950 text-slate-100 antialiased;
}
```

- Lines 1–3: Inject Tailwind layers.
- Lines 5–7: Force dark-compatible UI controls.
- Lines 9–11: Apply global background/text smoothing.

---

### 7.5 `types/nuxt-shims.d.ts`

Purpose: provides lightweight global declarations so TypeScript understands auto-imported Nuxt/Vue helpers.

Key declarations:

- `computed`, `ref`, `useState`, `useAsyncData`
- `useRouter`, `useRoute`
- `useRuntimeConfig`
- `$fetch`

Each declaration describes the argument and return shapes used by this codebase.

---

### 7.7 `composables/useApi.ts`

```ts
export function useApi() {
  const config = useRuntimeConfig();

  const request = async <T>(path: string, options: RequestInit = {}) => {
    return await $fetch<T>(path, {
      baseURL: config.public.apiBase,
      ...options,
    });
  };

  return { request };
}
```

- Line 1: Exports composable factory.
- Line 2: Reads runtime config.
- Line 4: Defines generic `request<T>` helper with optional fetch options.
- Line 5: Performs `$fetch` for typed response.
- Line 6: Prefixes all requests with configured API base URL.
- Line 7: Merges caller options (headers, method, body, etc.).
- Line 10: Exposes helper.

---

### 7.8 `composables/useLoading.ts`

```ts
import { ref } from "vue";

const loading = ref(false);

export default function useLoading() {
  function start() {
    loading.value = true;
  }
  function stop() {
    loading.value = false;
  }
  return { loading, start, stop };
}
```

- Line 1: Imports Vue `ref`.
- Line 3: Creates module-level shared loading state.
- Line 5: Exports composable returning state + mutators.
- Lines 6–8: `start()` turns loading on.
- Lines 9–11: `stop()` turns loading off.
- Line 12: Returns public API.

---

### 7.9 `composables/useCart.ts`

This file manages cart state and toast behavior.

Line-by-line summary:

1. Declares `CartItem` type (`id`, `restaurantId`, `name`, `price`, `quantity`).
2. Declares `CartToast` type (`visible`, `message`).
3. Keeps `toastTimeout` outside composable to reuse across calls.
4. `useCart()` creates/returns app-wide cart state via Nuxt `useState`.
5. `items` state stores cart items.
6. `cartToast` state stores toast visibility + text.
7. `showCartToast(message)` shows toast, clears previous timeout, auto-hides in 3s.
8. `hideCartToast()` closes toast immediately.
9. `addItem(item, quantity)` increments quantity if existing item, otherwise pushes new item.
10. `removeItem(itemId)` filters item out.
11. `updateQuantity(itemId, quantity)` clamps minimum quantity to 1.
12. `clearCart()` empties cart.
13. `subtotal` is computed sum of `price * quantity` for all items.
14. Returns all state and actions.

---

### 7.10 `composables/useSupabaseAuth.ts`

This is the auth core for frontend.

Line-by-line behavior:

1. Imports `onMounted`.
2. Defines `SupabaseSession` type for auth response payload.
3. Defines `SupabaseErrorResponse` type for different API error formats.
4. `getSupabaseSignInErrorMessage(error)` normalizes error structures.
5. Extracts message from multiple possible nested locations (`response._data`, `data`, generic fields).
6. Lowercases message and maps invalid credential patterns to friendly text.
7. Defines storage key: `deliverandbite.supabase.session`.
8. `useSupabaseAuth()` creates shared states:
   - `token`: JWT string
   - `ready`: whether local session sync has completed
9. `syncSession()`:
   - exits on server side
   - reads localStorage
   - if empty: clear token + mark ready
   - if present: parse JSON and copy `access_token`
   - on parse fail: remove corrupt storage
   - mark ready at end
10. `signIn(email, password)`:
    - reads runtime config
    - calls Supabase REST endpoint `/auth/v1/token?grant_type=password`
    - sends `apikey`, `Authorization`, JSON body
    - on failure throws normalized error
    - stores session in localStorage
    - updates `token` and `ready`
11. `signOut()`:
    - removes session from localStorage
    - clears token and marks ready
12. `onMounted(() => syncSession())` runs auth restore on client mount.
13. Returns `{ token, ready, signIn, signOut }`.

---

### 7.12 `app.vue`

This is the global shell.

`<script setup>`:

- `useCart()` provides toast state/actions.
- `useSupabaseAuth()` provides token and signOut for nav.
- `useLoading()` provides global loading flag.

`<template>` structure:

1. Root container with dark theme.
2. Header with branding and nav links:
   - If logged in: show `Orders`
   - If logged out: show `Sign in`
   - If logged in: show `Sign out` button
   - Always show `Checkout`
3. Main container renders current page via `<NuxtPage />`.
4. Global loading overlay (`v-if="loading"`) with centered spinner and high z-index.
5. Animated cart toast (`<Transition>`) in lower-right with quick link to checkout.

---

### 7.13 `pages/index.vue`

Purpose: menu browser + category filtering + add-to-cart.

Line-by-line flow:

1. Gets `request` and `addItem` composables.
2. Defines `MenuItem` and `Restaurant` types.
3. Loads menu via `useAsyncData("menu-items", ...)` from `/menu-items`.
4. Holds `selectedCategory` in local ref (`"All"`).
5. `categories` computed:
   - flattens all menu item categories
   - returns `All` + unique categories
6. `restaurants` computed:
   - maps each restaurant
   - filters menu items by selected category
   - removes restaurants with zero visible items
7. Template:
   - hero/brand section
   - category pills
   - loading/error states
   - restaurant cards and menu item cards
   - `Add to cart` button passes normalized item payload to cart composable.

---

### 7.14 `pages/login.vue`

Purpose: sign-in form with redirect protection + button spinner.

Script behavior:

1. `email`, `password`, `loading`, `errorMessage` refs.
2. `router` for navigation.
3. Reads `signIn`, `token`, `ready` from auth composable.
4. Watches `[ready, token]`; if already authenticated, redirect to `/`.
5. `submit()`:
   - sets loading true, clears error
   - calls `signIn(email, password)`
   - on success navigates to `/checkout`
   - on failure stores readable error
   - always resets loading false

Template behavior:

- Form with email/password controlled inputs.
- Error line shown conditionally.
- Submit button disabled while loading.
- Loading mode shows inline spinner + text `Signing in...`.

---

### 7.15 `pages/checkout.vue`

Purpose: cart review + place order.

Script behavior:

1. Reads cart data/actions and API helper.
2. Reads auth token/ready and router.
3. Local state: `submitting`, `notes`.
4. Watches auth and redirects to `/login` when unauthenticated.
5. `placeOrder()`:
   - prevents duplicate submit or empty cart
   - ensures token exists, otherwise redirect login
   - POSTs to `/orders` with bearer token
   - body includes restaurant, notes, and cart line items
   - clears cart and routes to `/orders/:id`
   - resets `submitting` in `finally`

Template behavior:

- Left: cart line items with quantity controls.
- Right: order summary (`subtotal`, delivery fee, total), notes textarea, place-order button.
- Button text adapts to state (`Placing order...`, `Sign in to place order`, `Place order`).

---

### 7.16 `pages/orders/index.vue`

Purpose: authenticated order history list.

Script behavior:

1. Defines order summary types.
2. Gets API, auth state, global loading helpers, and router.
3. Redirects to login when unauthenticated.
4. Uses `useAsyncData` with `server: false`, `immediate: false`.
5. If token already exists:
   - start global loading
   - call `refresh()` (non-blocking)
   - stop loading when finished
6. If token is late-loaded:
   - watch auth and trigger same refresh logic when token arrives.

Template behavior:

- Header and description.
- Loading/error text states.
- Order cards with restaurant, order id, counts, created date, status/payment/total.
- Card footer with link to order detail page.

---

### 7.17 `pages/orders/[id].vue`

Purpose: authenticated single-order detail page.

Script behavior:

1. Gets route, API, auth state, global loading, router.
2. Defines order detail types and line item types.
3. Redirects unauthenticated users to login.
4. Uses `useAsyncData` lazy client fetch (server false + immediate false).
5. Runs `refresh()` with global loading overlay when token exists or arrives.

Template behavior:

- Title and loading/error messages.
- Top stats grid (Order ID, Status, Payment, Total) with improved spacing/wrapping.
- Restaurant info and placed date.
- Line items with quantities and line totals.
- Totals breakdown (subtotal/delivery/total).
- Optional notes block.
- Navigation links back to orders and menu.

---

## 8) UI patterns used in this frontend

- **Global shell pattern** in `app.vue`.
- **Composable state pattern** for API/auth/cart/loading logic.
- **Auth gate pattern** using `watch([ready, token])` before route actions.
- **Optimistic navigation + lazy fetch** on orders pages with overlay spinner.
- **Tailwind utility-first styling** for layout, color, spacing, and transitions.

---

## 9) Common extension points

If you want to extend frontend safely:

1. Add new API calls through `useApi()`.
2. Keep shared state in composables (`useState`/module refs).
3. Use auth watch guard pattern on protected pages.
4. For blocking transitions, call `useLoading().start()` before request and `stop()` in `finally`.
5. Keep DTO types near page/composable where they are used.

---

## 10) Quick troubleshooting

- **Blank data on protected page**: verify token exists and `ready` became true.
- **Unauthorized API errors**: check `Authorization` header formatting (`Bearer <token>`).
- **Spinner never stops**: ensure each `start()` has a matching `finally(() => stop())`.
- **Wrong API host**: verify `NUXT_PUBLIC_API_BASE`.
- **Supabase login issues**: verify `NUXT_PUBLIC_SUPABASE_URL` and anon key.

---

## 11) Summary

This frontend is structured around composables and page-level UI with explicit auth/load handling. The code is intentionally straightforward and strongly typed, making it easy to maintain and extend.

If you want, I can also generate a second document that gives an even stricter **literal line-by-line annotation block for each source file with exact line numbers**.
