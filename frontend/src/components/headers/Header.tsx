'use client';

import Link from "next/link";
import {useEffect, useState} from "react";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";
import {logoutUseCase} from "@/lib/usecases/auth/logoutUseCase";
import { localStorageShim as localStorage } from "@/lib/shims/localStorage";

export default function Header() {
    const [user, setUser] = useState<ReadUserDto|null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const token = localStorage.getItem('jwt');
                if (!token) {
                    setLoading(false);
                    return;
                }
                const response = await fetch('/api/user/getCurrentUser', {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data: ReadUserDto = await response.json();
                    setUser(data);
                } else {
                    console.error('Failed to fetch user data:', response.status, response.statusText);
                    if (response.status === 401) {
                        localStorage.removeItem('jwt');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCurrentUser();
    }, []);
    const handleLogout = async () => {
        try {
            await logoutUseCase();
            setUser(null);
            window.location.href = '/'; // Redirect to home after logout
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };
    return (
        <header className="sticky top-0 z-10">
            <div className="bg-blue-500 text-white p-4 mx-auto flex items-center justify-between">
                <h1 className="text-3xl font-bold">Quix</h1>
                <nav className="mt-2">
                    <ul className="flex space-x-6 items-center">
                        <li>
                            <Link
                                href="/"
                                className="transition-colors hover:text-black duration-300"
                            >
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/about"
                                className="transition-colors hover:text-black duration-300"
                            >
                                About
                            </Link>
                        </li>
                        {!user && !loading && (
                            <>
                                <li>
                                    <Link
                                        href="/login"
                                        className="transition-colors hover:text-black duration-300"
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/register"
                                        className="transition-colors hover:text-black duration-300"
                                    >
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                        {loading && (
                            <li className="text-gray-200">
                                Loading...
                            </li>
                        )}
                        {user && (
                            <>
                                <li className="ml-4 font-semibold text-yellow-200">
                                    Hello, {user.username}!
                                </li>
                                <li>
                                    <Link
                                        href="/profile"
                                        className="transition-colors hover:text-black duration-300"
                                    >
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/friends"
                                        className="transition-colors hover:text-black duration-300"
                                    >
                                        Friends
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/requests"
                                        className="transition-colors hover:text-black duration-300"
                                    >
                                        Requests
                                    </Link>
                                </li>
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="transition-colors hover:text-black duration-300"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}