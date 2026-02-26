import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk";
import { registerThreadTools } from "./src/thread-tools.js";

/**
 * Discord Enhanced Plugin
 * 
 * 增强 Discord 功能，支持：
 * - 关闭子区（归档/锁定 thread）
 * - 批量管理 threads
 * - Thread 状态查询
 */
const plugin = {
  id: "discord-enhanced",
  name: "Discord Enhanced",
  description: "增强 Discord 功能，支持子区管理",
  configSchema: emptyPluginConfigSchema(),
  register(api: OpenClawPluginApi) {
    // 注册 thread 管理工具
    registerThreadTools(api);
  },
};

export default plugin;
