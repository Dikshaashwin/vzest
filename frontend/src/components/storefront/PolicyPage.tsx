export function PolicyPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-cocoa-900">{title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-cocoa-600 [&_h2]:mt-6 [&_h2]:font-serif [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-cocoa-900 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
        {children}
      </div>
    </div>
  );
}
