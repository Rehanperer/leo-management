"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Volume2, VolumeX, Map, User, Flag } from "lucide-react";
import { ArcadeButton, RetroText } from "./ArcadeUI";
import { useGameSound } from "./useGameSound";

// Game Constants
const GRID_SIZE = 15;
const CELL_SIZE = 30; // px

type CellType = "EMPTY" | "WALL" | "START" | "END";
type GameState = "MENU" | "PLAYING" | "GAME_OVER";

// Simple Maze Layout (1 = Wall, 0 = Empty)
const LEVEL_1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const LynkMazeGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<GameState>("MENU");
    const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    const { playClick, playScore, playGameOver, playStart, playJump, isMuted, toggleMute } = useGameSound();

    // Game Loop (Timer)
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    playGameOver();
                    setGameState("GAME_OVER");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, playGameOver]);

    const movePlayer = useCallback((dx: number, dy: number) => {
        if (gameState !== "PLAYING") return;

        const newX = playerPos.x + dx;
        const newY = playerPos.y + dy;

        // Check bounds and walls
        if (
            newY >= 0 && newY < GRID_SIZE &&
            newX >= 0 && newX < GRID_SIZE &&
            LEVEL_1[newY][newX] !== 1
        ) {
            setPlayerPos({ x: newX, y: newY });
            playClick(); // Step sound

            // Check Win Condition (Bottom Right)
            if (newX === 13 && newY === 13) {
                setScore((prev) => prev + timeLeft * 10);
                playScore();
                setGameState("GAME_OVER");
            }
        }
    }, [gameState, playerPos, timeLeft, playClick, playScore]);

    // Keyboard Controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowUp": movePlayer(0, -1); break;
                case "ArrowDown": movePlayer(0, 1); break;
                case "ArrowLeft": movePlayer(-1, 0); break;
                case "ArrowRight": movePlayer(1, 0); break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [movePlayer]);

    const startGame = () => {
        playStart();
        setScore(0);
        setTimeLeft(60);
        setPlayerPos({ x: 1, y: 1 });
        setGameState("PLAYING");
    };

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-900 rounded-xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col select-none">
            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm z-10 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    <RetroText className="text-xl font-bold">{score.toString().padStart(5, '0')}</RetroText>
                </div>
                <div className="flex items-center gap-4">
                    <RetroText className={`text-xl font-bold ${timeLeft < 10 ? "text-red-500 animate-pulse" : "text-cyan-400"}`}>
                        {timeLeft}s
                    </RetroText>
                    <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-cyan-400 hover:text-cyan-300">
                        {isMuted ? <VolumeX /> : <Volume2 />}
                    </button>
                    <ArcadeButton onClick={(e) => { e.stopPropagation(); onBack(); }} variant="secondary" className="px-3 py-1 text-xs">
                        EXIT
                    </ArcadeButton>
                </div>
            </div>

            {/* Game World */}
            <div className="relative flex-1 flex items-center justify-center bg-slate-950 p-8">
                <div
                    className="relative bg-slate-900 border-2 border-cyan-500/50 p-1"
                    style={{
                        width: GRID_SIZE * CELL_SIZE + 10,
                        height: GRID_SIZE * CELL_SIZE + 10
                    }}
                >
                    {LEVEL_1.map((row, y) => (
                        row.map((cell, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={`absolute w-[30px] h-[30px] border-[0.5px] border-slate-800/50
                            ${cell === 1 ? "bg-cyan-900/50 shadow-[inset_0_0_5px_rgba(6,182,212,0.3)]" : "bg-transparent"}
                        `}
                                style={{ left: x * CELL_SIZE, top: y * CELL_SIZE }}
                            />
                        ))
                    ))}

                    {/* Goal */}
                    <div
                        className="absolute w-[30px] h-[30px] flex items-center justify-center animate-pulse"
                        style={{ left: 13 * CELL_SIZE, top: 13 * CELL_SIZE }}
                    >
                        <Flag className="text-yellow-400 w-5 h-5" />
                    </div>

                    {/* Player */}
                    <motion.div
                        initial={false}
                        animate={{ left: playerPos.x * CELL_SIZE, top: playerPos.y * CELL_SIZE }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute w-[30px] h-[30px] flex items-center justify-center z-10"
                    >
                        <div className="w-5 h-5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                    </motion.div>
                </div>

                {/* Controls Overlay (Mobile) */}
                <div className="absolute bottom-8 right-8 grid grid-cols-3 gap-2 md:hidden">
                    <div />
                    <ArcadeButton onClick={() => movePlayer(0, -1)} className="p-4">↑</ArcadeButton>
                    <div />
                    <ArcadeButton onClick={() => movePlayer(-1, 0)} className="p-4">←</ArcadeButton>
                    <ArcadeButton onClick={() => movePlayer(0, 1)} className="p-4">↓</ArcadeButton>
                    <ArcadeButton onClick={() => movePlayer(1, 0)} className="p-4">→</ArcadeButton>
                </div>

                {/* Menu Overlay */}
                {gameState === "MENU" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <Map className="w-16 h-16 text-cyan-400 mb-4" />
                        <RetroText variant="h1" glow className="text-5xl mb-8 text-center">
                            LYNK MAZE
                        </RetroText>
                        <p className="text-slate-400 mb-8 max-w-md text-center font-mono">
                            Navigate the maze to find the flag. Use arrow keys or buttons.
                        </p>
                        <ArcadeButton onClick={startGame} className="text-xl px-12 py-4">
                            START MAZE
                        </ArcadeButton>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <RetroText variant="h1" className="text-5xl mb-4 text-cyan-400">
                            {timeLeft > 0 ? "MAZE CLEARED!" : "TIME UP!"}
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
