"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle, Sparkles } from "lucide-react";

const navLinks = [
  { href: "/courses", label: "课程学习" },
  { href: "/tools", label: "学员工具台" },
  { href: "/growth", label: "成长图谱" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  // 公安备案期间隐藏 AI 对话入口（构建时 NEXT_PUBLIC_HIDE_AI=true）
  const HIDE_AI = process.env.NEXT_PUBLIC_HIDE_AI === "true";

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-[#faf8f5]/80 backdrop-blur-md border-b border-[#e8e4df]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#c4753f] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-[#2d2a26]">Stella教育智囊</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                isActive(link.href)
                  ? "text-[#c4753f] font-medium"
                  : "text-[#5a7a6a] hover:text-[#2d2a26]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {!HIDE_AI && (
          <Link
            href="/chat"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#c4753f] text-white text-sm hover:bg-[#a86235] transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            开始咨询
          </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-[#5a7a6a] hover:text-[#2d2a26] transition-colors"
          aria-label={mobileOpen ? "关闭菜单" : "打开菜单"}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e8e4df] bg-[#faf8f5]">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm transition-colors ${
                  isActive(link.href)
                    ? "bg-[#f5e6d8] text-[#c4753f] font-medium"
                    : "text-[#5a7a6a] hover:bg-[#f0ece7]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!HIDE_AI && (
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-full bg-[#c4753f] text-white text-sm hover:bg-[#a86235] transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              开始咨询
            </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
