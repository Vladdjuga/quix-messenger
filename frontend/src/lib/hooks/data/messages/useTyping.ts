import { useCallback, useEffect, useRef, useState } from "react";
import { User } from "@/lib/types";
import { onUserStopTyping, onUserTyping, sendStopTyping, sendTyping } from "@/lib/signalr/chatUseCases";
import * as signalR from "@microsoft/signalr";

export default function useTyping(chatId: string, connection: signalR.HubConnection | null, user: User | null) {
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
    const cooldownRef = useRef(false);
    const stopTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleInputChange = useCallback(() => {
        if (!connection || !chatId || connection.state !== signalR.HubConnectionState.Connected) return;

        if (!cooldownRef.current) {
            sendTyping(connection, chatId).catch(() => {});
            cooldownRef.current = true;
            setTimeout(() => { cooldownRef.current = false; }, 1000);
        }

        if (stopTypingTimeout.current) clearTimeout(stopTypingTimeout.current);
        stopTypingTimeout.current = setTimeout(() => {
            if (connection && chatId && connection.state === signalR.HubConnectionState.Connected) {
                sendStopTyping(connection, chatId).catch(() => {});
            }
        }, 1500);
    }, [connection, chatId]);

    useEffect(() => {
        if (!connection || !chatId || !user || connection.state !== signalR.HubConnectionState.Connected) return;

        const offTyping = onUserTyping(connection, ({ username, chatId: cid, userId: uid }) => {
            if (cid !== chatId || uid === user.id) return;

            setTypingUsers(prev => {
                const next = new Map(prev);
                next.set(uid, username);
                return next;
            });
            setTimeout(() => {
                setTypingUsers(prev => {
                    const next = new Map(prev);
                    next.delete(uid);
                    return next;
                });
            }, 2000);
        });

        const offStopTyping = onUserStopTyping(connection, ({ chatId: cid, userId: uid }) => {
            if (cid !== chatId || uid === user.id) return;
            setTypingUsers(prev => {
                const next = new Map(prev);
                next.delete(uid);
                return next;
            });
        });

        return () => {
            offTyping?.();
            offStopTyping?.();
            if (stopTypingTimeout.current) clearTimeout(stopTypingTimeout.current);
        };
    }, [connection, chatId, user]);

    return { typingUsers, handleInputChange };
}
