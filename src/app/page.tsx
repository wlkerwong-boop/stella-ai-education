"use client";

/**
 * Stella 教育智囊 首页 · 海报级重设计（K3 定稿版）
 * ---------------------------------------------------------------
 * 集成说明（给 Codex）：
 * 1. 将 homepage.css 复制到项目并在本文件 import（样式类名与 SoulCode 完全共用，
 *    仅 body[data-site="stella"] 主题变量不同）
 * 2. 将 assets/stella-hero.png 复制到 public/assets/homepage/
 * 3. body 需带 data-site="stella"
 * 4. 零外部组件依赖：纯 CSS + 内联 SVG
 * 5. 链接 href 为占位，替换为真实路由；文案保留现有版本可自由替换
 */

import { useEffect } from "react";
import "./homepage.css";

export default function HomePage() {
  useEffect(() => {
    document.body.setAttribute("data-site", "stella");
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <>
      <nav className="nav" id="nav">
        <a className="nav-logo" href="/">Stella<em> 教育智囊</em></a>
        <div className="nav-links">
          <a href="#services">服务</a>
          <a href="#about">关于</a>
          <a className="nav-cta" href="#services">开始咨询</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-bg" style={{ backgroundImage: "url('/assets/homepage/stella-hero.png')" }} />
        <div className="hero-veil" />
        <div className="hero-content">
          <p className="hero-kicker">STELLA · 教育智囊</p>
          <h1 className="hero-title">让成长有方向</h1>
          <p className="hero-sub">AI 与温度并存的教育陪伴</p>
          <a className="hero-cta" href="#services">开启对话</a>
        </div>
        <div className="hero-scroll">向下探索</div>
      </header>

      {/* 核心服务 */}
      <section className="section" id="services">
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">核心服务</p>
            <h2 className="section-title">三种方式，陪孩子走得更远</h2>
          </div>
          <div className="cards">
            <a className="card reveal" href="/chat">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12a8 8 0 0 1-8 8c-1.2 0-2.4-.3-3.4-.7L4 20l.9-3.2A8 8 0 1 1 21 12z" /><path d="M9 11h.01M12.5 11h.01M16 11h.01" /></svg>
              </div>
              <div className="card-body" style={{ textAlign: "center" }}>
                <h3 className="card-title">AI 教育问答</h3>
                <p className="card-text">教育困惑随时问，专业与耐心都在线。</p>
                <span className="card-link">了解更多 <span>→</span></span>
              </div>
            </a>
            <a className="card reveal" href="/growth">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
              </div>
              <div className="card-body" style={{ textAlign: "center" }}>
                <h3 className="card-title">思维进化图景</h3>
                <p className="card-text">看见孩子思维成长的每一步轨迹。</p>
                <span className="card-link">了解更多 <span>→</span></span>
              </div>
            </a>
            <a className="card reveal" href="/courses">
              <div className="card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M21 21v-2a4 4 0 0 0-3-3.9" /></svg>
              </div>
              <div className="card-body" style={{ textAlign: "center" }}>
                <h3 className="card-title">课程与社群</h3>
                <p className="card-text">和同频的家长一起，慢慢变成更好的父母。</p>
                <span className="card-link">了解更多 <span>→</span></span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* 关于 */}
      <section className="section" id="about" style={{ background: "var(--bg-soft)" }}>
        <div className="section-inner">
          <div className="section-head reveal">
            <p className="section-kicker">关于</p>
            <h2 className="section-title">温暖的同行者</h2>
          </div>
          <div className="about reveal">
            <div className="about-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" /></svg>
            </div>
            <div>
              <h3 className="about-name">Stella 老师</h3>
              <p className="about-role">教育咨询 · 亲子成长陪伴</p>
              <p className="about-text">教育不是注满一桶水，而是点燃一把火。</p>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <p className="footer-logo">Stella<em> 教育智囊</em></p>
            <p className="footer-slogan">以生命教育为灯，让每一次成长都被看见。</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h4>服务</h4>
              <a href="#services">AI 教育问答</a>
              <a href="#services">思维进化图景</a>
              <a href="#services">课程与社群</a>
            </div>
            <div className="footer-col">
              <h4>关于</h4>
              <a href="#about">Stella 老师</a>
              <a href="#">联系我们</a>
            </div>
          </div>
          <div className="footer-social">
            <a className="social-btn" href="#" aria-label="微信">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.7 4C4.9 4 2 6.6 2 9.8c0 1.8 1 3.4 2.5 4.5l-.6 2 2.2-1.1c.6.2 1.3.3 2 .3h.4A6 6 0 0 1 8 13.6C8 10.4 11 8 14.6 8h.4C14.4 5.7 11.8 4 8.7 4zm-2 3.2a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm4.5 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zM22 13.6c0-2.7-2.4-4.9-5.4-4.9s-5.4 2.2-5.4 4.9 2.4 4.9 5.4 4.9c.6 0 1.1-.1 1.7-.2l1.8.9-.5-1.7c.9-.8 1.4-1.9 1.4-3.9zm-7.3-1.6a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5zm3.7 0a.8.8 0 1 1 0 1.5.8.8 0 0 1 0-1.5z" /></svg>
            </a>
            <a className="social-btn" href="#" aria-label="小红书">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><path d="M8 9v6M8 12h4M12 9v6M16 9l-2.5 3L16 15" /></svg>
            </a>
            <a className="social-btn" href="#" aria-label="SoulCode">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 3l2.1 5.8L20 11l-5.9 2.2L12 19l-2.1-5.8L4 11l5.9-2.2z" /></svg>
            </a>
          </div>
        </div>
        <p className="footer-copy">© 2026 Stella 教育智囊 · 以生命教育为灯</p>
      </footer>
    </>
  );
}
