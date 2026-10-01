import { auth } from "@/auth";
import { getMyAddresses } from "@/lib/actions/addresses";
import { safe } from "@/lib/safe";
import { CheckoutFlow } from "@/components/storefront/CheckoutFlow";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const [session, addresses] = await Promise.all([auth(), safe(() => getMyAddresses(), [])]);

  return (
    <CheckoutFlow
      savedAddresses={addresses}
      defaultContact={{ name: session?.user?.name, email: session?.user?.email }}
    />
  );
}
