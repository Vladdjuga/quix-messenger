import logger from "../config/logger.js";
import type {Message} from "../types/message.js";

// Prefer USER_SERVICE_URL; fallback to MESSAGE_SERVICE_URL for backward compatibility
const DEFAULT_BASE_URL = process.env.USER_SERVICE_URL || process.env.MESSAGE_SERVICE_URL || "http://user-service:7001";

export class MessageServiceClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Calls user-service REST endpoint to add a message.
   * POST /api/Messages
   */
  async addMessage(params: { text: string; chatId: string; userId: string; token: string }): Promise<Message | null> {
    const { text, chatId, token } = params; // userId is derived from JWT on server
    const url = `${this.baseUrl}/api/Messages`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, chatId })
      });

      if (!res.ok) {
        logger.warn(`user-service addMessage non-2xx: ${res.status} ${res.statusText}`);
        return null;
      }

      const dto = (await res.json()) as Message | null;
      if (!dto) return null;
      return dto;
    } catch (err) {
      logger.error(`user-service addMessage failed: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  /**
   * DELETE /api/Messages/{messageId}
   */
  async deleteMessage(params: { messageId: string; token: string }): Promise<boolean> {
    const { messageId, token } = params;
    const url = `${this.baseUrl}/api/Messages/${encodeURIComponent(messageId)}`;
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });
      if (!res.ok) {
        logger.warn(`user-service deleteMessage non-2xx: ${res.status} ${res.statusText}`);
        return false;
      }
      return true;
    } catch (err) {
      logger.error(`user-service deleteMessage failed: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }

  /**
   * PATCH /api/Messages/{messageId}
   */
  async editMessage(params: { messageId: string; text: string; token: string }): Promise<boolean> {
    const { messageId, text, token } = params;
    const url = `${this.baseUrl}/api/Messages/${encodeURIComponent(messageId)}`;
    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) {
        logger.warn(`user-service editMessage non-2xx: ${res.status} ${res.statusText}`);
        return false;
      }
      return true;
    } catch (err) {
      logger.error(`user-service editMessage failed: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }
}
