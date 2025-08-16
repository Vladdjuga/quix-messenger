import React from "react";

type ButtonProps = {
    color?: "blue" | "red" | "green" | "yellow";
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
};

const colorClasses = {
    blue: "bg-blue-700 hover:bg-blue-500 text-white",
    red: "bg-red-700 hover:bg-red-500 text-white",
    green: "bg-green-700 hover:bg-green-500 text-white",
    yellow: "bg-yellow-700 hover:bg-yellow-500 text-black",
};

export default function DefaultButton({ color = "blue", children, onClick, type, disabled }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2 rounded-md font-semibold transition-colors
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}
             duration-300 shadow-md ${colorClasses[color]}`}
            type={type}
            disabled={disabled}
        >
            {children}
        </button>
    );
}