import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 px-4 text-center">
      <p className="font-serif text-6xl font-bold text-cocoa-900">404</p>
      <h1 className="mt-4 text-xl font-semibold text-cocoa-800">Page not found</h1>
      <p className="mt-2 text-sm text-cocoa-500">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-cocoa-800 px-6 py-2.5 text-sm font-medium text-cream-50 hover:bg-cocoa-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
