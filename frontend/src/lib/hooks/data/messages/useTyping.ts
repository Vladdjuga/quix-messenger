import {useCallback, useEffect, useRef, useState} from "react";
import {User} from "@/lib/types";
import {onStopTyping, onTyping, sendStopTyping, sendTyping} from "@/lib/realtime/chatSocketUseCases";
import {Socket} from "socket.io-client";

export default function useTyping(chatId: string, socket: Socket | null, user: User | null) {
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const cooldownRef = useRef(false);
    const stopTypingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleInputChange = useCallback(() => {
        if (!socket || !chatId) return;

        if (!cooldownRef.current) {
            sendTyping(socket, chatId).catch(() => {});
            cooldownRef.current = true;
            setTimeout(() => { cooldownRef.current = false; }, 1000);
        }

        if (stopTypingTimeout.current) clearTimeout(stopTypingTimeout.current);
        stopTypingTimeout.current = setTimeout(() => {
            if (socket && chatId) sendStopTyping(socket, chatId).catch(() => {});
        }, 1500);
    }, [socket, chatId]);

    useEffect(() => {
        if (!socket || !chatId || !user) return;

        const offTyping = onTyping(socket, ({ chatId: cid, userId: uid }) => {
            if (cid !== chatId || uid === user.id) return;

            setTypingUsers(prev => {
                const next = new Set(prev);
                prev.add(uid);
                return next;
            });
            setTimeout(() => {
                setTypingUsers(prev => {
                    const next = new Set(prev);
                    next.delete(uid);
                    return next;
                });
            }, 2000);
        });

        const offStopTyping = onStopTyping(socket, ({ chatId: cid, userId: uid }) => {
            if (cid !== chatId || uid === user.id) return;
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(uid);
                return next;
            });
        });

        return () => {
            offTyping?.();
            offStopTyping?.();
            if (stopTypingTimeout.current) clearTimeout(stopTypingTimeout.current);
        };
    }, [socket, chatId, user]);

    return { typingUsers, handleInputChange };
}
