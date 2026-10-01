import { listHomepageSections } from "@/lib/actions/homepage";
import { safe } from "@/lib/safe";
import { HomepageSectionRow } from "@/components/admin/HomepageSectionRow";

export const metadata = { title: "Homepage" };

export default async function AdminHomepagePage() {
  const sections = await safe(() => listHomepageSections(), []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Visual Homepage Builder</h1>
      <p className="mt-1 text-sm text-cocoa-500">Toggle and reorder active sections displaying on the main buyer storefront.</p>

      <div className="mt-6 space-y-3">
        {sections.map((section, i) => (
          <HomepageSectionRow key={section.id} section={section} isFirst={i === 0} isLast={i === sections.length - 1} />
        ))}
      </div>
    </div>
  );
}
