"use client";

import React from "react";
import { ArcadeCard, ArcadeButton, RetroText } from "./ArcadeUI";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface GameCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    onPlay: () => void;
}

export const GameCard = ({ title, description, icon: Icon, color, onPlay }: GameCardProps) => {
    return (
        <ArcadeCard className="h-full flex flex-col justify-between gap-4 group">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-${color}-500/20 text-${color}-400 border border-${color}-500/50`}>
                        <Icon size={32} />
                    </div>
                    <RetroText variant="h3" glow className="text-xl font-bold">
                        {title}
                    </RetroText>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-mono">
                    {description}
                </p>
            </div>

            <div className="pt-4">
                <ArcadeButton onClick={onPlay} className="w-full flex items-center justify-center gap-2">
                    <span>Insert Coin</span>
                </ArcadeButton>
            </div>

            {/* Hover Glow Effect */}
            <motion.div
                className={`absolute inset-0 bg-${color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
            />
        </ArcadeCard>
    );
};
