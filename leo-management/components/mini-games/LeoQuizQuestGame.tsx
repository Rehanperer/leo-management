"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Volume2, VolumeX, BrainCircuit, Check, X } from "lucide-react";
import { ArcadeButton, RetroText } from "./ArcadeUI";
import { useGameSound } from "./useGameSound";

// Game Constants
const QUESTION_TIME = 15; // seconds

type GameState = "MENU" | "PLAYING" | "GAME_OVER";

interface Question {
    id: number;
    question: string;
    options: string[];
    correct: number; // Index
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        question: "What does L.E.O stand for?",
        options: ["Leadership, Experience, Opportunity", "Love, Empathy, Optimism", "Leaders, Entrepreneurs, Organizers", "Life, Energy, Order"],
        correct: 0,
    },
    {
        id: 2,
        question: "In which year was the first Leo Club formed?",
        options: ["1957", "1967", "1977", "1987"],
        correct: 0,
    },
    {
        id: 3,
        question: "Which country hosted the first Leo Club?",
        options: ["United Kingdom", "Australia", "USA", "Japan"],
        correct: 2,
    },
    {
        id: 4,
        question: "What is the Leo Club motto?",
        options: ["We Serve", "Leadership, Experience, Opportunity", "Be Prepared", "Service Above Self"],
        correct: 1,
    },
    {
        id: 5,
        question: "Who sponsors a Leo Club?",
        options: ["Rotary Club", "Lions Club", "Kiwanis Club", "Optimist Club"],
        correct: 1,
    },
    {
        id: 6,
        question: "What are the two types of Leo Clubs?",
        options: ["Alpha and Beta", "Junior and Senior", "School-based and Community-based", "Local and International"],
        correct: 0,
    },
    {
        id: 7,
        question: "What is the age range for Alpha Leo Club members?",
        options: ["12-18 years", "12-30 years", "18-30 years", "16-25 years"],
        correct: 0,
    },
    {
        id: 8,
        question: "What is the age range for Beta Leo Club members?",
        options: ["12-18 years", "18-30 years", "16-25 years", "21-35 years"],
        correct: 1,
    },
    {
        id: 9,
        question: "Which city was home to the first Leo Club?",
        options: ["New York", "Los Angeles", "Abington, Pennsylvania", "Chicago"],
        correct: 2,
    },
    {
        id: 10,
        question: "What is one of the core values of Leo Clubs?",
        options: ["Competition", "Kindness", "Profit", "Independence"],
        correct: 1,
    },
    {
        id: 11,
        question: "How many Leo Clubs are there worldwide approximately?",
        options: ["Over 5,000", "Over 7,000", "Over 10,000", "Over 15,000"],
        correct: 1,
    },
    {
        id: 12,
        question: "What is the primary focus of Leo Clubs?",
        options: ["Academic excellence", "Community service", "Sports achievement", "Political activism"],
        correct: 1,
    },
    {
        id: 13,
        question: "Leo Clubs are part of which larger organization?",
        options: ["Rotary International", "Lions Clubs International", "UNESCO", "Red Cross"],
        correct: 1,
    },
    {
        id: 14,
        question: "What leadership skill do Leo Clubs emphasize?",
        options: ["Delegation", "All of these", "Communication", "Problem-solving"],
        correct: 1,
    },
    {
        id: 15,
        question: "What is the Leo Club slogan?",
        options: ["Be the change", "Leadership in Action", "Service First", "Together We Serve"],
        correct: 1,
    },
    {
        id: 16,
        question: "How often do most Leo Clubs meet?",
        options: ["Daily", "Weekly", "Monthly", "Quarterly"],
        correct: 2,
    },
    {
        id: 17,
        question: "What is a key benefit of joining a Leo Club?",
        options: ["Free travel", "Networking opportunities", "Academic credits", "Financial rewards"],
        correct: 1,
    },
    {
        id: 18,
        question: "Which of these is a typical Leo Club project?",
        options: ["Food drives", "All of these", "Environmental cleanups", "Youth mentoring"],
        correct: 1,
    },
    {
        id: 19,
        question: "What quality does Leo Club membership develop?",
        options: ["Athletic ability", "Civic responsibility", "Musical talent", "Artistic skill"],
        correct: 1,
    },
    {
        id: 20,
        question: "Leo Clubs promote leadership through:",
        options: ["Lectures only", "Hands-on service", "Online courses", "Written exams"],
        correct: 1,
    },
];

export const LeoQuizQuestGame = ({ onBack }: { onBack: () => void }) => {
    const [gameState, setGameState] = useState<GameState>("MENU");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const { playClick, playScore, playGameOver, playCoinInsert, isMuted, toggleMute } = useGameSound();

    // Timer
    useEffect(() => {
        if (gameState !== "PLAYING" || isAnswered) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleAnswer(-1); // Time out
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, isAnswered, currentQuestionIndex]);

    const handleAnswer = (optionIndex: number) => {
        if (isAnswered) return;

        setIsAnswered(true);
        setSelectedOption(optionIndex);

        const currentQuestion = QUESTIONS[currentQuestionIndex];
        if (optionIndex === currentQuestion.correct) {
            playScore();
            setScore((prev) => prev + 100 + timeLeft * 10);
        } else {
            playGameOver(); // Wrong answer sound
        }

        // Next Question Delay
        setTimeout(() => {
            if (currentQuestionIndex < QUESTIONS.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1);
                setTimeLeft(QUESTION_TIME);
                setIsAnswered(false);
                setSelectedOption(null);
            } else {
                setGameState("GAME_OVER");
            }
        }, 2000);
    };

    const startGame = () => {
        playCoinInsert();
        setScore(0);
        setCurrentQuestionIndex(0);
        setTimeLeft(QUESTION_TIME);
        setIsAnswered(false);
        setSelectedOption(null);
        setGameState("PLAYING");
    };

    const currentQuestion = QUESTIONS[currentQuestionIndex];

    return (
        <div className="relative w-full h-full min-h-[600px] bg-slate-900 rounded-xl overflow-hidden border-4 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col select-none">
            {/* HUD */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-slate-900/80 backdrop-blur-sm z-10 border-b border-cyan-500/30">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    <RetroText className="text-xl font-bold">{score.toString().padStart(5, '0')}</RetroText>
                </div>
                <div className="flex items-center gap-4">
                    <RetroText className={`text-xl font-bold ${timeLeft < 5 ? "text-red-500 animate-pulse" : "text-cyan-400"}`}>
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
            <div className="relative flex-1 flex flex-col items-center justify-center bg-slate-950 p-8">

                <AnimatePresence mode="wait">
                    {gameState === "PLAYING" && (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full max-w-2xl"
                        >
                            <div className="mb-8 p-6 bg-slate-900/50 border-2 border-cyan-500/30 rounded-lg">
                                <RetroText variant="h2" className="text-2xl text-center leading-relaxed">
                                    {currentQuestion.question}
                                </RetroText>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentQuestion.options.map((option, index) => {
                                    let variant: "primary" | "secondary" | "danger" = "secondary";
                                    if (isAnswered) {
                                        if (index === currentQuestion.correct) variant = "primary"; // Show correct
                                        else if (index === selectedOption) variant = "danger"; // Show wrong
                                    }

                                    return (
                                        <ArcadeButton
                                            key={index}
                                            onClick={() => handleAnswer(index)}
                                            variant={variant}
                                            className={`w-full py-4 text-sm md:text-base normal-case tracking-normal ${isAnswered ? "cursor-default" : ""}`}
                                            disabled={isAnswered}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>{option}</span>
                                                {isAnswered && index === currentQuestion.correct && <Check className="w-5 h-5" />}
                                                {isAnswered && index === selectedOption && index !== currentQuestion.correct && <X className="w-5 h-5" />}
                                            </div>
                                        </ArcadeButton>
                                    );
                                })}
                            </div>

                            <div className="mt-8 text-center text-slate-500 text-sm font-mono">
                                QUESTION {currentQuestionIndex + 1} OF {QUESTIONS.length}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Menu Overlay */}
                {gameState === "MENU" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <BrainCircuit className="w-16 h-16 text-cyan-400 mb-4" />
                        <RetroText variant="h1" glow className="text-5xl mb-8 text-center">
                            LEO QUIZ
                        </RetroText>
                        <p className="text-slate-400 mb-8 max-w-md text-center font-mono">
                            Test your knowledge about Leo Clubs and Leadership!
                        </p>
                        <ArcadeButton onClick={startGame} className="text-xl px-12 py-4">
                            INSERT COIN
                        </ArcadeButton>
                    </div>
                )}

                {/* Game Over Overlay */}
                {gameState === "GAME_OVER" && (
                    <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-20">
                        <RetroText variant="h1" className="text-5xl mb-4 text-cyan-400">
                            QUIZ COMPLETE!
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
