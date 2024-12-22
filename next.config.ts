import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This ensures the URLs have trailing slashes, which GitHub Pages requires
  trailingSlash: true,

  // Enable static export
  // This tells Next.js that you want to export your site as static HTML
  output: 'export', 

  // Additional custom configurations (optional)
};

export default nextConfig;
