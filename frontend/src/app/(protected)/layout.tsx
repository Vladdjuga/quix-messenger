"use client";

import React from "react";
import { UserProvider } from "@/lib/contexts/UserContext";

export default function Layout({ children }: { children: React.ReactNode }) {
    return <UserProvider>{children}</UserProvider>;
}