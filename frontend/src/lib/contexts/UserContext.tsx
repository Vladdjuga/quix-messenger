"use client";

import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import React, {createContext, useEffect, useState} from "react";
import {getCurrentUserUseCase} from "@/lib/usecases/user/getCurrentUserUseCase";
import {SocketProvider} from "@/lib/contexts/SocketContext";
import { localStorageShim as localStorage } from "@/lib/shims/localStorage";

type UserContextType = {
    user: ReadUserDto | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: ReadUserDto | null) => void;
};

export const UserContext = createContext<UserContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    setUser: () => {}
});

export const UserProvider = ({children}: { children: React.ReactNode }) => {
    const [user, setUser] = useState<ReadUserDto | null>(null);
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
                    return;
                }

                const currentUser = await getCurrentUserUseCase();
                setUser(currentUser);
                setIsAuthenticated(true);
            } catch (err) {
                console.error("Failed to fetch user", err);
                setUser(null);
                setIsAuthenticated(false);
                // Remove invalid token
                localStorage.removeItem("jwt");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const handleSetUser = (newUser: ReadUserDto | null) => {
        setUser(newUser);
        setIsAuthenticated(!!newUser);
    };

    const contextValue = {
        user,
        isLoading,
        isAuthenticated,
        setUser: handleSetUser
    };

    return (
        <UserContext.Provider value={contextValue}>
            <SocketProvider>
                {children}
            </SocketProvider>
        </UserContext.Provider>
    );
};