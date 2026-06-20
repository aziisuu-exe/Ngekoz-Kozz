import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "unprecipitative-percussively-micah.ngrok-free.dev"
  ],
  
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', 
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co", 
      },
    ],
  },
};

export default nextConfig;