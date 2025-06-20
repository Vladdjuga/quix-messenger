const BASE_URL = 'http://user-service:7001/api/User';

export async function getCurrentUser() {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('No JWT token found');

    const res = await fetch(`${BASE_URL}/getMeInfo`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!res.ok) throw new Error('Failed to fetch current user');

    return await res.json();
}