"use client";

import React, { createContext } from "react";
import { Socket } from "socket.io-client";
import {initSocket} from "@/lib/socket/socket";

export const SocketContext = createContext<Socket | null>(null);

// Function to initialize the socket connection
export const SocketProvider =
    ({ children }: { children: React.ReactNode }) => {
    const socketInstance = initSocket();
    return <SocketContext.Provider value={socketInstance}>{children}</SocketContext.Provider>;
};
