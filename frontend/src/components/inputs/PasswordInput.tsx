import React from "react";

type PasswordProps = {
    placeholder?: string;
    className?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
};

export default function PasswordInput({ placeholder = "Password...",
                                          className = "" ,value,onChange,required}:PasswordProps) {
    const [showPassword, setShowPassword] = React.useState(false);
    return (
        <div className={`relative w-full`}>
            <input
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                className={`${className}`}
                value={value}
                onChange={onChange}
                required={required}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-300 text-gray-500 hover:text-blue-600
                bg-gray-800 rounded-full p-1 "
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.96 9.96 0 012.432-4.165M3 3l18 18"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.477 10.477a3 3 0 014.243 4.243"
                        />
                    </svg>
                )}
            </button>
        </div>
    );
}