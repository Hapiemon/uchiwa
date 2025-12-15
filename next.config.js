/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
