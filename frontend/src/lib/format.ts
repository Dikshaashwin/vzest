type NumberLike = number | string | { toString(): string };

export function formatINR(amount: NumberLike): string {
  const value = typeof amount === "number" ? amount : Number(amount.toString());
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function generateOrderNumber(): string {
  const rand = Math.floor(10000 + Math.random() * 89999);
  return `ZEST-${rand}`;
}
