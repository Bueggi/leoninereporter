/** @type {import('next').NextConfig} */
const nextConfig = {
  // …
  experimental: {
    // …
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    
  },
  typescript: {
    ignoreBuildErrors: true,
 },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
