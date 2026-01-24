"use client";

import React, { createContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { initPresenceConnection } from "@/lib/signalr/presenceConnection";

export const PresenceContext = createContext<signalR.HubConnection | null>(null);

// Provider to initialize and manage PresenceHub connection
export const PresenceProvider = ({ children }: { children: React.ReactNode }) => {
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        let mounted = true;

        const setupConnection = async () => {
            try {
                const conn = await initPresenceConnection();
                if (mounted) {
                    setConnection(conn);
                }
            } catch (error) {
                console.error('Failed to initialize PresenceHub:', error);
            }
        };

        setupConnection();

        return () => {
            mounted = false;
        };
    }, []);

    return <PresenceContext.Provider value={connection}>{children}</PresenceContext.Provider>;
};
