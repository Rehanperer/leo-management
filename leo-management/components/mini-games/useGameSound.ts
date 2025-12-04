"use client";

import useSound from "use-sound";
import { useState, useCallback } from "react";

// Placeholder URLs for sound effects (using short, open-source 8-bit sounds)
// In a real app, these would be local files in /public/sounds/
const SOUNDS = {
    click: "https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3", // Click
    score: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3", // Coin
    gameOver: "https://assets.mixkit.co/active_storage/sfx/213/213-preview.mp3", // Retro Game Over
    start: "https://assets.mixkit.co/active_storage/sfx/1182/1182-preview.mp3", // Power up
    jump: "https://assets.mixkit.co/active_storage/sfx/216/216-preview.mp3", // Jump Coin
};

export const useGameSound = () => {
    const [isMuted, setIsMuted] = useState(false);

    const [playClick] = useSound(SOUNDS.click, { volume: 0.5, soundEnabled: !isMuted });
    const [playScore] = useSound(SOUNDS.score, { volume: 0.4, soundEnabled: !isMuted });
    const [playGameOver] = useSound(SOUNDS.gameOver, { volume: 0.6, soundEnabled: !isMuted });
    const [playStart] = useSound(SOUNDS.start, { volume: 0.5, soundEnabled: !isMuted });

    // New specific sounds
    const [playJump] = useSound(SOUNDS.jump, { volume: 0.4, soundEnabled: !isMuted });
    const [playPlace] = useSound(SOUNDS.click, { volume: 0.6, soundEnabled: !isMuted, playbackRate: 0.5 }); // Low pitch click = Thud

    const toggleMute = useCallback(() => {
        setIsMuted((prev) => !prev);
    }, []);

    return {
        playClick,
        playScore,
        playGameOver,
        playStart,
        playJump,
        playPlace,
        isMuted,
        toggleMute,
    };
};
