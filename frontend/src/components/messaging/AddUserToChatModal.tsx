"use client";
import React, { useState } from "react";
import { api } from "@/app/api";
import { ChatRole, ChatType } from "@/lib/types";
import { UserStatus } from "@/lib/types/enums";
import { useUserSearch, UserWithStatus } from "@/lib/hooks/data/user/useUserSearch";
import {AxiosError} from "axios";

interface AddUserToChatModalProps {
    chatId: string;
    chatType: ChatType;
    onClose: () => void;
    onUserAdded?: () => void;
}

export default function AddUserToChatModal({ chatId, chatType, onClose, onUserAdded }: AddUserToChatModalProps) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<ChatRole>(ChatRole.User);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { query, setQuery, results, loading } = useUserSearch();

    const handleAddUser = async () => {
        if (!selectedUserId) {
            setError("Please select a user");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await api.chats.addUser({
                chatId,
                userId: selectedUserId,
                chatRole: selectedRole,
            });
            
            onUserAdded?.();
            onClose();
        } catch (err) {
            console.error("Failed to add user to chat:", err);
            if(err instanceof AxiosError)
                setError(err.response?.data?.message || "Failed to add user to chat");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter to only show friends for group chats
    const availableUsers = results.filter((item: UserWithStatus) => 
        item.status === UserStatus.Friends && chatType === ChatType.Group
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-surface border border-default rounded-lg shadow-xl p-6 w-[500px] max-h-[600px] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary">Add User to Chat</h2>
                    <button 
                        type="button"
                        onClick={onClose}
                        className="text-muted hover:text-primary transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Search Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Search Users</span>
                        </label>
                        <input 
                            type="text"
                            placeholder="Search by username..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isSubmitting}
                        />
                        <label className="label">
                            <span className="label-text-alt text-muted">
                                💡 Only friends can be added to group chats
                            </span>
                        </label>
                    </div>

                    {/* User List */}
                    {query && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Select User</span>
                            </label>
                            <div className="border border-default rounded-lg max-h-[200px] overflow-y-auto">
                                {loading && (
                                    <div className="p-4 text-center text-muted">
                                        <span className="loading loading-spinner loading-sm"></span>
                                        <span className="ml-2">Searching...</span>
                                    </div>
                                )}
                                {!loading && availableUsers.length === 0 && (
                                    <div className="p-4 text-center text-muted">
                                        No users found
                                    </div>
                                )}
                                {!loading && availableUsers.map((item: UserWithStatus) => (
                                    <div
                                        key={item.user.id}
                                        onClick={() => setSelectedUserId(item.user.id)}
                                        className={`p-3 cursor-pointer hover:bg-primary/10 transition-colors border-b border-default last:border-0 ${
                                            selectedUserId === item.user.id ? 'bg-primary/20' : ''
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                    <span className="text-sm">{item.user.username.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{item.user.username}</div>
                                                <div className="text-xs text-muted">{item.user.email}</div>
                                            </div>
                                            {selectedUserId === item.user.id && (
                                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Role Selection */}
                    {selectedUserId && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">User Role</span>
                            </label>
                            <select 
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(Number(e.target.value) as ChatRole)}
                                className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
                                disabled={isSubmitting}
                            >
                                <option value={ChatRole.User}>Member</option>
                                <option value={ChatRole.Moderator}>Moderator</option>
                                <option value={ChatRole.Admin}>Admin</option>
                            </select>
                            <label className="label">
                                <span className="label-text-alt text-muted">
                                    Admins can add/remove users and change settings
                                </span>
                            </label>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <button 
                        type="button"
                        onClick={handleAddUser}
                        disabled={!selectedUserId || isSubmitting}
                        className="btn btn-primary flex-1"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Adding...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Add User
                            </>
                        )}
                    </button>
                    <button 
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="btn btn-ghost flex-1"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
