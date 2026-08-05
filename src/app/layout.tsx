import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StellaAuthProvider } from "@/components/StellaAuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title:
    process.env.NEXT_PUBLIC_HIDE_AI === "true"
      ? "Stella教育智囊 - 家庭教育伙伴"
      : "Stella教育智囊 - AI时代的家庭教育伙伴",
  description:
    "基于Stella老师20多年教育经验，为家长提供系统化的教育问答、成长图谱和在线学习平台",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
  appleWebApp: {
    capable: true,
    title: "Stella教育智囊",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {/* PWA: register service worker */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", () => {
                  navigator.serviceWorker.register("/sw.js");
                });
              }
            `,
          }}
        />
        <StellaAuthProvider>
          {children}
          {/* ── R5: 三站通路 → soulcode 入口 ── */}
          <div style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#888' }}>
            <a href="https://aisoulcode.cn" target="_blank" rel="noopener noreferrer"
               style={{ color: '#5a7a6a', textDecoration: 'none', marginRight: '16px' }}>
              🔮 灵魂解码 — 七系统AI融合报告
            </a>
            <span style={{ color: '#ccc' }}>|</span>
            <span style={{ marginLeft: '16px', color: '#aaa' }}>见己学园 · 即将上线</span>
          </div>
          <footer style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#888' }}>
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"
               style={{ color: '#888', textDecoration: 'none' }}>
              粤ICP备2026087672号-1
            </a>
          </footer>
        </StellaAuthProvider>
      </body>
    </html>
  );
}
