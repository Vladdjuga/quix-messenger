import { ReadUserDto } from "@/lib/dto/ReadUserDto";

export async function getCurrentUserUseCase() {
    const authorizationHeader = 'Bearer ' + localStorage.getItem('jwt');
    if (!authorizationHeader) {
        throw new Error('No JWT token found');
    }
    const response = await fetch('/api/user/getCurrentUser', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': authorizationHeader,
        },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch current user');
    }
    const data = await response.json();
    if (!data) {
        throw new Error('No user data received');
    }
    // Cast to ReadUserDto if necessary
    const userData: ReadUserDto = data as ReadUserDto;
    if(!userData){
        throw new Error('User data is empty or malformed');
    }
    return userData; // Return the user data for further use
}