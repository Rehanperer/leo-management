"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Volume2, VolumeX, Activity, User } from "lucide-react";
import { ArcadeButton, RetroText } from "./ArcadeUI";
import { useGameSound } from "./useGameSound";

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const OBSTACLE_SPEED = 5;
const SPAWN_RATE = 1500; // ms

type GameState = "MENU" | "PLAYING" | "GAME_OVER";

interface Obstacle {
    id: number;
    x: number;
    height: number;
    width: number;
}

export const LionsDashGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<GameState>("MENU");
    const [score, setScore] = useState(0);
    const [playerY, setPlayerY] = useState(0);
    const [velocity, setVelocity] = useState(0);
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);
    const [isGrounded, setIsGrounded] = useState(true);

    const requestRef = useRef<number>(0);
    const lastSpawnTime = useRef<number>(0);
    const { playClick, playScore, playGameOver, playStart, playJump, isMuted, toggleMute } = useGameSound();

    // Game Loop
    const update = useCallback((time: number) => {
        if (gameState !== "PLAYING") return;

        // Physics
        setPlayerY((y) => {
            const newY = y + velocity;
            if (newY >= 0) {
                setVelocity(0);
                setIsGrounded(true);
                return 0;
            }
            return newY;
        });

        setVelocity((v) => v + GRAVITY);

        // Spawn Obstacles
        if (time - lastSpawnTime.current > SPAWN_RATE) {
            setObstacles((prev) => [
                ...prev,
                {
                    id: time,
                    x: 800, // Start off-screen
                    height: Math.random() > 0.5 ? 60 : 40,
                    width: 40,
                },
            ]);
            lastSpawnTime.current = time;
        }

        // Update Obstacles & Collision
        setObstacles((prev) => {
            const nextObstacles = prev
                .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
                .filter((obs) => obs.x > -100);

            // Collision Detection
            // Player box: x: 50, y: playerY (from bottom), w: 40, h: 60
            // Obstacle box: x: obs.x, y: 0, w: obs.width, h: obs.height
            const playerRect = { x: 50, y: Math.abs(playerY), w: 40, h: 60 };

            for (const obs of nextObstacles) {
                // Simple AABB collision
                // Note: playerY is negative (going up), so Math.abs(playerY) is height from ground
                // But in DOM, bottom: 0 is ground.
                // Player X is fixed at 50px from left.

                const playerLeft = 50;
                const playerRight = 50 + 40;
                const playerBottom = 0 + Math.abs(playerY); // Height from ground

                const obsLeft = obs.x;
                const obsRight = obs.x + obs.width;
                const obsTop = obs.height;

                if (
                    playerRight > obsLeft + 10 && // +10 buffer for forgiveness
                    playerLeft < obsRight - 10 &&
                    playerBottom < obsTop
                ) {
                    setGameState("GAME_OVER");
                    playGameOver();
                }
            }

            return nextObstacles;
        });

        // Score
        setScore((s) => s + 1);

        requestRef.current = requestAnimationFrame(update);
    }, [gameState, velocity, playerY, playGameOver]);

    useEffect(() => {
        if (gameState === "PLAYING") {
            requestRef.current = requestAnimationFrame(update);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, update]);

    const jump = () => {
        if (isGrounded && gameState === "PLAYING") {
            setVelocity(JUMP_FORCE);
            setIsGrounded(false);
            playJump(); // Jump sound
        }
    };

    const startGame = () => {
        playStart();
        setScore(0);
        setPlayerY(0);
        setVelocity(0);
        setObstacles([]);
        setGameState("PLAYING");
        lastSpawnTime.current = performance.now();
    };

    return (
        <div
            className="relative w-full h-full min-h-[600px] bg-slate-900 rounded-xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col select-none"
            onPointerDown={jump}
        >
            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm z-10 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    <RetroText className="text-xl font-bold">{Math.floor(score / 10).toString().padStart(5, '0')}</RetroText>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-cyan-400 hover:text-cyan-300">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </button>
                    <ArcadeButton onClick={(e) => { e.stopPropagation(); onBack(); }} variant="secondary" className="px-3 py-1 text-xs">
                        EXIT
                    </ArcadeButton>
                </div>
            </div>

            {/* Game World */}
            <div className="relative flex-1 overflow-hidden bg-slate-950">
                {/* Background Parallax Stars */}
                <div className="absolute inset-0 opacity-50">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-white rounded-full animate-pulse"
                            style={{
                                width: Math.random() * 3 + 1,
                                height: Math.random() * 3 + 1,
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDuration: `${Math.random() * 3 + 1}s`
                            }}
                        />
                    ))}
                </div>

                {/* Ground */}
                <div className="absolute bottom-0 w-full h-20 bg-slate-800 border-t-4 border-cyan-500/50">
                    <div className="w-full h-full bg-[linear-gradient(90deg,transparent_50%,rgba(6,182,212,0.1)_50%)] bg-[length:50px_100%] animate-[slide_1s_linear_infinite]" />
                </div>

                {/* Player */}
                <div
                    className="absolute left-[50px] bottom-[20px] w-[40px] h-[60px] bg-cyan-500 border-2 border-white/50 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center"
                    style={{ transform: `translateY(${playerY}px)` }}
                >
                    <User className="text-black w-8 h-8" />
                </div>

                {/* Obstacles */}
                {obstacles.map(obs => (
                    <div
                        key={obs.id}
                        className="absolute bottom-[20px] bg-red-500 border-2 border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        style={{
                            left: obs.x,
                            width: obs.width,
                            height: obs.height,
                        }}
                    />
                ))}

                {/* Menu Overlay */}
                {gameState === "MENU" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <Activity className="w-16 h-16 text-cyan-400 mb-4" />
                        <RetroText variant="h1" glow className="text-5xl mb-8 text-center">
                            LION'S DASH
                        </RetroText>
                        <p className="text-slate-400 mb-8 max-w-md text-center font-mono">
                            Run as far as you can! Tap to jump over obstacles.
                        </p>
                        <ArcadeButton onClick={(e) => { e.stopPropagation(); startGame(); }} className="text-xl px-12 py-4">
                            START RUNNING
                        </ArcadeButton>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <RetroText variant="h1" className="text-5xl mb-4 text-red-500">
                            CRASHED!
                        </RetroText>
                        <RetroText variant="h2" glow className="text-4xl mb-8">
                            SCORE: {Math.floor(score / 10)}
                        </RetroText>
                        <div className="flex gap-4">
                            <ArcadeButton onClick={(e) => { e.stopPropagation(); startGame(); }}>TRY AGAIN</ArcadeButton>
                            <ArcadeButton onClick={(e) => { e.stopPropagation(); onBack(); }} variant="secondary">
                                EXIT
                            </ArcadeButton>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
