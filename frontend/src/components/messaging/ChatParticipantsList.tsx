"use client";
import React from "react";
import { ChatRole } from "@/lib/types";
import { ChatParticipantDto } from "@/lib/dto/chat/ChatManagementDto";
import Image from "next/image";

interface ChatParticipantsListProps {
    participants: ChatParticipantDto[];
    currentUserId?: string;
    currentUserRole: ChatRole;
    loading: boolean;
    onKickUser: (userId: string, username: string) => void;
}

export default function ChatParticipantsList({
    participants,
    currentUserId,
    currentUserRole,
    loading,
    onKickUser
}: ChatParticipantsListProps) {
    
    const getRoleBadgeColor = (role: ChatRole) => {
        switch (role) {
            case ChatRole.Admin:
                return "badge-error";
            case ChatRole.Moderator:
                return "badge-warning";
            default:
                return "badge-ghost";
        }
    };

    const getRoleLabel = (role: ChatRole) => {
        switch (role) {
            case ChatRole.Admin:
                return "Admin";
            case ChatRole.Moderator:
                return "Moderator";
            default:
                return "Member";
        }
    };

    const canKickParticipant = (participantRole: ChatRole, participantId: string) => {
        // Can't kick yourself
        if (participantId === currentUserId) return false;
        // Must be admin or moderator
        if (currentUserRole > ChatRole.Moderator) return false;
        // Can only kick users with lower rank
        return currentUserRole < participantRole;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <label className="label">
                    <span className="label-text font-medium">
                        Participants ({participants.length})
                    </span>
                </label>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {participants.map((participant) => (
                    <div
                        key={participant.userId}
                        className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg border border-default hover:border-primary/30 transition-colors"
                    >
                        {/* Avatar */}
                        <div className="avatar placeholder">
                            <div className="bg-neutral text-neutral-content rounded-full w-10">
                                {participant.avatarUrl ? (
                                    <Image
                                        className="w-10 h-10 rounded-full object-cover"
                                        unoptimized
                                        src={participant.avatarUrl}
                                        alt={participant.username}
                                    />
                                ) : (
                                    <span className="text-sm">
                                        {participant.username.substring(0, 2).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <div className="font-medium text-primary">
                                {participant.username}
                                {participant.userId === currentUserId && (
                                    <span className="text-xs text-muted ml-1">(You)</span>
                                )}
                            </div>
                            <div className="text-xs text-muted">{participant.email}</div>
                        </div>

                        {/* Role Badge */}
                        <div className={`badge ${getRoleBadgeColor(participant.chatRole)}`}>
                            {getRoleLabel(participant.chatRole)}
                        </div>

                        {/* Actions */}
                        {canKickParticipant(participant.chatRole, participant.userId) && (
                            <button
                                onClick={() => onKickUser(participant.userId, participant.username)}
                                className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                                title="Remove from chat"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
