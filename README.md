# 🏪 mcp-hunt

[![Live Demo](https://img.shields.io/badge/Live%20Demo-zybit.top-6366f1?style=flat-square)](https://zybit.top/mcp-hunt/)

> AI Agent 的 MCP 服务器发现平台 — Discover, browse and install MCP Servers

发现和浏览 **MCP 服务器** —— 通过 Model Context Protocol 让 AI Agent 拥有超能力的工具。

---

## 🌐 在线地址 / Live Demo

🔗 **[zybit.top/mcp-hunt](https://zybit.top/mcp-hunt/)**

---

## 📊 当前数据 / Current Stats

| 指标 | 数值 |
|------|------|
| MCP 服务器数量 | **858** |
| GitHub 总星标 | **4,600,118 ⭐** |
| 最热门语言 | **Python** (275 个) |
| 第二名 | **TypeScript** (262 个) |
| 第三名 | **Go** (75 个) |

## 📁 项目结构

```
├── data/
│   └── servers.json      # MCP 服务器数据
├── scripts/
│   ├── export-data.mjs   # 数据导出脚本 (GitHub API)
│   └── fetch-data.py     # 数据抓取脚本 (备用)
├── next.config.ts        # Next.js 配置
└── package.json
```

## 🔄 数据更新

```bash
# 从 GitHub 重新抓取 MCP 服务器数据
python3 scripts/fetch-data.py
```

## 📝 许可证

MIT
