"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, BookOpen, PawPrint, PenTool, HandHeart, Trophy, Timer, Volume2, VolumeX } from "lucide-react";
import { ArcadeButton, RetroText } from "./ArcadeUI";
import { useGameSound } from "./useGameSound";
import { Leaderboard } from "./Leaderboard";

// Game Constants
const GAME_DURATION = 30; // seconds
const SPAWN_INTERVAL = 800; // ms
const ITEM_LIFETIME = 2000; // ms

// Types
type GameState = "MENU" | "PLAYING" | "GAME_OVER";

interface SpawnItem {
    id: number;
    x: number;
    y: number;
    type: "heart" | "book" | "paw" | "pen" | "service";
}

export const ServeSprintGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<GameState>("MENU");
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
    const [items, setItems] = useState<SpawnItem[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const { playClick, playScore, playGameOver, playCoinInsert, isMuted, toggleMute } = useGameSound();

    // Icons mapping
    const icons = {
        heart: { icon: Heart, color: "text-red-400" },
        book: { icon: BookOpen, color: "text-blue-400" },
        paw: { icon: PawPrint, color: "text-amber-400" },
        pen: { icon: PenTool, color: "text-purple-400" },
        service: { icon: HandHeart, color: "text-cyan-400" },
    };

    // Spawn Logic
    const spawnItem = useCallback(() => {
        const types = Object.keys(icons) as Array<keyof typeof icons>;
        const type = types[Math.floor(Math.random() * types.length)];
        const id = Date.now() + Math.random();

        // Random position (padding to avoid edges)
        const x = Math.random() * 80 + 10; // 10% to 90%
        const y = Math.random() * 70 + 15; // 15% to 85%

        setItems((prev) => [...prev, { id, x, y, type }]);

        // Remove item after lifetime
        setTimeout(() => {
            setItems((prev) => prev.filter((item) => item.id !== id));
        }, ITEM_LIFETIME);
    }, []);

    // Game Loop
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        const spawnTimer = setInterval(spawnItem, SPAWN_INTERVAL);
        const gameTimer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setGameState("GAME_OVER");
                    playGameOver();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(spawnTimer);
            clearInterval(gameTimer);
        };
    }, [gameState, spawnItem, playGameOver]);

    const handleItemClick = (id: number) => {
        playScore();
        setScore((prev) => prev + 10);
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const startGame = () => {
        playCoinInsert();
        setScore(0);
        setTimeLeft(GAME_DURATION);
        setItems([]);
        setGameState("PLAYING");
        setShowLeaderboard(false);
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-900 rounded-xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm z-10 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    <RetroText className="text-xl font-bold">{score.toString().padStart(6, '0')}</RetroText>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Timer className={timeLeft < 10 ? "text-red-500 animate-pulse" : "text-cyan-400"} />
                        <RetroText className={`text-xl font-bold ${timeLeft < 10 ? "text-red-500" : ""}`}>
                            {timeLeft}s
                        </RetroText>
                    </div>
                    <button onClick={toggleMute} className="text-cyan-400 hover:text-cyan-300">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </button>
                    <ArcadeButton onClick={onBack} variant="secondary" className="px-3 py-1 text-xs">
                        EXIT
                    </ArcadeButton>
                </div>
            </div>

            {/* Game Area */}
            <div className="relative w-full h-full pt-20">
                <AnimatePresence>
                    {items.map((item) => {
                        const Icon = icons[item.type].icon;
                        return (
                            <motion.button
                                key={item.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onPointerDown={() => handleItemClick(item.id)}
                                className={`absolute p-4 rounded-full bg-slate-800/90 border-2 border-white/20 shadow-lg ${icons[item.type].color} cursor-pointer touch-manipulation`}
                                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                            >
                                <Icon size={32} strokeWidth={2.5} />
                            </motion.button>
                        );
                    })}
                </AnimatePresence>

                {/* Menu Overlay */}
                {gameState === "MENU" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <RetroText variant="h1" glow className="text-5xl mb-8 text-center">
                            SERVE SPRINT
                        </RetroText>
                        <p className="text-slate-400 mb-8 max-w-md text-center font-mono">
                            Tap the service icons as fast as you can! Don't let them fade away.
                        </p>
                        <div className="flex gap-4">
                            <ArcadeButton onClick={startGame} className="text-xl px-12 py-4">
                                INSERT COIN
                            </ArcadeButton>
                        </div>

                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <RetroText variant="h1" className="text-5xl mb-4 text-red-500">
                            GAME OVER
                        </RetroText>
                        <RetroText variant="h2" glow className="text-4xl mb-8">
                            SCORE: {score}
                        </RetroText>
                        <div className="flex gap-4">
                            <ArcadeButton onClick={startGame}>TRY AGAIN</ArcadeButton>
                            <ArcadeButton onClick={onBack} variant="secondary">
                                EXIT
                            </ArcadeButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
