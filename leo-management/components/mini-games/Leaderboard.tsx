"use client";

import React, { useEffect, useState } from "react";
import { RetroText, ArcadeButton } from "./ArcadeUI";
import { motion } from "framer-motion";
import { Trophy, Loader2 } from "lucide-react";

interface LeaderboardEntry {
    id: string;
    playerName: string;
    score: number;
    createdAt: string;
}

interface LeaderboardProps {
    gameId: string;
    currentScore?: number;
    onClose: () => void;
}

export const Leaderboard = ({ gameId, currentScore, onClose }: LeaderboardProps) => {
    const [scores, setScores] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [playerName, setPlayerName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        fetchScores();
    }, [gameId]);

    const fetchScores = async () => {
        try {
            const res = await fetch(`/api/leaderboard?gameId=${gameId}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                setScores(data);
            } else {
                console.error("Invalid leaderboard data:", data);
                setScores([]);
            }
        } catch (error) {
            console.error("Failed to load leaderboard", error);
            setScores([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitScore = async () => {
        if (!playerName.trim() || !currentScore) return;

        setSubmitting(true);
        try {
            await fetch("/api/leaderboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    gameId,
                    playerName,
                    score: currentScore,
                }),
            });
            setSubmitted(true);
            fetchScores(); // Refresh list
        } catch (error) {
            console.error("Failed to submit score", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 bg-slate-900/95 z-40 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <div className="flex justify-between items-center mb-6">
                    <RetroText variant="h2" glow className="text-2xl">
                        HIGH SCORES
                    </RetroText>
                    <Trophy className="text-yellow-400" />
                </div>

                {/* Submit Score Section */}
                {currentScore !== undefined && !submitted && (
                    <div className="mb-8 p-4 bg-slate-800/50 rounded border border-cyan-500/30">
                        <RetroText className="text-center mb-2 text-sm text-slate-400">
                            NEW SCORE
                        </RetroText>
                        <RetroText variant="h1" glow className="text-4xl text-center mb-4 text-yellow-400">
                            {currentScore}
                        </RetroText>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={10}
                                placeholder="ENTER INITIALS"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                                className="flex-1 bg-slate-950 border border-cyan-500/50 rounded px-3 py-2 text-cyan-400 font-mono text-center uppercase focus:outline-none focus:border-cyan-400"
                            />
                            <ArcadeButton
                                onClick={handleSubmitScore}
                                disabled={submitting || !playerName}
                                className="text-sm py-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : "SAVE"}
                            </ArcadeButton>
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">LOADING...</div>
                    ) : scores.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">NO SCORES YET</div>
                    ) : (
                        scores.map((entry, index) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`flex justify-between items-center p-2 rounded ${index === 0 ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-slate-800/30"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-mono font-bold w-6 text-right ${index === 0 ? "text-yellow-400" :
                                        index === 1 ? "text-slate-300" :
                                            index === 2 ? "text-amber-600" : "text-slate-500"
                                        }`}>
                                        {index + 1}.
                                    </span>
                                    <span className="font-mono text-cyan-300 tracking-wider">
                                        {entry.playerName}
                                    </span>
                                </div>
                                <span className="font-mono text-white font-bold">
                                    {entry.score.toLocaleString()}
                                </span>
                            </motion.div>
                        ))
                    )}
                </div>

                <ArcadeButton onClick={onClose} variant="secondary" className="w-full">
                    CLOSE
                </ArcadeButton>
            </div>
        </div>
    );
};
