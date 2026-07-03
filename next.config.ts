import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
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
