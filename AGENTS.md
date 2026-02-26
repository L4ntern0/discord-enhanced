# AGENTS.md - Discord Enhanced Plugin

## 项目概述

这是一个 OpenClaw 插件，用于增强 Discord 功能，特别是子区（Thread）管理能力。

## 技术栈

- TypeScript
- OpenClaw Plugin SDK
- Discord API v10

## 目录结构

```
discord-enhanced/
├── index.ts              # 插件入口
├── package.json          # 包配置
├── openclaw.plugin.json  # 插件 manifest
├── README.md             # 使用文档
└── src/
    └── thread-tools.ts   # Thread 管理工具实现
```

## 核心功能

1. **归档 Thread** - `discord_archive_thread`
2. **锁定 Thread** - `discord_lock_thread`
3. **解锁 Thread** - `discord_unlock_thread`
4. **删除 Thread** - `discord_delete_thread`
5. **取消归档 Thread** - `discord_unarchive_thread`
6. **列出 Threads** - `discord_list_threads`

## 开发规范

- 所有工具必须使用 zod 进行参数验证
- 工具返回格式统一为 `{ success: boolean, ...data }`
- 错误处理要友好，返回中文错误信息
- 支持多账户配置

## API 文档参考

- Discord API: https://discord.com/developers/docs/resources/channel
- OpenClaw Plugin SDK: 参考 openclaw/plugin-sdk 类型定义
