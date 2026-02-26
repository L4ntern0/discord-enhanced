import type { OpenClawPluginApi, Tool } from "openclaw/plugin-sdk";
import { z } from "zod";

/**
 * Discord Thread 管理工具
 * 
 * 功能：
 * - 关闭子区（归档 thread）
 * - 锁定子区（防止新回复）
 * - 删除子区
 */

// Discord API 基础 URL
const DISCORD_API_BASE = "https://discord.com/api/v10";

/**
 * 获取 Discord Bot Token
 */
function getBotToken(config: any, accountId?: string): string | null {
  const discordConfig = config?.channels?.discord;
  if (!discordConfig) return null;

  // 优先使用指定账户的 token
  if (accountId && discordConfig.accounts?.[accountId]?.token) {
    return discordConfig.accounts[accountId].token;
  }

  // 使用默认 token
  return discordConfig.token || null;
}

/**
 * 调用 Discord API
 */
async function discordApi(
  endpoint: string,
  token: string,
  method: string = "GET",
  body?: any
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const url = `${DISCORD_API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    "Authorization": `Bot ${token}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        error: `Discord API error: ${response.status} ${errorText}`,
      };
    }

    // DELETE 请求通常返回 204 No Content
    if (response.status === 204) {
      return { ok: true, data: null };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 注册 Thread 管理工具
 */
export function registerThreadTools(api: OpenClawPluginApi) {
  
  /**
   * 关闭子区（归档 Thread）
   * 
   * 将 Thread 标记为已归档，不再显示在活跃列表中
   */
  const archiveThreadTool: Tool = {
    name: "discord_archive_thread",
    description: "关闭/归档 Discord 子区（Thread）。归档后的 thread 会被移到归档列表，不再显示在活跃列表中。",
    parameters: z.object({
      channelId: z.string().describe("Thread ID（子区ID）"),
      accountId: z.string().optional().describe("Discord 账户 ID，如果不指定则使用默认账户"),
      locked: z.boolean().optional().default(false).describe("是否同时锁定 thread，锁定后普通用户无法发送新消息"),
    }),
    async execute(params, context) {
      const { channelId, accountId, locked } = params;
      const token = getBotToken(context.config, accountId);

      if (!token) {
        return {
          success: false,
          error: "未找到 Discord Bot Token，请检查配置",
        };
      }

      // 修改 thread 的 archived 和 locked 状态
      const result = await discordApi(
        `/channels/${channelId}`,
        token,
        "PATCH",
        {
          archived: true,
          locked: locked || undefined,
        }
      );

      if (!result.ok) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        message: locked 
          ? `✅ 已成功关闭并锁定子区 <#${channelId}>`
          : `✅ 已成功归档子区 <#${channelId}>`,
        threadId: channelId,
        archived: true,
        locked: locked || false,
      };
    },
  };

  /**
   * 锁定子区
   * 
   * 锁定 Thread，阻止普通用户发送新消息
   */
  const lockThreadTool: Tool = {
    name: "discord_lock_thread",
    description: "锁定 Discord 子区（Thread）。锁定后普通用户无法发送新消息，但管理员仍可操作。",
    parameters: z.object({
      channelId: z.string().describe("Thread ID（子区ID）"),
      accountId: z.string().optional().describe("Discord 账户 ID，如果不指定则使用默认账户"),
    }),
    async execute(params, context) {
      const { channelId, accountId } = params;
      const token = getBotToken(context.config, accountId);

      if (!token) {
        return {
          success: false,
          error: "未找到 Discord Bot Token，请检查配置",
        };
      }

      const result = await discordApi(
        `/channels/${channelId}`,
        token,
        "PATCH",
        {
          locked: true,
        }
      );

      if (!result.ok) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        message: `🔒 已成功锁定子区 <#${channelId}>`,
        threadId: channelId,
        locked: true,
      };
    },
  };

  /**
   * 解锁子区
   */
  const unlockThreadTool: Tool = {
    name: "discord_unlock_thread",
    description: "解锁 Discord 子区（Thread）。解锁后普通用户可以发送新消息。",
    parameters: z.object({
      channelId: z.string().describe("Thread ID（子区ID）"),
      accountId: z.string().optional().describe("Discord 账户 ID，如果不指定则使用默认账户"),
    }),
    async execute(params, context) {
      const { channelId, accountId } = params;
      const token = getBotToken(context.config, accountId);

      if (!token) {
        return {
          success: false,
          error: "未找到 Discord Bot Token，请检查配置",
        };
      }

      const result = await discordApi(
        `/channels/${channelId}`,
        token,
        "PATCH",
        {
          locked: false,
        }
      );

      if (!result.ok) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        message: `🔓 已成功解锁子区 <#${channelId}>`,
        threadId: channelId,
        locked: false,
      };
    },
  };

  /**
   * 删除子区
   */
  const deleteThreadTool: Tool = {
    name: "discord_delete_thread",
    description: "删除 Discord 子区（Thread）。⚠️ 此操作不可逆！",
    parameters: z.object({
      channelId: z.string().describe("Thread ID（子区ID）"),
      accountId: z.string().optional().describe("Discord 账户 ID，如果不指定则使用默认账户"),
      confirm: z.boolean().default(false).describe("确认删除，必须设置为 true"),
    }),
    async execute(params, context) {
      const { channelId, accountId, confirm } = params;

      if (!confirm) {
        return {
          success: false,
          error: "请设置 confirm: true 以确认删除操作",
        };
      }

      const token = getBotToken(context.config, accountId);

      if (!token) {
        return {
          success: false,
          error: "未找到 Discord Bot Token，请检查配置",
        };
      }

      const result = await discordApi(
        `/channels/${channelId}`,
        token,
        "DELETE"
      );

      if (!result.ok) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        message: `🗑️ 已成功删除子区 ${channelId}`,
        threadId: channelId,
      };
    },
  };

  /**
   * 重新打开子区（取消归档）
   */
  const unarchiveThreadTool: Tool = {
    name: "discord_unarchive_thread",
    description: "重新打开/取消归档 Discord 子区（Thread）。",
    parameters: z.object({
      channelId: z.string().describe("Thread ID（子区ID）"),
      accountId: z.string().optional().describe("Discord 账户 ID，如果不指定则使用默认账户"),
    }),
    async execute(params, context) {
      const { channelId, accountId } = params;
      const token = getBotToken(context.config, accountId);

      if (!token) {
        return {
          success: false,
          error: "未找到 Discord Bot Token，请检查配置",
        };
      }

      const result = await discordApi(
        `/channels/${channelId}`,
        token,
        "PATCH",
        {
          archived: false,
        }
      );

      if (!result.ok) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        message: `📂 已成功重新打开子区 <#${channelId}>`,
        threadId: channelId,
        archived: false,
      };
    },
  };

  /**
   * 获取子区列表
   */
  const listThreadsTool: Tool = {
    name: "discord_list_threads",
    description: "获取 Discord 频道中的子区（Threads）列表",
    parameters: z.object({
      guildId: z.string().describe("Discord 服务器 ID（Guild ID）"),
      channelId: z.string().optional().describe("父频道 ID，如果不指定则获取服务器所有活跃 threads"),
      accountId: z.string().optional().describe("Discord 账户 ID，如果不指定则使用默认账户"),
      includeArchived: z.boolean().default(false).describe("是否包含已归档的 threads"),
    }),
    async execute(params, context) {
      const { guildId, channelId, accountId, includeArchived } = params;
      const token = getBotToken(context.config, accountId);

      if (!token) {
        return {
          success: false,
          error: "未找到 Discord Bot Token，请检查配置",
        };
      }

      let result;
      if (channelId) {
        // 获取特定频道的 threads
        result = await discordApi(
          `/channels/${channelId}/threads/active`,
          token
        );
      } else {
        // 获取服务器所有活跃 threads
        result = await discordApi(
          `/guilds/${guildId}/threads/active`,
          token
        );
      }

      if (!result.ok) {
        return {
          success: false,
          error: result.error,
        };
      }

      const threads = result.data.threads || [];
      
      // 如果需要归档 threads，获取它们
      let archivedThreads: any[] = [];
      if (includeArchived) {
        const archivedResult = await discordApi(
          `/guilds/${guildId}/threads/archived/public`,
          token
        );
        if (archivedResult.ok) {
          archivedThreads = archivedResult.data.threads || [];
        }
      }

      const allThreads = [...threads, ...archivedThreads];
      
      return {
        success: true,
        threads: allThreads.map((t: any) => ({
          id: t.id,
          name: t.name,
          parentId: t.parent_id,
          archived: t.thread_metadata?.archived || false,
          locked: t.thread_metadata?.locked || false,
          messageCount: t.message_count,
          memberCount: t.member_count,
        })),
        count: allThreads.length,
        activeCount: threads.length,
        archivedCount: archivedThreads.length,
      };
    },
  };

  // 注册所有工具
  api.registerTool(archiveThreadTool);
  api.registerTool(lockThreadTool);
  api.registerTool(unlockThreadTool);
  api.registerTool(deleteThreadTool);
  api.registerTool(unarchiveThreadTool);
  api.registerTool(listThreadsTool);

  console.log("[discord-enhanced] Thread management tools registered");
}
