import { notFound } from "next/navigation";
import { getPolicy, POLICIES } from "@/lib/policies";

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: getPolicy(slug)?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-cocoa-900">{policy.title}</h1>
      <p className="mt-1 text-xs text-cocoa-400">Last Updated: {policy.updatedAt}</p>

      <div className="mt-8 space-y-6">
        {policy.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-serif text-lg font-semibold text-cocoa-900">{section.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-cocoa-600">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
