// The `discount` field on a product was previously only used to render the
// "-20% SALE" badge -- the actual price charged everywhere (product page,
// cart, checkout, order total) still used the full `product.price`, so a
// customer never actually paid less despite the badge. This helper is now
// the single source of truth for "what does this product actually cost",
// used both for on-screen price display and for whatever price gets added
// to the cart.
export function getDiscountedPrice(price: number, discount?: number | null): number {
  if (!discount || discount <= 0) return price;
  const discounted = price * (1 - discount / 100);
  return Math.round(discounted * 100) / 100;
}
