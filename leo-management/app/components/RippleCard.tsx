'use client';

import Link from 'next/link';
import { MouseEvent, ReactNode } from 'react';

interface RippleCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
}

export default function RippleCard({ children, className = '', onClick, href }: RippleCardProps) {
    const createRipple = (event: MouseEvent<HTMLElement>) => {
        const card = event.currentTarget;
        const ripple = document.createElement('span');

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple-effect', 'animate-ripple');

        card.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);

        if (onClick) {
            onClick();
        }
    };

    if (href) {
        return (
            <Link
                href={href}
                className={`ripple-container block ${className}`}
                onClick={createRipple}
            >
                {children}
            </Link>
        );
    }

    return (
        <div
            className={`ripple-container ${className}`}
            onClick={createRipple}
        >
            {children}
        </div>
    );
}
