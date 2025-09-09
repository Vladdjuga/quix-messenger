import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Environment variables for Docker networking
  env: {
    USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://user-service:7000',
    MESSAGE_SERVICE_URL: process.env.MESSAGE_SERVICE_URL || 'http://message-service:7000',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8081',
  },
};

export default nextConfig;
