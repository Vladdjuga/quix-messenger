"use client";

type Link = { href: string; label: string; variant?: "primary" | "secondary" };

export default function FriendshipHeader({ title, links }: { title: string; links: Link[] }) {
    return (
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-2xl font-semibold text-primary mb-4 md:mb-0">{title}</h1>
            <div className="flex space-x-2">
                {links.map((link, i) => (
                    <a
                        key={i}
                        href={link.href}
                        className={link.variant === "primary" ? "btn-primary text-sm" : "btn-secondary text-sm"}
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        </div>
    );
}