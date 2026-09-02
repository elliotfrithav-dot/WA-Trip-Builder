export type CartKind = 'campsite' | 'activity'

export interface CartItem {
  kind: CartKind
  id: string
}

const KEY = 'wa-adventure.custom-trip-cart.v1'

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function save(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function isInCart(kind: CartKind, id: string): boolean {
  return getCart().some((i) => i.kind === kind && i.id === id)
}

export function addToCart(kind: CartKind, id: string): CartItem[] {
  const cart = getCart()
  if (cart.some((i) => i.kind === kind && i.id === id)) return cart
  const next = [...cart, { kind, id }]
  save(next)
  return next
}

export function removeFromCart(kind: CartKind, id: string): CartItem[] {
  const next = getCart().filter((i) => !(i.kind === kind && i.id === id))
  save(next)
  return next
}

export function toggleCart(kind: CartKind, id: string): CartItem[] {
  return isInCart(kind, id) ? removeFromCart(kind, id) : addToCart(kind, id)
}

export function clearCart(): void {
  save([])
}
