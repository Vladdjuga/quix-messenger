import "./globals.css";
import React from "react";
import SmartHeader from "@/components/headers/SmartHeader";
import {UserProvider} from "@/lib/contexts/UserContext";
import PageTransition from "@/components/PageTransition";

export const metadata = {
    title: "Quix - messaging app",
    description: "Made with love by Quix",
};

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className="bg-gray-100 text-gray-900">
        <UserProvider>
            <SmartHeader/>
            <main className="p-4">
                <PageTransition>
                    {children}
                </PageTransition>
            </main>
        </UserProvider>
        </body>
        </html>
    );
}