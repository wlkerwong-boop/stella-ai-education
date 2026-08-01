import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@jianji/ui/styles/theme.css";
import "./globals.css";
import { Navbar, Footer } from "@/components/ui-client";
import { Sparkles } from "lucide-react";

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
  title: "Stella教育智囊 - AI时代的家庭教育伙伴",
  description: "基于Stella老师20多年教育经验，为家长提供系统化的教育问答、成长图谱和在线学习平台",
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
    <html lang="zh-CN" data-theme="stella">
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

        <Navbar
          className="stella-global-nav"
          logo={
            <span className="flex items-center gap-2 no-underline">
              <div className="w-7 h-7 rounded-md bg-[var(--color-accent)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[var(--color-text)]">Stella教育智囊</span>
            </span>
          }
          links={[
            { label: "课程学习", href: "/courses" },
            { label: "学员工具台", href: "/tools" },
            { label: "成长图谱", href: "/growth" },
          ]}
          cta={{ label: "开始咨询", href: "/chat" }}
        />

        <main className="min-h-screen">{children}</main>

        <Footer
          className="stella-global-footer"
          brand="Stella教育智囊"
          description="基于Stella老师20年教育经验，融合系统思维、冰山理论、品格教育，为家长提供AI驱动的家庭教育支持。"
          columns={[
            {
              title: "服务导航",
              links: [
                { label: "AI教育问答", href: "/chat" },
                { label: "成长图谱", href: "/growth" },
                { label: "课程学习", href: "/courses" },
              ],
            },
            {
              title: "学员工具",
              links: [
                { label: "学员工具台", href: "/tools" },
                { label: "冰山分析", href: "/tools/iceberg" },
                { label: "情绪觉察", href: "/tools/emotion" },
              ],
            },
          ]}
          copyright="© {year} Stella教育智囊 · FGAOS V4.0 · AI时代的家庭教育伙伴"
        />

        {/* ── R5: 三站通路 → soulcode 入口 ── */}
        <div className="stella-global-rail" style={{ textAlign: 'center', padding: '8px', fontSize: '12px', color: '#888' }}>
          <a href="https://aisoulcode.cn" target="_blank" rel="noopener noreferrer"
             style={{ color: '#5a7a6a', textDecoration: 'none', marginRight: '16px' }}>
            🔮 灵魂解码 — 七系统AI融合报告
          </a>
          <span style={{ color: '#ccc' }}>|</span>
          <span style={{ marginLeft: '16px', color: '#aaa' }}>见己学园 · 即将上线</span>
        </div>
        <footer className="stella-global-rail" style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#888' }}>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"
             style={{ color: '#888', textDecoration: 'none' }}>
            粤ICP备2026087672号-1
          </a>
        </footer>
      </body>
    </html>
  );
}
