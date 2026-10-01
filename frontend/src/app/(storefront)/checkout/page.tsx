import { apiServer, ApiRequestError } from "@/lib/api/server";
import type { Me } from "@/lib/api/types";
import { getMyAddresses } from "@/lib/actions/addresses";
import { safe } from "@/lib/safe";
import { CheckoutFlow } from "@/components/storefront/CheckoutFlow";

export const metadata = { title: "Checkout" };

async function getMe(): Promise<Me | null> {
  try {
    return await apiServer.get<Me>("/me");
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 401) return null;
    throw err;
  }
}

export default async function CheckoutPage() {
  const [me, addresses] = await Promise.all([getMe(), safe(() => getMyAddresses(), [])]);

  return <CheckoutFlow savedAddresses={addresses} defaultContact={{ name: me?.name, email: me?.email }} />;
}
