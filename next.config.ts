import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    POSTHOG_HOST: process.env.POSTHOG_HOST,
    POSTHOG_KEY: process.env.POSTHOG_KEY,
  },
};

export default nextConfig;
