
import { motion } from "framer-motion";
import LoginForm from "./LoginForm";

export default function Login() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <LoginForm />
        </motion.div>
    )
}