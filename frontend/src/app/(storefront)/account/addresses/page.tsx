import { getMyAddresses } from "@/lib/actions/addresses";
import { AddressList } from "@/components/storefront/AddressList";

export const metadata = { title: "Saved Addresses" };

export default async function SavedAddressesPage() {
  const addresses = await getMyAddresses();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Saved Addresses</h1>
      <p className="mt-1 text-sm text-cocoa-500">Manage your billing and delivery locations for seamless Atelier ordering.</p>

      <div className="mt-6">
        <AddressList addresses={addresses} />
      </div>
    </div>
  );
}
