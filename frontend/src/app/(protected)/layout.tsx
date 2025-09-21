"use client";

import React from "react";
import { UserProvider } from "@/lib/contexts/UserContext";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {SocketProvider} from "@/lib/contexts/SocketContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AuthGuard>
                <SocketProvider>
                {children}
                </SocketProvider>
            </AuthGuard>
        </UserProvider>
    );
}