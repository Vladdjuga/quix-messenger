
import {loginRequest} from '../../api/auth-api';
import {LoginUserDto} from "@/lib/dto/LoginUserDto";

export async function loginUser(dto:LoginUserDto) {
    const token = await loginRequest(dto.identity, dto.password);
    if (token) {
        localStorage.setItem('jwt', token);
        return token;
    }
    throw new Error('Login failed');
}