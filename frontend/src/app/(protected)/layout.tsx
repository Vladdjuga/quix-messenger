"use client";

import React from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {SocketProvider} from "@/lib/contexts/SocketContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <SocketProvider>
            {children}
            </SocketProvider>
        </AuthGuard>
    );
}