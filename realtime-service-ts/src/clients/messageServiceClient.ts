import logger from "../config/logger.js";

const DEFAULT_BASE_URL = process.env.MESSAGE_SERVICE_URL || "http://message-service:7001";

export class MessageServiceClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Calls message-service REST endpoint to add a message.
   * POST /api/Messages/add
   */
  async addMessage(params: { text: string; chatId: string; userId: string; token: string }): Promise<{ id: string } | null> {
    const { text, chatId, userId, token } = params;
    const url = `${this.baseUrl}/api/Messages/add`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, chatId, userId })
      });

      if (!res.ok) {
        logger.warn(`message-service addMessage non-2xx: ${res.status} ${res.statusText}`);
        return null;
      }

      const id = (await res.json()) as string | null;
      if (!id) return null;
      return { id };
    } catch (err) {
      logger.error(`message-service addMessage failed: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }
}
