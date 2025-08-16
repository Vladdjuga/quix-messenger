export async function logoutUseCase(): Promise<void> {
    const authorizationHeader = 'Bearer '+localStorage.getItem('jwt');
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader,
        },
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Logout failed');
    }
    // Clear the token from localStorage
    localStorage.removeItem('jwt');
    // Optionally, you can also clear any user-related data or state here
    console.log('Logout successful');
    return;
}