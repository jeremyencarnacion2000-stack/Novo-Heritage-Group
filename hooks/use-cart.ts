import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: "insurance" | "property" | "travel"
  image?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        if (!newItem || !newItem.id || !newItem.name || typeof newItem.price !== 'number') {
          console.error('Invalid item provided to addItem:', newItem)
          return
        }
        
        const existingItem = get().items.find((item) => item.id === newItem.id)
        if (existingItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          }))
        } else {
          set((state) => ({ items: [...state.items, { ...newItem, quantity: 1 }] }))
        }
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        }))
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'shopping-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
