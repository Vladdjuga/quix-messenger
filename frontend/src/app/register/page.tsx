"use client";

import { motion } from "framer-motion";

import RegisterForm from "./RegisterForm";
export default function Register() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <RegisterForm />
        </motion.div>
    )
}