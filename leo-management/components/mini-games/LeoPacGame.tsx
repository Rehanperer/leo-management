"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Trophy, Volume2, VolumeX, Ghost, Heart } from "lucide-react";
import { ArcadeButton, RetroText } from "./ArcadeUI";
import { useGameSound } from "./useGameSound";

// Game Constants
const GRID_SIZE = 19;
const CELL_SIZE = 25;
const GHOST_COUNT = 4;

type GameState = "MENU" | "PLAYING" | "GAME_OVER";
type CellType = 0 | 1 | 2 | 3; // 0=empty, 1=wall, 2=pellet, 3=power pellet

interface Position {
    x: number;
    y: number;
}

interface Ghost {
    id: number;
    pos: Position;
    color: string;
    scared: boolean;
    lastDir: Position;
}

// Classic Pac-Man style maze
const MAZE: CellType[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 3, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0],
    [1, 1, 1, 1, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 2, 1],
    [1, 3, 2, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 1, 2, 3, 1],
    [1, 1, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 1, 1],
    [1, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const LeoPacGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<GameState>("MENU");
    const [playerPos, setPlayerPos] = useState<Position>({ x: 9, y: 16 });
    const [playerDir, setPlayerDir] = useState<Position>({ x: 0, y: 0 });
    const [ghosts, setGhosts] = useState<Ghost[]>([]);
    const [maze, setMaze] = useState<CellType[][]>(MAZE.map(row => [...row]));
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [powerMode, setPowerMode] = useState(false);
    const [pelletsLeft, setPelletsLeft] = useState(0);

    const { playClick, playScore, playGameOver, playStart, isMuted, toggleMute } = useGameSound();

    // Use refs to avoid stale closures
    const playerPosRef = useRef(playerPos);
    const playerDirRef = useRef(playerDir);
    const ghostsRef = useRef(ghosts);
    const mazeRef = useRef(maze);

    useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
    useEffect(() => { playerDirRef.current = playerDir; }, [playerDir]);
    useEffect(() => { ghostsRef.current = ghosts; }, [ghosts]);
    useEffect(() => { mazeRef.current = maze; }, [maze]);

    // Initialize ghosts
    const initializeGhosts = useCallback(() => {
        return [
            { id: 0, pos: { x: 8, y: 10 }, color: "#ef4444", scared: false, lastDir: { x: 0, y: 0 } },
            { id: 1, pos: { x: 10, y: 10 }, color: "#ec4899", scared: false, lastDir: { x: 0, y: 0 } },
            { id: 2, pos: { x: 9, y: 9 }, color: "#06b6d4", scared: false, lastDir: { x: 0, y: 0 } },
            { id: 3, pos: { x: 9, y: 11 }, color: "#f97316", scared: false, lastDir: { x: 0, y: 0 } },
        ];
    }, []);

    // Count pellets
    const countPellets = useCallback(() => {
        let count = 0;
        maze.forEach(row => {
            row.forEach(cell => {
                if (cell === 2 || cell === 3) count++;
            });
        });
        return count;
    }, [maze]);

    const startGame = () => {
        playStart();
        setMaze(MAZE.map(row => [...row]));
        setPlayerPos({ x: 9, y: 16 });
        setPlayerDir({ x: 0, y: 0 });
        setGhosts(initializeGhosts());
        setScore(0);
        setLives(3);
        setPowerMode(false);
        setPelletsLeft(countPellets());
        setGameState("PLAYING");
    };

    // Player movement
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        const interval = setInterval(() => {
            const dir = playerDirRef.current;
            if (dir.x === 0 && dir.y === 0) return;

            const currentPos = playerPosRef.current;
            const newX = currentPos.x + dir.x;
            const newY = currentPos.y + dir.y;

            // Wrap around edges
            let wrappedX = newX;
            let wrappedY = newY;
            if (newX < 0) wrappedX = GRID_SIZE - 1;
            if (newX >= GRID_SIZE) wrappedX = 0;
            if (newY < 0) wrappedY = MAZE.length - 1;
            if (newY >= MAZE.length) wrappedY = 0;

            // Check wall collision
            if (mazeRef.current[wrappedY]?.[wrappedX] === 1) return;

            setPlayerPos({ x: wrappedX, y: wrappedY });

            // Collect pellets
            const cell = mazeRef.current[wrappedY]?.[wrappedX];
            if (cell === 2) {
                playClick();
                setScore(s => s + 10);
                setPelletsLeft(p => p - 1);
                setMaze(prev => {
                    const newMaze = prev.map(row => [...row]);
                    newMaze[wrappedY][wrappedX] = 0;
                    return newMaze;
                });
            } else if (cell === 3) {
                playScore();
                setScore(s => s + 50);
                setPelletsLeft(p => p - 1);
                setPowerMode(true);
                setGhosts(prev => prev.map(g => ({ ...g, scared: true })));
                setMaze(prev => {
                    const newMaze = prev.map(row => [...row]);
                    newMaze[wrappedY][wrappedX] = 0;
                    return newMaze;
                });

                // Power mode timeout
                setTimeout(() => {
                    setPowerMode(false);
                    setGhosts(prev => prev.map(g => ({ ...g, scared: false })));
                }, 8000);
            }
        }, 150);

        return () => clearInterval(interval);
    }, [gameState, playClick, playScore]);

    // Ghost AI - Continuous movement with RAF
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        let lastUpdate = Date.now();
        let animationId: number;

        const updateGhosts = () => {
            const now = Date.now();
            const delta = now - lastUpdate;

            // Update every 230ms (slightly faster, more challenging)
            if (delta >= 230) {
                lastUpdate = now;

                setGhosts(prevGhosts => {
                    const currentPlayerPos = playerPosRef.current;
                    const currentPlayerDir = playerDirRef.current;
                    const currentMaze = mazeRef.current;

                    return prevGhosts.map((ghost, index) => {
                        const directions = [
                            { x: 0, y: -1 },
                            { x: 0, y: 1 },
                            { x: -1, y: 0 },
                            { x: 1, y: 0 },
                        ];

                        // Get valid directions (not walls)
                        const validDirs = directions.filter(dir => {
                            const newX = ghost.pos.x + dir.x;
                            const newY = ghost.pos.y + dir.y;
                            return newY >= 0 && newY < MAZE.length &&
                                newX >= 0 && newX < GRID_SIZE &&
                                currentMaze[newY][newX] !== 1;
                        });

                        if (validDirs.length === 0) return ghost;

                        // Prevent backtracking (180-degree turns) unless it's the only option
                        let dirsNoReverse = validDirs;
                        if (ghost.lastDir.x !== 0 || ghost.lastDir.y !== 0) {
                            const filtered = validDirs.filter(dir =>
                                !(dir.x === -ghost.lastDir.x && dir.y === -ghost.lastDir.y)
                            );
                            if (filtered.length > 0) {
                                dirsNoReverse = filtered;
                            }
                        }

                        // Filter out positions occupied by other ghosts (prefer unoccupied)
                        const dirsNotBlocked = dirsNoReverse.filter(dir => {
                            const newX = ghost.pos.x + dir.x;
                            const newY = ghost.pos.y + dir.y;
                            return !prevGhosts.some(g =>
                                g.id !== ghost.id &&
                                g.pos.x === newX &&
                                g.pos.y === newY
                            );
                        });

                        const availableDirs = dirsNotBlocked.length > 0 ? dirsNotBlocked : validDirs;

                        // Helper: Calculate distance with look-ahead to avoid dead ends
                        const scoreDirection = (dir: typeof directions[0], targetX: number, targetY: number, avoidPlayer: boolean = false) => {
                            const newX = ghost.pos.x + dir.x;
                            const newY = ghost.pos.y + dir.y;
                            const dist = Math.abs(newX - targetX) + Math.abs(newY - targetY);

                            // Look ahead 2 steps to avoid dead ends
                            const nextDirs = directions.filter(d => {
                                const nx = newX + d.x;
                                const ny = newY + d.y;
                                return ny >= 0 && ny < MAZE.length &&
                                    nx >= 0 && nx < GRID_SIZE &&
                                    currentMaze[ny][nx] !== 1;
                            });

                            const mobilityBonus = nextDirs.length * 5; // Prefer positions with more exits

                            if (avoidPlayer) {
                                return dist + mobilityBonus; // Higher is better
                            }
                            return -dist + mobilityBonus; // Higher score for closer + more exits
                        };

                        let chosenDir = availableDirs[0];

                        if (ghost.scared) {
                            // Run away intelligently - maximize distance while avoiding corners
                            let bestScore = -Infinity;
                            availableDirs.forEach(dir => {
                                const score = scoreDirection(dir, currentPlayerPos.x, currentPlayerPos.y, true);
                                if (score > bestScore) {
                                    bestScore = score;
                                    chosenDir = dir;
                                }
                            });
                        } else {
                            // Different AI strategies per ghost
                            switch (index) {
                                case 0: { // Red - Aggressive direct chaser (Blinky)
                                    let bestScore = -Infinity;
                                    availableDirs.forEach(dir => {
                                        const score = scoreDirection(dir, currentPlayerPos.x, currentPlayerPos.y);
                                        if (score > bestScore) {
                                            bestScore = score;
                                            chosenDir = dir;
                                        }
                                    });
                                    break;
                                }

                                case 1: { // Pink - Ambusher (Pinky)
                                    // Target 4 tiles ahead of player's direction
                                    const targetX = currentPlayerPos.x + currentPlayerDir.x * 4;
                                    const targetY = currentPlayerPos.y + currentPlayerDir.y * 4;

                                    let bestScore = -Infinity;
                                    availableDirs.forEach(dir => {
                                        const score = scoreDirection(dir, targetX, targetY);
                                        if (score > bestScore) {
                                            bestScore = score;
                                            chosenDir = dir;
                                        }
                                    });
                                    break;
                                }

                                case 2: { // Cyan - Strategic patroller (Inky)
                                    const distToPlayer = Math.abs(ghost.pos.x - currentPlayerPos.x) +
                                        Math.abs(ghost.pos.y - currentPlayerPos.y);

                                    if (distToPlayer < 10) {
                                        // Chase when close
                                        let bestScore = -Infinity;
                                        availableDirs.forEach(dir => {
                                            const score = scoreDirection(dir, currentPlayerPos.x, currentPlayerPos.y);
                                            if (score > bestScore) {
                                                bestScore = score;
                                                chosenDir = dir;
                                            }
                                        });
                                    } else {
                                        // Scatter to bottom-left corner when far
                                        const cornerX = 2;
                                        const cornerY = MAZE.length - 3;
                                        let bestScore = -Infinity;
                                        availableDirs.forEach(dir => {
                                            const score = scoreDirection(dir, cornerX, cornerY);
                                            if (score > bestScore) {
                                                bestScore = score;
                                                chosenDir = dir;
                                            }
                                        });
                                    }
                                    break;
                                }

                                case 3: { // Orange - Clyde-like behavior
                                    const distToPlayer = Math.abs(ghost.pos.x - currentPlayerPos.x) +
                                        Math.abs(ghost.pos.y - currentPlayerPos.y);

                                    if (distToPlayer > 8) {
                                        // Chase when far
                                        let bestScore = -Infinity;
                                        availableDirs.forEach(dir => {
                                            const score = scoreDirection(dir, currentPlayerPos.x, currentPlayerPos.y);
                                            if (score > bestScore) {
                                                bestScore = score;
                                                chosenDir = dir;
                                            }
                                        });
                                    } else {
                                        // Scatter to bottom-right when close
                                        const cornerX = GRID_SIZE - 3;
                                        const cornerY = MAZE.length - 3;
                                        let bestScore = -Infinity;
                                        availableDirs.forEach(dir => {
                                            const score = scoreDirection(dir, cornerX, cornerY);
                                            if (score > bestScore) {
                                                bestScore = score;
                                                chosenDir = dir;
                                            }
                                        });
                                    }
                                    break;
                                }
                            }
                        }

                        return {
                            ...ghost,
                            pos: {
                                x: ghost.pos.x + chosenDir.x,
                                y: ghost.pos.y + chosenDir.y,
                            },
                            lastDir: chosenDir,
                        };
                    });
                });
            }

            animationId = requestAnimationFrame(updateGhosts);
        };

        animationId = requestAnimationFrame(updateGhosts);
        return () => cancelAnimationFrame(animationId);
    }, [gameState]);

    // Check collisions with ghosts
    useEffect(() => {
        if (gameState !== "PLAYING") return;

        ghosts.forEach(ghost => {
            if (ghost.pos.x === playerPos.x && ghost.pos.y === playerPos.y) {
                if (ghost.scared) {
                    // Eat ghost
                    playScore();
                    setScore(s => s + 200);
                    setGhosts(prev => prev.map(g =>
                        g.id === ghost.id ? { ...g, pos: { x: 9, y: 9 }, scared: false, lastDir: { x: 0, y: 0 } } : g
                    ));
                } else {
                    // Lose life
                    playGameOver();
                    setLives(l => l - 1);
                    if (lives <= 1) {
                        setGameState("GAME_OVER");
                    } else {
                        setPlayerPos({ x: 9, y: 16 });
                        setGhosts(initializeGhosts());
                    }
                }
            }
        });
    }, [playerPos, ghosts, lives, gameState, playScore, playGameOver, initializeGhosts]);

    // Check win condition
    useEffect(() => {
        if (pelletsLeft === 0 && gameState === "PLAYING") {
            playScore();
            setGameState("GAME_OVER");
        }
    }, [pelletsLeft, gameState, playScore]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== "PLAYING") return;

            switch (e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    setPlayerDir({ x: 0, y: -1 });
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    setPlayerDir({ x: 0, y: 1 });
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    setPlayerDir({ x: -1, y: 0 });
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    setPlayerDir({ x: 1, y: 0 });
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [gameState]);

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-900 rounded-xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col select-none">
            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm z-10 border-b border-cyan-500/30">
                <div className="flex items-center gap-4">
                    <Trophy className="text-yellow-400" />
                    <RetroText className="text-xl font-bold">{score.toString().padStart(5, '0')}</RetroText>
                    <div className="flex gap-1 ml-4">
                        {Array.from({ length: lives }).map((_, i) => (
                            <Heart key={i} className="w-5 h-5 text-red-500 fill-red-500" />
                        ))}
                    </div>
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
            <div className="relative flex-1 flex items-center justify-center bg-black p-8">
                <div
                    className="relative bg-slate-950 border-2 border-cyan-500/50"
                    style={{
                        width: GRID_SIZE * CELL_SIZE,
                        height: MAZE.length * CELL_SIZE
                    }}
                >
                    {/* Maze */}
                    {maze.map((row, y) => (
                        row.map((cell, x) => (
                            <div
                                key={`${x}-${y}`}
                                className={`absolute
                                    ${cell === 1 ? "bg-blue-900 border border-blue-700" : ""}
                                `}
                                style={{
                                    left: x * CELL_SIZE,
                                    top: y * CELL_SIZE,
                                    width: CELL_SIZE,
                                    height: CELL_SIZE,
                                }}
                            >
                                {cell === 2 && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                                    </div>
                                )}
                                {cell === 3 && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                        ))
                    ))}

                    {/* Player */}
                    <motion.div
                        animate={{
                            left: playerPos.x * CELL_SIZE,
                            top: playerPos.y * CELL_SIZE
                        }}
                        transition={{ type: "tween", duration: 0.15 }}
                        className="absolute w-[25px] h-[25px] flex items-center justify-center z-20"
                    >
                        <div className="w-5 h-5 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                    </motion.div>

                    {/* Ghosts */}
                    {ghosts.map(ghost => (
                        <motion.div
                            key={ghost.id}
                            animate={{
                                left: ghost.pos.x * CELL_SIZE,
                                top: ghost.pos.y * CELL_SIZE
                            }}
                            transition={{ type: "tween", duration: 0.25 }}
                            className="absolute w-[25px] h-[25px] flex items-center justify-center z-10"
                        >
                            <Ghost
                                className="w-5 h-5"
                                style={{ color: ghost.scared ? "#60a5fa" : ghost.color }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Menu Overlay */}
                {gameState === "MENU" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <Ghost className="w-16 h-16 text-cyan-400 mb-4" />
                        <RetroText variant="h1" glow className="text-5xl mb-8 text-center">
                            LEO PAC
                        </RetroText>
                        <p className="text-slate-400 mb-4 max-w-md text-center font-mono">
                            Eat all the pellets while avoiding ghosts!
                        </p>
                        <p className="text-slate-400 mb-8 max-w-md text-center font-mono text-sm">
                            Use arrow keys or WASD to move. Eat power pellets to turn the tables!
                        </p>
                        <ArcadeButton onClick={startGame} className="text-xl px-12 py-4">
                            START GAME
                        </ArcadeButton>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <RetroText variant="h1" className={`text-5xl mb-4 ${pelletsLeft === 0 ? "text-green-400" : "text-red-500"}`}>
                            {pelletsLeft === 0 ? "YOU WIN!" : "GAME OVER!"}
                        </RetroText>
                        <RetroText variant="h2" glow className="text-4xl mb-8">
                            SCORE: {score}
                        </RetroText>
                        <div className="flex gap-4">
                            <ArcadeButton onClick={startGame}>PLAY AGAIN</ArcadeButton>
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
