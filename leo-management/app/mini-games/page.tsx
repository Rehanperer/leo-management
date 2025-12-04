"use client";

import React, { useState } from "react";
import { CRTEffect, RetroText } from "@/components/mini-games/ArcadeUI";
import { GameCard } from "@/components/mini-games/GameCard";
import { ServeSprintGame } from "@/components/mini-games/ServeSprintGame";
import { ProjectBuilderGame } from "@/components/mini-games/ProjectBuilderGame";
import { LionsDashGame } from "@/components/mini-games/LionsDashGame";
import { LynkMazeGame } from "@/components/mini-games/LynkMazeGame";
import { LeoQuizQuestGame } from "@/components/mini-games/LeoQuizQuestGame";
import { LeoPacGame } from "@/components/mini-games/LeoPacGame";
import { Zap, Layers, Activity, Map, BrainCircuit, Ghost } from "lucide-react";






export default function MiniGamesPage() {
    const [activeGame, setActiveGame] = useState<string | null>(null);

    const games = [
        {
            id: "serve-sprint",
            title: "Serve Sprint",
            description: "Fast-paced clicker! Tap hearts, books, and service icons before they fade.",
            icon: Zap,
            color: "cyan",
            component: ServeSprintGame,
        },
        {
            id: "project-builder",
            title: "Project Builder",
            description: "Stack the blocks perfectly to build the tallest service project.",
            icon: Layers,
            color: "blue",
            component: ProjectBuilderGame,
        },
        {
            id: "lions-dash",
            title: "Lion's Dash",
            description: "Endless runner. Jump over obstacles and collect power-ups.",
            icon: Activity,
            color: "indigo",
            component: LionsDashGame,
        },

        {
            id: "lynk-maze",
            title: "Lynk Maze",
            description: "Navigate the maze to connect the nodes.",
            icon: Map,
            color: "emerald",
            component: LynkMazeGame,
        },
        {
            id: "leo-quiz",
            title: "Leo Quiz Quest",
            description: "Test your knowledge about Leo Clubs and Leadership.",
            icon: BrainCircuit,
            color: "pink",
            component: LeoQuizQuestGame,
        },
        {
            id: "leo-pac",
            title: "Leo Pac",
            description: "Classic arcade action! Eat pellets, avoid ghosts, and survive.",
            icon: Ghost,
            color: "yellow",
            component: LeoPacGame,
        },
    ];

    const ActiveComponent = games.find((g) => g.id === activeGame)?.component;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans relative selection:bg-cyan-500/30">
            <CRTEffect />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-12 text-center space-y-4">
                    <RetroText variant="h1" glow className="text-4xl md:text-6xl font-black tracking-tighter">
                        LEO ARCADE
                    </RetroText>
                    <p className="text-slate-400 max-w-2xl mx-auto font-mono text-sm md:text-base">
                        LEVEL UP YOUR LEADERSHIP SKILLS. SELECT A GAME TO START.
                    </p>
                </header>

                {/* Main Content */}
                {activeGame && ActiveComponent ? (
                    <div className="w-full max-w-4xl mx-auto h-[700px]">
                        <ActiveComponent onBack={() => setActiveGame(null)} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {games.map((game) => (
                            <GameCard
                                key={game.id}
                                title={game.title}
                                description={game.description}
                                icon={game.icon}
                                color={game.color}
                                onPlay={() => setActiveGame(game.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
