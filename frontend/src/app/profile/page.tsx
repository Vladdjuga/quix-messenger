"use client";

import React, { useEffect, useState } from "react";
import { getCurrentUserUseCase } from "@/lib/usecases/user/getCurrentUserUseCase";
import {ReadUserDto} from "@/lib/dto/ReadUserDto";

export default function ProfilePage() {
    const [user, setUser] = useState<ReadUserDto|null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await getCurrentUserUseCase();
                setUser(currentUser);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl text-gray-700">Loading...</h1>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl text-gray-700">You are not logged in.</h1>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Username:</label>
                <p className="text-gray-900">{user.username}</p>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Email:</label>
                <p className="text-gray-900">{user.email}</p>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">First Name:</label>
                <p className="text-gray-900">{user.firstName}</p>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Last Name:</label>
                <p className="text-gray-900">{user.lastName}</p>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">Date of Birth:</label>
                <p className="text-gray-900">{new Date(user.dateOfBirth).toLocaleDateString()}</p>
            </div>
        </div>
    );
}