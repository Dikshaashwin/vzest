"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { createCollection, updateCollection, type CollectionInput } from "@/lib/actions/collections";
import { slugify } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  collection?: { id: string } & CollectionInput;
};

export function CollectionFormModal({ open, onClose, collection }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<CollectionInput>(
    collection ?? { name: "", slug: "", description: "", imageUrl: "", isFeatured: false }
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      if (collection) await updateCollection(collection.id, form);
      else await createCollection(form);
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save collection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={collection ? "Edit Collection" : "Create Collection"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))}
        />
        <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
        <Textarea label="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Input label="Image URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
        <Checkbox label="Featured on homepage" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
        {error && <p className="text-sm text-danger-600">{error}</p>}
      </div>
    </Modal>
  );
}
