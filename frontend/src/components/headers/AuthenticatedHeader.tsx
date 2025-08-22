'use client';

import Link from "next/link";
import {logoutUseCase} from "@/lib/usecases/auth/logoutUseCase";
import {useCurrentUser} from "@/lib/hooks/data/user/userHook";

export default function AuthenticatedHeader() {
    const {user, loading} = useCurrentUser();
    
    const handleLogout = async () => {
        try {
            await logoutUseCase();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    if (loading) {
        return (
            <header className="sticky top-0 z-10">
                <div className="bg-blue-500 text-white p-4 mx-auto flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Quix</h1>
                    <nav className="mt-2">
                        <span className="text-gray-200">Loading...</span>
                    </nav>
                </div>
            </header>
        );
    }

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
