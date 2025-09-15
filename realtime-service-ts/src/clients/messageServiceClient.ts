import logger from "../config/logger.js";

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
  async addMessage(params: { text: string; chatId: string; userId: string; token: string }): Promise<{ id: string } | null> {
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

      const id = (await res.json()) as string | null;
      if (!id) return null;
      return { id };
    } catch (err) {
      logger.error(`user-service addMessage failed: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }
}
