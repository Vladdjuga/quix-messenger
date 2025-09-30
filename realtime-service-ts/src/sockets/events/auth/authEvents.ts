import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import logger from "../../../config/logger.js";
import { User } from "../../../types/user.js";

const JWT_SECRET = process.env.JWT_SECRET || 'some-default-secret';

export async function onRefreshAuth(this: Socket, data: any): Promise<void> {
  const socket = this;
  try {
    const token = data?.token as string | undefined;
    if (!token) {
      socket.emit('error', { message: 'Missing token for refreshAuth' });
      return;
    }
    const user = User.fromJson(jwt.verify(token, JWT_SECRET));
    socket.data.user = user;
    socket.data.token = token;
    logger.info(`[${socket.id}] auth refreshed for user ${user.id}`);
    socket.emit('authRefreshed', { ok: true });
  } catch (error) {
    logger.error(`refreshAuth failed: ${error instanceof Error ? error.message : String(error)}`);
    socket.emit('unauthorized', { message: 'Invalid token on refreshAuth' });
  }
}
