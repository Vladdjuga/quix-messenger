"use server";
import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";

const BASE_URL = 'http://user-service:7001/api/Auth';
export async function loginRequest(identity: string, password: string): Promise<{ token: string }> {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        body: JSON.stringify({ identity, password }),
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
}
export async function registerRequest(dto:RegisterUserDto) {
    const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({
            ...dto
        }),
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Registration failed');
    // If the registration is successful, you might want to return some data, like a success message
    return res.json()
}