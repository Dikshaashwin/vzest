import { listLeads } from "@/lib/actions/leads";
import { safe } from "@/lib/safe";
import { formatDate } from "@/lib/format";
import { LeadRowAction } from "@/components/admin/LeadRowAction";

export const metadata = { title: "Leads" };

export default async function AdminLeadsPage() {
  const leads = await safe(() => listLeads(), []);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-cocoa-900">Leads</h1>
      <p className="mt-1 text-sm text-cocoa-500">Contact form and corporate gifting enquiries.</p>

      <div className="mt-6 space-y-3">
        {leads.length === 0 && (
          <p className="rounded-2xl border border-dashed border-cocoa-200 py-10 text-center text-sm text-cocoa-400">
            No enquiries yet.
          </p>
        )}
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-2xl border border-cocoa-100 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded-full bg-cocoa-50 px-2.5 py-1 text-xs font-medium text-cocoa-700">
                  {lead.type === "CORPORATE_GIFTING" ? "Corporate Gifting" : "Contact"}
                </span>
                <p className="mt-2 font-medium text-cocoa-800">{lead.name}</p>
                <p className="text-sm text-cocoa-500">
                  {lead.email} {lead.phone && `· ${lead.phone}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-cocoa-400">{formatDate(lead.createdAt)}</p>
                <div className="mt-2">
                  <LeadRowAction leadId={lead.id} isHandled={lead.isHandled} />
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-cocoa-600">{lead.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
