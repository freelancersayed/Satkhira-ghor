import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAddedItem: null,
      showToast: false,

      // Drawer visibility
      openCart: () => set({ isOpen: true, showToast: false }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen, showToast: false })),

      // Toast visibility
      hideToast: () => set({ showToast: false }),

      // Add item to cart
      // autoOpen defaults to false so the user can continue shopping without unwanted popups
      addItem: (product, quantity = 1, autoOpen = false) => {
        if (!product) return;
        const targetId = String(product.id || product._id || product.slug);

        // Prevent adding out-of-stock item
        if (product.stock !== undefined && Number(product.stock) <= 0) {
          return;
        }

        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => String(item.id) === targetId
          );

          let updatedItems;
          if (existingItemIndex > -1) {
            updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
          } else {
            const newItem = {
              id: targetId,
              name: product.name,
              nameEn: product.nameEn,
              slug: product.slug,
              price: Number(product.price) || 0,
              originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
              image: product.image,
              unit: product.unit,
              quantity: quantity,
              stock: product.stock,
            };
            updatedItems = [...state.items, newItem];
          }

          return {
            items: updatedItems,
            isOpen: autoOpen ? true : state.isOpen,
            lastAddedItem: {
              id: targetId,
              name: product.name,
              nameEn: product.nameEn,
              price: Number(product.price) || 0,
              image: product.image,
              unit: product.unit,
              quantity,
              timestamp: Date.now(),
            },
            showToast: true,
          };
        });
      },

      // Remove item
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        }));
      },

      // Update quantity
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      // Clear all items
      clearCart: () => set({ items: [] }),

      // Computed selectors
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'satkhira-ghor-cart-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
