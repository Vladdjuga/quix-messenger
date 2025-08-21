"use client";

import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import React, {createContext, useEffect, useState} from "react";
import {getCurrentUserUseCase} from "@/lib/usecases/user/getCurrentUserUseCase";
import {SocketProvider} from "@/lib/contexts/SocketContext";

export const UserContext = createContext<ReadUserDto | null>(null);

// Function to provide user context
export const UserProvider =
    ({children}: { children: React.ReactNode; }) => {
        const [user, setUser] = useState<ReadUserDto | null>(null);
        useEffect(() => {
            (async () => {
                try {
                    const currentUser = await getCurrentUserUseCase();
                    setUser(currentUser);
                } catch (err) {
                    console.error("Failed to fetch user", err);
                }
            })();
        }, []);
        if (!user) {
            return <>{children}</>;
        }
        return <UserContext.Provider value={user}>
            <SocketProvider>{children}</SocketProvider>
        </UserContext.Provider>;
    };