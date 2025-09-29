"use client";

import {Controller, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordInput from "@/components/inputs/PasswordInput";
import DefaultButton from "@/components/buttons/DefaultButton";
import Link from "next/link";
import React from "react";
import {api} from "@/app/api";
import { registerSchema, RegisterFormData } from "@/lib/schemas/registerSchema";

export default function RegisterForm() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues:{
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            firstName: "",
            lastName: "",
            // schema coerces to Date; keep undefined initially
            dateOfBirth: undefined as unknown as Date,
        }
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            const response = await api.auth.register({
                username: data.username,
                email: data.email,
                password: data.password,
                confirmPassword: data.confirmPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth, // schema coerces to Date in API route
            });
            if (response.status === 201 || response.status === 200) {
                window.location.href = "/login"; // Redirect to login page on successful registration
            } else {
                alert("Registration failed. Please try again.");
            }
        } catch (error) {
            console.error("Registration failed:", error);
            alert("Registration failed. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-center w-full mx-auto">
                <div className="w-1/3 bg-gray-900 p-[3%] rounded">
                    <h1 className="text-white text-2xl mb-2">Register</h1>
                    <hr className="my-4" />

                    {[
                        { name: "username", label: "Username" },
                        { name: "email", label: "Email", type: "email" },
                        { name: "firstName", label: "First Name" },
                        { name: "lastName", label: "Last Name" },
                    ].map(({ name, label, type = "text" }) => (
                        <div className="mb-4" key={name}>
                            <label className="text-white">{label}:</label>
                            <input
                                {...register(name as keyof RegisterFormData)}
                                className="w-full p-3 border rounded"
                                type={type}
                            />
                            {errors[name as keyof RegisterFormData] && (
                                <p className="text-red-500 text-sm">
                                    {errors[name as keyof RegisterFormData]?.message}
                                </p>
                            )}
                        </div>
                    ))}

                    <div className="mb-4">
                        <label className="text-white">Password:</label>
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    {...field}
                                    className="w-full p-3 border rounded"
                                />
                            )}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="text-white">Confirm Password:</label>
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    {...field} // передаёт value, onChange, ref
                                    placeholder="Confirm Password..."
                                    className="w-full p-3 border rounded"
                                />
                            )}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm">
                                {errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="text-white">Date of Birth:</label>
                        <input
                            {...register("dateOfBirth", {
                                setValueAs: (v) => (v && v !== '') ? new Date(v) : undefined,
                            })}
                            className="w-full p-3 border rounded"
                            type="date"
                        />
                        {errors.dateOfBirth && (
                            <p className="text-red-500 text-sm">
                                {errors.dateOfBirth.message}
                            </p>
                        )}
                    </div>

                    <hr className="my-4" />
                    <div className="w-full flex justify-between items-center">
                        <Link
                            className="underline text-gray-400 transition-colors hover:text-white"
                            href="/login"
                        >
                            Already have an account?
                        </Link>
                        <DefaultButton color="blue" type="submit">
                            Register
                        </DefaultButton>
                    </div>
                </div>
            </div>
        </form>
    );
}
