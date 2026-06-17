# 🏪 mcp-hunt

> ## 🚀 在线体验
>
> **👉 [http://zybit.top/mcp-hunt/](http://zybit.top/mcp-hunt/)**
>
> MCP 服务器发现平台，浏览器打开即用！

<p align="center">
  <img src="docs/screenshot-home.png" width="700" alt="mcp-hunt 主页界面">
  <br>
  <em>浏览、搜索、发现 MCP 服务器</em>
</p>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-zybit.top-6366f1?style=flat-square)](http://zybit.top/mcp-hunt/)

> AI Agent 的 MCP 服务器发现平台 — Discover, browse and install MCP Servers

发现和浏览 **MCP 服务器** —— 通过 Model Context Protocol 让 AI Agent 拥有超能力的工具。

---

## 📊 当前数据 / Current Stats

| 指标 | 数值 |
|------|------|
| MCP 服务器数量 | **1,045** |
| GitHub 总星标 | **4,579,092 ⭐** |
| 最热门语言 | **Python** (269 个) |
| 第二名 | **TypeScript** (256 个) |
| 第三名 | **Go** (80 个) |

## 📁 项目结构

```
src/
├── app/
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页（搜索 + 服务器列表）
│   ├── globals.css        # 全局样式 + Tailwind
│   ├── submit/
│   │   └── page.tsx       # 提交新服务器页面
│   └── api/
│       ├── servers/
│       │   └── route.ts   # 服务器搜索 API
│       └── stats/
│           └── route.ts   # 统计数据 API
data/
├── servers.json           # MCP 服务器数据
scripts/
├── fetch-data.py          # 数据抓取脚本 (Python)
├── fetch.sh               # 数据抓取脚本 (Shell)
└── export-data.mjs        # 数据导出脚本 (Node.js)
next.config.ts
package.json
tsconfig.json
```

## 🔄 数据更新

```bash
# 从 GitHub 重新抓取 MCP 服务器数据
python3 scripts/fetch-data.py
```

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产启动
npm start
```

## 📝 许可证

MIT
