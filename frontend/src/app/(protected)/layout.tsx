"use client";

import React from "react";
import { UserProvider } from "@/lib/contexts/UserContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <AuthGuard>
                {children}
            </AuthGuard>
        </UserProvider>
    );
}