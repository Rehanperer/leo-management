"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Volume2, VolumeX, Layers } from "lucide-react";
import { ArcadeButton, RetroText } from "./ArcadeUI";
import { useGameSound } from "./useGameSound";
import { Leaderboard } from "./Leaderboard";

// Game Constants
const INITIAL_WIDTH = 200;
const BLOCK_HEIGHT = 40;
const GAME_SPEED_INITIAL = 5;
const GAME_SPEED_INCREMENT = 0.2;
const CONTAINER_WIDTH = 400;

type GameState = "MENU" | "PLAYING" | "GAME_OVER";

interface Block {
    id: number;
    width: number;
    left: number;
    color: string;
}

export const ProjectBuilderGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<GameState>("MENU");
    const [score, setScore] = useState(0);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [currentBlockPos, setCurrentBlockPos] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);
    const [speed, setSpeed] = useState(GAME_SPEED_INITIAL);
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const requestRef = useRef<number>(0);
    const lastPlaceTime = useRef<number>(0); // For debouncing
    const { playClick, playScore, playGameOver, playStart, playPlace, isMuted, toggleMute } = useGameSound();

    const colors = ["bg-cyan-500", "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-fuchsia-500"];

    // Initialize Game
    const startGame = () => {
        playStart();
        setScore(0);
        setBlocks([{ id: 0, width: INITIAL_WIDTH, left: (CONTAINER_WIDTH - INITIAL_WIDTH) / 2, color: colors[0] }]);
        setCurrentBlockPos(0);
        setSpeed(GAME_SPEED_INITIAL);
        setGameState("PLAYING");
        setShowLeaderboard(false);
        lastPlaceTime.current = Date.now();
    };

    // Game Loop for moving block
    const animate = useCallback(() => {
        if (gameState !== "PLAYING") return;

        setCurrentBlockPos((prev) => {
            const next = prev + speed * direction;
            // Bounce off walls
            if (next > CONTAINER_WIDTH - (blocks[blocks.length - 1]?.width || INITIAL_WIDTH) || next < 0) {
                setDirection((d) => (d * -1) as 1 | -1);
            }
            return next;
        });

        requestRef.current = requestAnimationFrame(animate);
    }, [gameState, speed, direction, blocks]);

    useEffect(() => {
        if (gameState === "PLAYING") {
            requestRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [animate, gameState]);

    // Handle Place Block
    const placeBlock = (e?: React.MouseEvent | React.PointerEvent) => {
        if (e) e.stopPropagation();
        if (gameState !== "PLAYING") return;

        // Debounce: prevent double clicks
        const now = Date.now();
        if (now - lastPlaceTime.current < 200) return;
        lastPlaceTime.current = now;

        const prevBlock = blocks[blocks.length - 1];
        const currentWidth = prevBlock.width;
        const currentLeft = currentBlockPos;
        const prevLeft = prevBlock.left;

        // Calculate overlap
        const diff = currentLeft - prevLeft;
        const overlap = currentWidth - Math.abs(diff);

        if (overlap <= 0) {
            // Missed completely
            playGameOver();
            setGameState("GAME_OVER");
        } else {
            // Hit
            playPlace(); // Use specific sound
            setScore((s) => s + 1);
            setSpeed((s) => s + GAME_SPEED_INCREMENT);

            const newWidth = overlap;
            const newLeft = diff > 0 ? currentLeft : prevLeft;

            setBlocks((prev) => [
                ...prev,
                {
                    id: prev.length,
                    width: newWidth,
                    left: newLeft,
                    color: colors[prev.length % colors.length],
                },
            ]);

            // Reset position for next block based on new width
            setCurrentBlockPos(0);
        }
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-900 rounded-xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col">
            {/* HUD */}
            <div className="p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm z-10 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    <RetroText className="text-xl font-bold">{score.toString().padStart(3, '0')}</RetroText>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={toggleMute} className="text-cyan-400 hover:text-cyan-300">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </button>
                    <ArcadeButton onClick={onBack} variant="secondary" className="px-3 py-1 text-xs">
                        EXIT
                    </ArcadeButton>
                </div>
            </div>

            {/* Game Area */}
            <div
                className="flex-1 relative overflow-hidden cursor-pointer"
                onPointerDown={placeBlock}
            >
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-full flex flex-col-reverse items-center pb-10">
                    {/* Stacked Blocks */}
                    {blocks.map((block) => (
                        <motion.div
                            key={block.id}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`h-[40px] ${block.color} border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                            style={{ width: block.width, transform: `translateX(${block.left - (CONTAINER_WIDTH - block.width) / 2}px)` }} // Simplified positioning logic needed here, actually absolute is better
                        />
                    ))}

                    {/* Moving Block (Active) */}
                    {gameState === "PLAYING" && (
                        <div
                            className={`absolute bottom-[${blocks.length * 40 + 40}px] h-[40px] ${colors[blocks.length % colors.length]} border border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.5)]`}
                            style={{
                                width: blocks[blocks.length - 1]?.width || INITIAL_WIDTH,
                                left: currentBlockPos,
                                bottom: blocks.length * BLOCK_HEIGHT + 40 // Move up as stack grows
                            }}
                        />
                    )}

                    {/* Base Platform */}
                    <div className="w-full h-2 bg-slate-700 mt-2" />
                </div>

                {/* Since the stacking logic with flex-reverse and absolute positioning is tricky, let's use absolute for everything */}
                <div className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none">
                    <div className="relative w-[400px] h-full">
                        {blocks.map((block, i) => (
                            <div
                                key={block.id}
                                className={`absolute h-[40px] ${block.color} border border-white/20 transition-all duration-200`}
                                style={{
                                    width: block.width,
                                    left: block.left,
                                    bottom: i * BLOCK_HEIGHT
                                }}
                            />
                        ))}

                        {gameState === "PLAYING" && (
                            <div
                                className={`absolute h-[40px] ${colors[blocks.length % colors.length]} border border-white/50 z-10`}
                                style={{
                                    width: blocks[blocks.length - 1]?.width || INITIAL_WIDTH,
                                    left: currentBlockPos,
                                    bottom: blocks.length * BLOCK_HEIGHT
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Menu Overlay */}
                {gameState === "MENU" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20 cursor-default">
                        <Layers className="w-16 h-16 text-cyan-400 mb-4" />
                        <RetroText variant="h1" glow className="text-5xl mb-8 text-center">
                            PROJECT BUILDER
                        </RetroText>
                        <p className="text-slate-400 mb-8 max-w-md text-center font-mono">
                            Stack the blocks perfectly to build the tallest tower! Tap to place.
                        </p>
                        <div className="flex gap-4">
                            <ArcadeButton onClick={startGame} className="text-xl px-12 py-4">
                                START BUILDING
                            </ArcadeButton>
                            <ArcadeButton onClick={() => setShowLeaderboard(true)} variant="secondary">
                                LEADERBOARD
                            </ArcadeButton>
                        </div>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20 cursor-default">
                        <RetroText variant="h1" className="text-5xl mb-4 text-red-500">
                            CRASH!
                        </RetroText>
                        <RetroText variant="h2" glow className="text-4xl mb-8">
                            HEIGHT: {score}
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
