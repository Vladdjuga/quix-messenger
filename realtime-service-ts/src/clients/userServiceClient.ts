import logger from "../config/logger.js";
import { UnauthorizedError } from "./errors.js";

const DEFAULT_BASE_URL = process.env.USER_SERVICE_URL || "http://user-service:7001";

export class UserServiceClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  /**
   * Calls user-service REST endpoint to check if a user belongs to a chat.
   * GET /api/Chat/isUserInChat?userId=...&chatId=...
   */
  async isUserInChat(params: { userId: string; chatId: string; token: string }): Promise<boolean> {
    const { userId, chatId, token } = params;
    const url = `${this.baseUrl}/api/Chat/isUserInChat?userId=${encodeURIComponent(userId)}&chatId=${encodeURIComponent(chatId)}`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (res.status === 401) {
        logger.warn(`user-service isUserInChat unauthorized (401)`);
        throw new UnauthorizedError("Token expired or unauthorized");
      }
      if (!res.ok) {
        logger.warn(`user-service isUserInChat non-2xx: ${res.status} ${res.statusText}`);
        return false;
      }

      const data = (await res.json()) as { isUserInChat?: boolean } | null;
      return !!data?.isUserInChat;
    } catch (err) {
      logger.error(`user-service isUserInChat failed: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  }
}
