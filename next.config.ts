import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  httpAgentOptions: {
    keepAlive: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('socket.io');
    }
    return config;
  },
};

export default nextConfig;
