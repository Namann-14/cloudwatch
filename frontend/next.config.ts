import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    dirs: ['app', 'components'],
  },
};

export default nextConfig;
