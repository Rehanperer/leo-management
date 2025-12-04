"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

// ... (CRTEffect and RetroText remain unchanged)

// --- Arcade Button ---
interface ArcadeButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "danger";
}

export const ArcadeButton = ({
    children,
    className,
    variant = "primary",
    ...props
}: ArcadeButtonProps) => {
    const variants = {
        primary: "bg-cyan-500 border-cyan-400 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]",
        secondary: "bg-slate-800 border-slate-600 text-cyan-400 hover:bg-slate-700 hover:border-cyan-400",
        danger: "bg-red-500 border-red-400 text-white hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "relative px-6 py-3 border-b-4 border-r-4 active:border-b-0 active:border-r-0 active:translate-y-1 active:translate-x-1 font-bold uppercase tracking-widest transition-colors rounded-sm",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
};

// --- Arcade Card ---
export const ArcadeCard = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative bg-slate-900 border-2 border-cyan-500/30 rounded-lg p-6 overflow-hidden group hover:border-cyan-400 transition-colors",
                "shadow-[0_0_20px_rgba(0,0,0,0.5)]",
                className
            )}
        >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

            {children}
        </div>
    );
};
