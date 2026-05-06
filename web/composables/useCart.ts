export type CartItem = {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  quantity: number;
};

type CartToast = {
  visible: boolean;
  message: string;
};

let toastTimeout: ReturnType<typeof setTimeout> | null = null;

export function useCart() {
  const items = useState<CartItem[]>("cart-items", () => []);
  const cartToast = useState<CartToast>("cart-toast", () => ({
    visible: false,
    message: "",
  }));

  const showCartToast = (message: string) => {
    cartToast.value = { visible: true, message };

    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toastTimeout = setTimeout(() => {
      cartToast.value.visible = false;
    }, 3000);
  };

  const hideCartToast = () => {
    cartToast.value.visible = false;
  };

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    // Prevent adding items from a different restaurant
    if (items.value.length > 0) {
      const currentRestaurant = items.value[0].restaurantId;
      if (currentRestaurant !== item.restaurantId) {
        showCartToast(
          "You already have items from another restaurant. Clear your cart to add items from this restaurant.",
        );
        return;
      }
    }
    const existing = items.value.find(
      (entry: CartItem) => entry.id === item.id,
    );

    if (existing) {
      existing.quantity += quantity;
      showCartToast(`${item.name} quantity updated`);
      return;
    }

    items.value.push({ ...item, quantity });
    showCartToast(`${item.name} added to cart`);
  };

  const removeItem = (itemId: string) => {
    items.value = items.value.filter((item: CartItem) => item.id !== itemId);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = items.value.find((entry: CartItem) => entry.id === itemId);
    if (!item) return;
    item.quantity = Math.max(1, quantity);
  };

  const clearCart = () => {
    items.value = [];
  };

  const subtotal = computed(() =>
    items.value.reduce(
      (total: number, item: CartItem) => total + item.price * item.quantity,
      0,
    ),
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    cartToast,
    hideCartToast,
  };
}
