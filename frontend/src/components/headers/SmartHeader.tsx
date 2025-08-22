"use client";

import { useContext } from "react";
import { UserContext } from "@/lib/contexts/UserContext";
import PublicHeader from "./PublicHeader";
import AuthenticatedHeader from "./AuthenticatedHeader";

export default function SmartHeader() {
    const userContext = useContext(UserContext);

    if (!userContext || userContext.isLoading) {
        return (
            <header className="sticky top-0 z-10">
                <div className="bg-blue-500 text-white p-4 mx-auto flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Quix</h1>
                    <nav className="mt-2">
                        <span className="text-gray-200">Loading...</span>
                    </nav>
                </div>
            </header>
        );
    }

    return userContext.user ? <AuthenticatedHeader /> : <PublicHeader />;
}