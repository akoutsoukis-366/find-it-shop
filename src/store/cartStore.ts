import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  colors: string[];
  inStock: boolean;
  featured?: boolean;
  rating: number;
  reviews: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, color: string) => void;
  removeItem: (productId: string, color: string) => void;
  updateQuantity: (productId: string, color: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, color) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id && item.selectedColor === color
          );
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id && item.selectedColor === color
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1, selectedColor: color }] };
        });
      },
      removeItem: (productId, color) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product.id === productId && item.selectedColor === color)
          ),
        }));
      },
      updateQuantity: (productId, color, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.selectedColor === color
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter((item) => item.quantity > 0),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      getTotalPrice: () =>
        get().items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    }),
    {
      name: 'itag-cart',
    }
  )
);
