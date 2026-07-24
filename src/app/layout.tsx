import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        {children}
        <footer style={{ textAlign: 'center', padding: '16px', fontSize: '12px', color: '#888' }}>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer"
             style={{ color: '#888', textDecoration: 'none' }}>
            粤ICP备2026087672号-1
          </a>
        </footer>
      </body>
    </html>
  );
}
