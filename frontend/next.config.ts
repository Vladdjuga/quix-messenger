import type { NextConfig } from "next";

const NEXT_PUBLIC_AVATAR_HOST_PORT = process.env.NEXT_PUBLIC_AVATAR_HOST_PORT || '';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'http',      // http or https
                hostname: 'localhost', // Local for development
                port: NEXT_PUBLIC_AVATAR_HOST_PORT,
                pathname: '/uploads/**', // Adjust based on your upload path
            },
        ],
    },
};

export default nextConfig;
