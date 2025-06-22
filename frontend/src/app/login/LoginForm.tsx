"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DefaultButton from "@/components/buttons/DefaultButton";
import PasswordInput from "@/components/inputs/PasswordInput";
import Link from "next/link";
import React from "react";
import {LoginFormData, loginSchema} from "@/lib/schemas/loginSchema";

export default function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identity: "",
            password: "",
        }
    });
    const onSubmit = async (data: LoginFormData) => {
        try {
            const { loginUser } = await import("@/lib/usecases/auth/loginUser");
            await loginUser(data);
            window.location.href = "/";
        } catch (error) {
            console.error("Login failed:", error);
            alert("Login failed. Please check your credentials and try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-center w-full mx-auto">
                <div className="w-1/4 bg-gray-900 p-[3%]">
                    <h1 className="text-white text-2xl">Login</h1>
                    <hr className="my-4" />

                    <div className="mb-4">
                        <label className="text-white">Username or email:</label>
                        <input
                            {...register("identity")}
                            className="w-full p-3 border rounded"
                            placeholder="Identity..."
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
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    <hr className="my-4" />
                    <div className="w-full flex justify-between">
                        <Link className="underline text-gray-400 hover:text-white" href="#">
                            Forgot password?
                        </Link>
                        <DefaultButton color="blue" type="submit">
                            Login
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </form>
    );
}
