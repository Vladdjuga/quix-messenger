"use client";

import { motion } from "framer-motion";
import DefaultButton from "@/components/buttons/DefaultButton";
import Link from "next/link";
import PasswordInput from "@/components/inputs/PasswordInput";
import React, {useState} from "react";

export default function LoginPage() {
    const [identity, setIdentity] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const response = await fetch('user-service:7001/api/login', {
            method: 'POST',
            body: JSON.stringify({ identity, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log('JWT:', { jwt: response });
    };
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-center w-full mx-auto">
                    <div className="w-1/4 bg-gray-900 p-[3%]">
                        <h1 className="text-white text-2xl">Login</h1>
                        <hr className="my-4" />
                        <div className="w-full">
                            <label>Username or email : </label>
                            <input className="w-full p-3 border border-gray-300 rounded transition
                            duration-75 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text"
                                   placeholder="Identity..."
                                   value={identity}
                                   onChange={(e) => setIdentity(e.target.value)}
                                   required/>
                        </div>
                        <div className="w-full">
                            <label>Password : </label>
                            <PasswordInput className="w-full p-3 border border-gray-300 rounded transition
                            duration-75 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           value={password}
                                           onChange={(e) => setPassword(e.target.value)}
                                           required/>
                        </div>
                        <hr className="my-4" />
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
        </motion.div>
    )
}