import "./globals.css";
import React from "react";
import Header from "@/components/headers/Header";
import {SocketProvider} from "@/lib/contexts/SocketContext";
import {UserProvider} from "@/lib/contexts/UserContext";

export const metadata = {
    title: "Quix - messaging app",
    description: "Made with love by Quix",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {


    return (
        <html lang="en">
        <body className="bg-gray-100 text-gray-900">
        <UserProvider>
        <Header />
        <main className="p-4">{children}</main>
        </UserProvider>
        </body>
        </html>
    );
}