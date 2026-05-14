# Stella教育智囊 - AI时代的家庭教育伙伴

基于Stella老师20多年教育经验，为家长提供系统化的教育问答、成长图谱和在线学习平台。

## 功能特性

### 1. AI教育问答（已完成）
- 基于Stella老师的教育理念和系统思维框架
- 内置知识库：系统思维、冰山理论、金字塔原理、5C品格教育等
- RAG检索增强：自动匹配相关知识库内容
- 温暖专业的对话风格

### 2. 课程展示（已完成）
- 六大核心模块展示
- 课程详情、学习周期、核心话题
- 报名入口

### 3. 思维进化图景（开发中）
- 记录用户问答历史
- 生成个人成长轨迹
- 阶段性成长报告

## 技术栈

- **前端**: Next.js 16 + React + TypeScript + Tailwind CSS
- **AI**: Claude API (Anthropic)
- **动画**: Framer Motion
- **图标**: Lucide React

## 部署方式

### 方式一：Vercel部署（推荐）

1. 将代码推送到GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 设置环境变量：`ANTHROPIC_API_KEY`
4. 一键部署

### 方式二：本地运行

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 ANTHROPIC_API_KEY

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器访问 http://localhost:3000
```

### 方式三：生产环境运行

```bash
npm run build
npm start
```

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Anthropic API密钥，用于AI问答 | 是 |

获取API密钥：[Anthropic Console](https://console.anthropic.com/)

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI问答API
│   ├── chat/              # 问答页面
│   ├── courses/           # 课程展示页面
│   ├── page.tsx           # 首页
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── lib/
│   ├── knowledge-base.ts  # 知识库
│   └── prompts.ts         # System Prompt
└── components/            # 可复用组件
```

## 知识库内容

目前包含以下模块的知识：
- 系统思维（核心概念、六要素、五步法、负面反馈回路）
- 冰山理论（萨提亚冰山模型、对话清单）
- 金字塔原理（知行积三层结构）
- 长期主义与知行合一
- 5C品格教育
- AI时代家庭教育
- 家庭教育子系统
- 常见问题（青春期沟通、厌学、多子女教育）

## 后续开发计划

- [ ] 用户成长图谱可视化
- [ ] 用户登录/注册系统
- [ ] 问答历史记录
- [ ] 录播/直播课程功能
- [ ] 线下咨询预约系统
- [ ] 小程序版本
- [ ] 多语言支持

## 关于Stella老师

剑桥教育系统督导老师，20多年一线教学和管理经验。深耕品格教育和系统思维在家庭教育中的应用，专注于帮助家长建立长期主义的教育视角。

核心理念：
- 教育不是灌输，而是唤醒
- 家庭教育是一个复杂的自适应系统
- 父母的自我修行是教育成功的前提
- 培养完整的人，而不只是学业成绩

---

**注意**：本项目为MVP版本，持续迭代中。
