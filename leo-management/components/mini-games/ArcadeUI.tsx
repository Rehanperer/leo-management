"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// --- CRT Overlay Effect ---
export const CRTEffect = () => (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden h-full w-full">
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_4px,3px_100%] pointer-events-none" />
        {/* Flicker/Noise (Subtle) */}
        <div className="absolute inset-0 bg-white opacity-[0.02] animate-pulse pointer-events-none" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </div>
);

// --- Retro Text ---
interface RetroTextProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    variant?: "h1" | "h2" | "h3" | "p";
    glow?: boolean;
}

export const RetroText = ({
    children,
    className,
    variant = "p",
    glow = false,
    ...props
}: RetroTextProps) => {
    const Component = variant === "p" ? "p" : variant;

    return (
        <Component
            className={cn(
                "font-mono tracking-wider uppercase",
                glow && "drop-shadow-[0_0_10px_rgba(0,255,255,0.7)] text-cyan-400",
                !glow && "text-slate-200",
                className
            )}
            {...props}
        >
            {children}
        </Component>
    );
};

// --- Arcade Button ---
interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
