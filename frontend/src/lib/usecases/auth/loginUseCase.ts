import {LoginUserDto} from "@/lib/dto/LoginUserDto";

export async function loginUseCase(dto:LoginUserDto) {
    const result = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
    });
    if (!result.ok) {
        const error = await result.json();
        throw new Error(error || 'Login failed');
    }
    const data = await result.json();
    if (!data.token) {
        throw new Error('Login failed: No token received');
    }
    // Store the token in localStorage
    localStorage.setItem('jwt', data.token);
    return data.token; // Return the token for further use
}