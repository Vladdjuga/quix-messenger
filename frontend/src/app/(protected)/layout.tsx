"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {ChatProvider} from "@/lib/contexts/SocketContext";
import {PresenceProvider} from "@/lib/contexts/PresenceContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <ChatProvider>
                <PresenceProvider>
                    {children}
                </PresenceProvider>
            </ChatProvider>
        </AuthGuard>
    );
}