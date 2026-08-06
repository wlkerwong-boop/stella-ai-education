import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async redirects() {
    const redirects: { source: string; destination: string; permanent: boolean }[] = [
      {
        source: "/map",
        destination: "/growth",
        permanent: true,
      },
    ];
    // 公安备案期间隐藏 AI 对话入口（构建时 NEXT_PUBLIC_HIDE_AI=true）
    if (process.env.NEXT_PUBLIC_HIDE_AI === "true") {
      redirects.push({
        source: "/chat",
        destination: "/",
        permanent: false,
      });
    }
    return redirects;
  },
};

export default nextConfig;
