"use client";
import { motion } from "framer-motion";
export default function About() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container">
                <div className="mx-auto max-w-2xl p-4">
                    <h1 className="text-3xl font-bold">
                        About Toku
                    </h1>
                    <p>
                        Quix is a messaging app that allows users to communicate with each other in real-time.
                        It offers features such as text messaging, voice and video calls, and file sharing.
                        Quix is designed to be user-friendly and secure, making it a great choice for both personal
                        and professional communication.
                    </p>
                </div>
            </div>
        </motion.div>
    )
}