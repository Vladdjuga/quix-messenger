import "./globals.css";
import React from "react";
import Header from "@/components/headers/Header";

export const metadata = {
    title: "Quix - messaging app",
    description: "Made with love by Quix",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ru">
        <body className="bg-gray-100 text-gray-900">
        <Header />
        <main className="p-4">{children}</main>
        </body>
        </html>
    );
}