"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DefaultButton from "@/components/buttons/DefaultButton";
import PasswordInput from "@/components/inputs/PasswordInput";
import Link from "next/link";
import React, { useState } from "react";
import {LoginFormData, loginSchema} from "@/lib/schemas/loginSchema";

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identity: "",
            password: "",
        }
    });

    const onSubmit = async (data: LoginFormData) => {
        if (isLoading) return; // Prevent multiple submissions
        
        setIsLoading(true);
        setLoginError(null);
        
        try {
            const { loginUseCase } = await import("@/lib/usecases/auth/loginUseCase");
            await loginUseCase(data);
            
            // Clear form and redirect
            reset();
            window.location.href = "/";
        } catch (error) {
            console.error("Login failed:", error);
            setLoginError(error instanceof Error ? error.message : "Login failed. Please check your credentials and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-center w-full mx-auto">
                <div className="w-1/4 bg-gray-900 p-[3%]">
                    <h1 className="text-white text-2xl">Login</h1>
                    <hr className="my-4" />

                    {/* Global Error Display */}
                    {loginError && (
                        <div className="mb-4 p-3 bg-red-500 text-white rounded text-sm">
                            {loginError}
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="text-white">Username or email:</label>
                        <input
                            {...register("identity")}
                            className="w-full p-3 border rounded"
                            placeholder="Identity..."
                            disabled={isLoading}
                        />
                        {errors.identity && (
                            <p className="text-red-500 text-sm">{errors.identity.message}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="text-white">Password:</label>
                        <PasswordInput
                            {...register("password")}
                            className="w-full p-3 border rounded"
                            required
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    <hr className="my-4" />
                    <div className="w-full flex justify-between items-center">
                        <div className="flex flex-col gap-2">
                            <Link className="underline text-gray-400 hover:text-white text-sm" href="/register">
                                Don&apos;t have an account? Register
                            </Link>
                            <Link className="underline text-gray-400 hover:text-white text-sm" href="#">
                                Forgot password?
                            </Link>
                        </div>
                        <DefaultButton 
                            color="blue" 
                            type="submit" 
                            disabled={isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </form>
    );
}
