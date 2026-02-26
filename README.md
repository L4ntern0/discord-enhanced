# Discord Enhanced Plugin

An OpenClaw plugin that adds enhanced Discord thread management tools.

## Overview

`discord-enhanced` provides practical moderation operations for Discord Threads, including archive, lock, unlock, delete, reopen, and listing thread information.

## Features

- **Archive/Close Thread** - Move a thread out of active thread lists
- **Lock Thread** - Prevent regular members from posting new messages
- **Unlock Thread** - Allow regular members to post again
- **Delete Thread** - Permanently delete a thread
- **Unarchive/Reopen Thread** - Restore an archived thread
- **List Threads** - Retrieve thread lists from a channel or guild

## Installation

1. Copy this plugin directory into OpenClaw extensions:

```bash
cp -r discord-enhanced ~/.openclaw/extensions/
```

Or link it directly with OpenClaw:

```bash
openclaw extensions link
```

2. Restart the OpenClaw Gateway:

```bash
openclaw gateway restart
```

## Usage

After registration, the plugin automatically exposes the following tools.

### Archive / Close a Thread

```json
{
  "tool": "discord_archive_thread",
  "params": {
    "channelId": "1234567890123456789",
    "locked": true
  }
}
```

### Lock a Thread

```json
{
  "tool": "discord_lock_thread",
  "params": {
    "channelId": "1234567890123456789"
  }
}
```

### Unlock a Thread

```json
{
  "tool": "discord_unlock_thread",
  "params": {
    "channelId": "1234567890123456789"
  }
}
```

### Delete a Thread

```json
{
  "tool": "discord_delete_thread",
  "params": {
    "channelId": "1234567890123456789",
    "confirm": true
  }
}
```

### Unarchive / Reopen a Thread

```json
{
  "tool": "discord_unarchive_thread",
  "params": {
    "channelId": "1234567890123456789"
  }
}
```

### List Threads

```json
{
  "tool": "discord_list_threads",
  "params": {
    "guildId": "9876543210987654321",
    "includeArchived": true
  }
}
```

## Configuration

The plugin reads the Discord Bot token from OpenClaw runtime configuration. No additional plugin-specific configuration is required.

## Required Permissions

The Discord bot needs:

- `Manage Threads` - Manage thread state
- `Manage Channels` - Required for deleting threads

## Notes

- Delete is irreversible. Use it carefully.
- Archive and lock are independent states and can be combined.
- Only users with sufficient Discord permissions can perform these operations.

## License

MIT

## Chinese Appendix

- 本插件用于增强 Discord 子区（Thread）管理能力。
- 提供归档、锁定、解锁、删除、取消归档、列出子区等工具。
- 删除操作不可逆；归档与锁定可独立设置。
- Bot Token 从 OpenClaw 运行时配置读取，无需在插件中硬编码。
