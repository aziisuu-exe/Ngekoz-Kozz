import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan blok images ini
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**', // Mengizinkan semua path gambar dari domain ini
      },
      {
        protocol: 'https',
        hostname: 'hztohcxqpernwbncaxiu.supabase.co', // Ganti dengan domain Supabase-mu yang asli
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;