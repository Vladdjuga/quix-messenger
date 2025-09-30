import React, {useEffect, useRef, useState} from "react";
import {User} from "@/lib/types";
import {onStopTyping, onTyping, sendTyping} from "@/lib/realtime/chatSocketUseCases";
import {Socket} from "socket.io-client";

export default function useTyping(chatId: string, socket: Socket | null, user: User | null) {
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const cooldownRef = useRef(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!socket || !chatId) return;
        if (!cooldownRef.current) {
            sendTyping(socket, chatId).catch(() => {});
            cooldownRef.current = true;
            setTimeout(() => { cooldownRef.current = false; }, 1000);
        }
    };

    useEffect(() => {
        if (!socket || !chatId || !user) return;

        const offTyping = onTyping(socket, ({ chatId: cid, userId }) => {
            if (cid !== chatId || userId === user.id) return;
            setTypingUsers(prev => new Set(prev).add(userId));
            setTimeout(() => {
                setTypingUsers(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            }, 2000);
        });

        const offStopTyping = onStopTyping(socket, ({ chatId: cid, userId }) => {
            if (cid !== chatId || userId === user.id) return;
            setTypingUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        });

        return () => {
            offTyping?.();
            offStopTyping?.();
        };
    }, [socket, chatId, user]);

    return { typingUsers, handleInputChange };
}
