"use client";

import { motion } from "framer-motion";
import DefaultButton from "@/components/buttons/DefaultButton";
import Link from "next/link";
import PasswordInput from "@/components/inputs/PasswordInput";

export default function LoginPage() {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
        <div className="flex items-center justify-center w-full mx-auto">
            <div className="w-1/4 bg-gray-900 p-[3%]">
                <h1 className="text-white text-2xl">Login</h1>
                <hr className="my-4" />
                <div className="w-full">
                    <label>Username or email : </label>
                    <input className="w-full p-3 border border-gray-300 rounded transition
                    duration-75 focus:outline-none focus:ring-2 focus:ring-blue-500" type="text"
                           placeholder="Identity..."/>
                </div>
                <div className="w-full">
                    <label>Password : </label>
                    <PasswordInput className="w-full p-3 border border-gray-300 rounded transition
                    duration-75 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <hr className="my-4" />
                <div className="w-full flex justify-between">
                    <Link className="underline text-gray-400
                    transition-colors hover:text-white"
                          href="#">Forgot password?</Link>
                    <DefaultButton color={"blue"}>
                        Login
                    </DefaultButton>
                </div>
            </div>
        </div>
        </motion.div>
    )
}