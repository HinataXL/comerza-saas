import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar acceso de desarrollo a través de túneles
  allowedDevOrigins: [
    "*.ngrok-free.app", 
    "*.ngrok-free.dev", 
    "*.loca.lt"
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy to Backend API
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*', // Proxy to Backend static files
      }
    ];
  },
};

export default nextConfig;
