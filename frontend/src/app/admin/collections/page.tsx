import { listCollectionsForAdmin } from "@/lib/actions/collections";
import { safe } from "@/lib/safe";
import { CollectionsGrid } from "@/components/admin/CollectionsGrid";

export const metadata = { title: "Collections" };

export default async function AdminCollectionsPage() {
  const collections = await safe(() => listCollectionsForAdmin(), []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Atelier Collections</h1>
      <p className="mt-1 text-sm text-cocoa-500">Arrange, publish, and edit custom assortments of hand-tempered dark blocks and luxury truffles.</p>

      <div className="mt-6">
        <CollectionsGrid collections={collections} />
      </div>
    </div>
  );
}
