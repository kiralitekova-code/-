/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    reactCompiler: true,
  },
  webpack: (config, { isServer }) => {
    config.externals.push('colyseus/lib/serializer/encoding/encode.ts');
    return config;
  },
};

module.exports = nextConfig;
