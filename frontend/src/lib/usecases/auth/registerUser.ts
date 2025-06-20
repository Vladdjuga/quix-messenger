import {RegisterUserDto} from "@/lib/dto/RegisterUserDto";
import {registerRequest} from "@/lib/api/auth-api";

export async function registerUser(dto:RegisterUserDto){
    try{
        const res = await registerRequest(dto);
        //Result is user GUID
        if(res){
            // Could be needed , but not sure if it is a good idea to store user GUID in localStorage
            // It is better to store JWT token in localStorage
            // So after registration , you can call loginUser function to get JWT token
            // and store it in localStorage
            localStorage.setItem('userGuid', res);
            console.log("${res} registered successfully");
            return res;
        }
    }
    catch (error) {
        console.error("Registration failed:", error);
        throw error;
    }
}