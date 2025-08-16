
import {loginRequest} from '../../api/auth/login';
import {LoginUserDto} from "@/lib/dto/LoginUserDto";

export async function loginUser(dto:LoginUserDto) {
    const result = await loginRequest(dto.identity, dto.password);
    if (result) {
        localStorage.setItem('jwt', result.token);
        return result.token;
    }
    throw new Error('Login failed');
}