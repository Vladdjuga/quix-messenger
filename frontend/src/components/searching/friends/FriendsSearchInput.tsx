"use client";

import { ChangeEvent } from "react";

type FriendSearchInputProps = {
    value: string;
    onChangeAction: (value: string) => void;
    placeholder?: string;
};

export default function FriendSearchInput({ value, onChangeAction, placeholder = "Search..." }: FriendSearchInputProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChangeAction(e.target.value);
    };

    return (
        <div className="relative">
            <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
        </div>
    );
}
