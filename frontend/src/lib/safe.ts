/**
 * Wraps a data call so storefront pages render (with an empty fallback) instead of
 * crashing the whole page when the database isn't configured yet — e.g. before
 * DATABASE_URL is set and migrations have run.
 */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[data fetch failed]", error);
    return fallback;
  }
}
