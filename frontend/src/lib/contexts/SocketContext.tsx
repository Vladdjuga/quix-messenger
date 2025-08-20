"use client";

import React, { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";
import {initSocket} from "@/lib/socket/socket";

export const SocketContext = createContext<Socket | null>(null);

// Function to initialize the socket connection
export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socketInstance = initSocket();
    return <SocketContext.Provider value={socketInstance}>{children}</SocketContext.Provider>;
};
