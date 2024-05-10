/** @type {import('next').NextConfig} */
const nextConfig = {
  // …
  experimental: {
    // …
    serverComponentsExternalPackages: ["@react-pdf/renderer"],
    missingSuspenseWithCSRBailout: false,
    
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
