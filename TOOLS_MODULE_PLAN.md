# 学员工具台模块开发方案

## 概述
为Stella教育智囊网站新增学员专属工具台，已购课学员可使用课程中的工具模板，
互动记录自动留痕到成长图谱，支持定向分享给Stella老师。

---

## 一、架构概览

```
/tools                    → 工具台首页（显示可用工具 + 我的记录列表）
/tools/orid               → ORID反思模版
/tools/emotion            → 情绪温度计（每日打卡）
/tools/iceberg            → 冰山觉察日记
/tools/action-card        → 知行合一践行卡
/tools/character          → 5C品格自测
/api/auth/verify          → 验证邀请码
/api/tools/save           → 保存工具记录
/api/tools/list           → 获取我的记录
/api/growth/update        → 更新成长图谱数据
```

---

## 二、身份系统（简化版）

### 邀请码
- 预置邀请码列表（可配置）：`STELLA-001`, `STELLA-002`, 等
- 首次使用输入邀请码+昵称 → 绑定到localStorage
- 验证逻辑放在 `/api/auth/verify` API route

### 数据标识
- 每个学员用 `userId` 标识（生成唯一ID）
- 邀请码 + userId 绑定，一个邀请码只能注册一次

---

## 三、数据模型

```typescript
// 工具记录（核心数据模型）
interface ToolRecord {
  id: string;                    // 唯一ID
  userId: string;                // 学员ID
  nickname: string;              // 学员昵称
  toolType: ToolType;            // 工具类型
  title: string;                 // 记录标题
  content: Record<string, any>;  // 工具具体内容
  visibility: Visibility;        // 可见性
  tags: string[];                // 标签
  createdAt: number;             // 创建时间
  updatedAt: number;             // 更新时间
}

type ToolType = 
  | "orid"           // ORID反思
  | "emotion"        // 情绪温度计
  | "iceberg"        // 冰山觉察日记
  | "action-card"    // 知行合一践行卡
  | "character";     // 5C品格自测

type Visibility = 
  | "private"                // 仅自己可见
  | "shared-with-stella";    // 对Stella老师开放

// ORID反思 - content结构
interface OridContent {
  objective: string;    // 客观事实：发生了什么？
  reflective: string;   // 感受反应：我有什么感受？
  interpretive: string; // 意义解读：这意味着什么？
  decisional: string;   // 行动决定：我接下来怎么做？
  linkedCourse?: string; // 关联课程
}

// 情绪温度计 - content结构
interface EmotionContent {
  date: string;           // 记录日期
  score: number;          // 1-10分
  emotion: string;        // 情绪名称（如：平静、焦虑、喜悦）
  trigger?: string;       // 触发事件
  note?: string;          // 备注
}

// 冰山觉察日记 - content结构
interface IcebergContent {
  date: string;
  behavior: string;       // 行为（水面之上）
  coping: string;         // 应对方式
  feelings: string;       // 感受
  beliefs: string;        // 观点/信念
  expectations: string;   // 期待
  yearnings: string;      // 渴望
  insight: string;        // 觉察与反思
}

// 知行合一践行卡 - content结构
interface ActionCardContent {
  date: string;
  knowledge: string;      // 学到什么（知）
  action: string;         // 打算做什么（行）
  status: "todo" | "done" | "failed";  // 完成状态
  reflection?: string;    // 践行的反思
  weeklyGoal?: string;    // 周目标
}

// 5C品格自测 - content结构
interface CharacterContent {
  date: string;
  scores: {
    character: number;    // 品格 1-10
    competence: number;   // 能力 1-10
    caring: number;       // 关怀 1-10
    connection: number;   // 连接 1-10
    confidence: number;   // 信心 1-10
  };
  reflection?: string;    // 自测反思
  growthArea?: string;    // 想提升的方向
}
```

---

## 四、存储方案（第一阶段：localStorage + API）

### 第一阶段：纯客户端
- 所有数据存 localStorage，前缀区分学员
- "分享给Stella" = 在本地标记可见性
- Stella通过"教师视角"查看所有标记为 shared 的记录

### 第二阶段（后续扩展）
- 增加服务端存储（SQLite或JSON文件）
- 实现真正的跨设备同步
- Stella可以在线查看和评论

---

## 五、工具模板内容设计

### 5.1 ORID反思模版

**Objective（客观事实）**
> 请描述今天在课程/生活中，发生了什么具体的事情？
> 以客观的视角，像摄像机一样记录：谁？什么时候？在哪里？发生了什么？

引导问题：
- 今天上课最触动你的一个点是什么？
- 你观察到了什么之前没注意到的现象？
- 孩子/家人做了什么具体的事情？

**Reflective（感受反应）**
> 你对这件事情有什么感受？身体的哪个部位有感觉？

引导问题：
- 当这件事发生时，你的第一反应是什么？
- 你感到开心、困惑、焦虑、还是惊喜？
- 你的身体有什么反应？（心跳加速、肩膀紧张、胸口温暖...）

**Interpretive（意义解读）**
> 这件事情对你意味着什么？它和你之前的认知有什么关联？

引导问题：
- 这件事反映了什么深层的问题或模式？
- 它和你上过的哪节课内容有关系？
- 如果用系统思维/冰山理论来看，这个现象背后的系统结构是什么？

**Decisional（行动决定）**
> 基于以上的反思，你接下来决定怎么做？

引导问题：
- 你打算采取什么具体的行动？（哪怕很小）
- 这个行动打算什么时候开始？
- 你需要什么支持才能完成这个行动？

### 5.2 情绪温度计

**每日记录维度：**
- 今天整体情绪温度（1-10分，1=很糟糕，10=非常棒）
- 主要情绪标签（可选）：平静 / 喜悦 / 焦虑 / 疲惫 / 愤怒 / 悲伤 / 感恩 / 兴奋 / 困惑 / 满足
- 触发事件（选填）：今天发生了什么影响你情绪的事？
- 备注（选填）：想记录的其他感受

**周/月趋势查看：**
- 自动生成情绪变化曲线
- 识别情绪模式（什么情况下容易焦虑/低落）

### 5.3 冰山觉察日记

**引导语：**
> 当我看到孩子的某个行为让我有情绪反应时，用冰山模型来探索自己的内在世界。

**填写层次：**

1. **行为（水面之上）**
   - 孩子做了什么？我做了什么？
   - 请像一个旁观者一样客观描述

2. **应对方式**
   - 我当时是怎么应对的？（指责/讨好/超理智/打岔/一致性）
   - 我习惯性的应对姿态是什么？

3. **感受**
   - 我当时有什么感受？（愤怒、失望、无助、焦虑...）
   - 这个感受在身体的哪个部位？

4. **观点/信念**
   - 我对自己、对孩子、对这件事有什么看法？
   - 这个想法是从哪里来的？
   - 这个信念一定正确吗？

5. **期待**
   - 我期待孩子怎么做？
   - 我期待自己怎么做？
   - 我觉得别人期待我怎么做？

6. **渴望（深层需求）**
   - 在这个情境下，我最需要的是什么？
   - 被理解？被尊重？被爱？安全感？
   - 孩子的深层渴望可能是什么？

7. **觉察与反思**
   - 填完以上各层后，你有什么新的觉察？
   - 如果重新来一次，你会有什么不同？

### 5.4 知行合一践行卡

**每周一张践行卡：**

| 字段 | 说明 |
|------|------|
| 本周学到的核心知识点 | 这节课我学到的最重要的一个理念/工具 |
| 我决定践行的行动 | 这个知识应用到生活中的具体行动是什么？ |
| 行动开始时间 | 打算什么时候开始？ |
| 需要的支持/资源 | 我需要什么才能完成这个行动？ |
| 完成状态 | √ 已完成 / ○ 进行中 / × 未完成 |
| 践行的反思 | 完成后有什么体会？遇到什么困难？ |

### 5.5 5C品格自测

**每项1-10分自评：**

**C1 品格（Character）**
- 我能对自己诚实，承认自己的不足
- 我对家人有责任感，说到做到
- 我的言行一致，不给孩子双重标准

**C2 能力（Competence）**
- 我能运用系统思维分析教育问题
- 我掌握了冰山对话的基本技巧
- 我能把课程理念转化为具体行动

**C3 关怀（Caring）**
- 我能真正倾听孩子的感受而不评判
- 我关心孩子的内心世界胜过外在表现
- 我能在孩子遇到困难时给予温暖支持

**C4 连接（Connection）**
- 我和孩子之间有安全、开放的沟通
- 我和伴侣在教育方向上有一致性
- 我能与同频的家长建立支持网络

**C5 信心（Confidence）**
- 我对自己作为父母的能力有信心
- 面对教育挑战时，我相信能找到解决方案
- 我愿意尝试新方法，即使可能失败

---

## 六、成长图谱融合

改造 `/growth` 页面，使其同时展示：
1. **AI问答记录**（已有）
2. **工具使用记录**（新增）

新增统计维度：
- 工具使用次数
- 各工具使用频率
- 情绪温度变化曲线
- 品格自测变化趋势

---

## 七、开发顺序

1. ✅ 方案文档（无念完成）
2. 工具模板内容写入手册（无念完成）
3. 邀请码身份系统 + 登录页
4. 数据层：工具记录存储函数
5. ORID反思模版页面
6. 情绪温度计页面
7. 冰山觉察日记页面
8. 知行合一践行卡页面
9. 5C品格自测页面
10. 工具台首页（工具列表 + 记录历史）
11. 成长图谱改造（融合工具记录）
12. 分享可见性 + Stella视角
13. 导航改造 + 全站联调
14. 测试与上线

---

*文档版本：v1.0 | 编写：无念师兄 | 2026-05-16*
