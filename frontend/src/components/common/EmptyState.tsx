"use client";

import { ReactNode } from "react";

type EmptyStateProps = {
    icon: ReactNode;
    title: string;
    description: string;
    action?: { href: string; label: string };
};

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-medium text-primary mb-2">{title}</h3>
            <p className="text-muted mb-4">{description}</p>
            {action && (
                <a href={action.href} className="btn-primary">
                    {action.label}
                </a>
            )}
        </div>
    );
}