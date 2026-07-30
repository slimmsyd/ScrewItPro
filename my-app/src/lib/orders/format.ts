export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function itemCountLabel(count: number): string {
  return `${count} item${count === 1 ? "" : "s"}`;
}
