'use client';

import Link from "next/link";
import {useEffect, useState} from "react";
import {getCurrentUser} from "@/lib/api/user-api";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";

export default function Header() {
    const [user, setUser] = useState<ReadUserDto|null>();
    useEffect(() => {
        const fetchUser = async () => {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        };
        fetchUser().then(
            () => console.log("User fetched successfully"),
            (error) => console.error("Failed to fetch user:", error)
        );
    }, []);
    return (
        <header className="sticky top-0 z-10">
            <div className="bg-blue-500 text-white p-4 mx-auto flex items-center justify-between">
                <h1 className="text-3xl font-bold">Quix</h1>
                <nav className="mt-2">
                    <ul className="flex space-x-6">
                        <li>
                            <Link href="/" className="transition-colors
                            hover:text-black duration-300
                            ">Home</Link>
                        </li>
                        <li>
                            <Link href="/about" className="transition-colors
                            hover:text-black duration-300
                            ">About</Link>
                        </li>
                        <li>
                            <Link href="/login" className="transition-colors
                            hover:text-black duration-300
                            ">Login</Link>
                        </li>
                        {user && (
                            <li className="ml-4 font-semibold text-black">
                                Hello, {user?.username}!
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    )
}