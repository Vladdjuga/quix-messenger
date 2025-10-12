"use client";

import type { User } from "@/lib/types";
import React, {createContext, useEffect, useState} from "react";
import {getCurrentUserUseCase} from "@/lib/usecases/user/getCurrentUserUseCase";
import { localStorageShim as localStorage } from "@/lib/shims/localStorage";

type UserContextType = {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
};

export const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    setUser: () => {}
});

export const UserProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        // Try to load cached user from sessionStorage on initial mount
        if (typeof window !== "undefined") {
            const cached = sessionStorage.getItem("currentUser");
            if (cached) {
                try {
                    return JSON.parse(cached) as User;
                } catch {
                    sessionStorage.removeItem("currentUser");
                }
            }
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                // Only try to load user if we have a token
                const token = localStorage.getItem("jwt");
                if (!token) {
                    setIsLoading(false);
                    setIsAuthenticated(false);
                    sessionStorage.removeItem("currentUser");
                    return;
                }

                // If we already have cached user, skip the API call
                if (user) {
                    setIsAuthenticated(true);
                    setIsLoading(false);
                    return;
                }

                const currentUser = await getCurrentUserUseCase();
                setUser(currentUser);
                setIsAuthenticated(true);
                // Cache user in sessionStorage for this browser tab
                sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
            } catch (err) {
                console.error("Failed to fetch user", err);
                setUser(null);
                setIsAuthenticated(false);
                // Remove invalid token and cache
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("currentUser");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [user]);

    const handleSetUser = (newUser: User | null) => {
        setUser(newUser);
        setIsAuthenticated(!!newUser);
        // Update cache when user changes (e.g., profile edit)
        if (newUser) {
            sessionStorage.setItem("currentUser", JSON.stringify(newUser));
        } else {
            sessionStorage.removeItem("currentUser");
        }
    };

    const contextValue = {
        user,
        isLoading,
        isAuthenticated,
        setUser: handleSetUser
    };

    return (
        // For now , SocketProvider is not nested here to avoid issues with useEffect in SocketProvider
        // <SocketProvider>
        // </SocketProvider>
        // If you need sockets to depend on user context, consider restructuring the providers
        <UserContext.Provider value={contextValue}>
                {children}
        </UserContext.Provider>
    );
};