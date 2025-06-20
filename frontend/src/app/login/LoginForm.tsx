"use client";

import DefaultButton from "@/components/buttons/DefaultButton";
import Link from "next/link";
import PasswordInput from "@/components/inputs/PasswordInput";
import React, {useState} from "react";
import { LoginUserDto } from "@/lib/dto/LoginUserDto";

export default function LoginForm() {
    const [dto, setDto] = useState<LoginUserDto>(new LoginUserDto("", ""));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { loginUser } = await import('@/lib/usecases/auth/loginUser');
            await loginUser(dto);
            window.location.href = '/'; // Redirect to home page after successful login
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials and try again.');
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-center w-full mx-auto">
                <div className="w-1/4 bg-gray-900 p-[3%]">
                    <h1 className="text-white text-2xl">Login</h1>
                    <hr className="my-4"/>
                    <div className="w-full">
                        <label>Username or email : </label>
                        <input className="w-full p-3 border border-gray-300 rounded transition
                            duration-75 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text"
                               placeholder="Identity..."
                               value={dto.identity}
                               onChange={(e) =>
                                   setDto({...dto,identity:e.target.value})}
                               required/>
                    </div>
                    <div className="w-full">
                        <label>Password : </label>
                        <PasswordInput className="w-full p-3 border border-gray-300 rounded transition
                            duration-75 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       value={dto.password}
                                       onChange={(e) =>
                                           setDto({...dto,password:e.target.value})}
                                       required/>
                    </div>
                    <hr className="my-4"/>
                    <div className="w-full flex justify-between">
                        <Link className="underline text-gray-400
                            transition-colors hover:text-white"
                              href="#">Forgot password?</Link>
                        <DefaultButton color={"blue"} type="submit">
                            Login
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </form>
    )
}