import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This ensures the URLs have trailing slashes, which GitHub Pages requires
  trailingSlash: true,
  output: 'export',
  basePath: '/messaging-board',
  assetPrefix: '/messaging-board',
  // Enable static export
  // This tells Next.js that you want to export your site as static HTML 

  // Additional custom configurations (optional)
};

export default nextConfig;
