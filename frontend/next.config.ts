import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // TODO: narrow this to your actual image host(s) — Supabase Storage / Cloudinary — before going to production.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
