"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CollectionFormModal } from "@/components/admin/CollectionFormModal";
import { deleteCollection } from "@/lib/actions/collections";

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  _count: { products: number };
};

export function CollectionsGrid({ collections }: { collections: CollectionRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CollectionRow | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={14} /> Create Collection
        </Button>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <div key={c.id} className="rounded-2xl border border-cocoa-100 bg-white p-4">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-cocoa-50">
              {c.imageUrl ? (
                <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
              ) : (
                <span className="text-xs text-cocoa-300">No image</span>
              )}
              <span className="absolute right-2 top-2">
                <StatusBadge tone={c.isFeatured ? "success" : "neutral"}>{c.isFeatured ? "Featured" : "Draft"}</StatusBadge>
              </span>
            </div>
            <p className="mt-3 font-serif text-lg font-semibold text-cocoa-900">{c.name}</p>
            <p className="text-xs text-cocoa-400">{c._count.products} Chocolates</p>
            <div className="mt-3 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setEditing(c);
                  setModalOpen(true);
                }}
                className="font-semibold uppercase tracking-wider text-cocoa-700 underline"
              >
                Edit Collection
              </button>
              <div className="flex items-center gap-3">
                <button
                  disabled={isPending}
                  onClick={() => {
                    if (confirm(`Delete "${c.name}"?`)) startTransition(() => deleteCollection(c.id));
                  }}
                  className="text-danger-600 hover:underline disabled:opacity-50"
                >
                  Delete
                </button>
                <Settings size={14} className="text-cocoa-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <CollectionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        collection={editing ? { ...editing, description: editing.description ?? "", imageUrl: editing.imageUrl ?? "" } : undefined}
      />
    </div>
  );
}
