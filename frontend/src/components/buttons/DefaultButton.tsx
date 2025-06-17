import React from "react";

type ButtonProps = {
    color?: "blue" | "red" | "green" | "yellow";
    children: React.ReactNode;
    onClick?: () => void;
};

const colorClasses = {
    blue: "bg-blue-700 hover:bg-blue-500 text-white",
    red: "bg-red-700 hover:bg-red-500 text-white",
    green: "bg-green-700 hover:bg-green-500 text-white",
    yellow: "bg-yellow-700 hover:bg-yellow-500 text-black",
};

export default function DefaultButton({ color = "blue", children, onClick }: ButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-5 py-2 rounded-md font-semibold transition-colors
            cursor-pointer
             duration-300 shadow-md ${colorClasses[color]}`}
        >
            {children}
        </button>
    );
}