import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@jianji/ui"],
  async redirects() {
    return [
      {
        source: "/map",
        destination: "/growth",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
