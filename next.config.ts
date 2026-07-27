import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow hot module replacement (HMR) when testing on local network devices
  allowedDevOrigins: ['10.10.80.155'],
};

export default nextConfig;
