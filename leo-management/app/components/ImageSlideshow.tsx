'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSlideshowProps {
    images: string[];
    autoPlay?: boolean;
    interval?: number;
    compact?: boolean; // For grid view (smaller)
}

export default function ImageSlideshow({
    images,
    autoPlay = true,
    interval = 3000,
    compact = false,
}: ImageSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!autoPlay || images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, images.length]);

    if (!images || images.length === 0) {
        return null;
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className={`relative group ${compact ? 'h-32' : 'h-48'} rounded-lg overflow-hidden bg-gray-100`}>
            {/* Images */}
            <div className="relative w-full h-full">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <img
                            src={image}
                            alt={`Project image ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows - Show only if multiple images */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goToPrevious();
                        }}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 ${compact ? 'p-1' : 'p-2'
                            }`}
                        type="button"
                    >
                        <ChevronLeft className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            goToNext();
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 ${compact ? 'p-1' : 'p-2'
                            }`}
                        type="button"
                    >
                        <ChevronRight className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
                    </button>
                </>
            )}

            {/* Dots Navigation - Show only if multiple images */}
            {images.length > 1 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                goToSlide(index);
                            }}
                            className={`transition-all ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'
                                } rounded-full ${index === currentIndex
                                    ? 'bg-white scale-110'
                                    : 'bg-white/50 hover:bg-white/75'
                                }`}
                            type="button"
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
                <div className={`absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-white rounded-full ${compact ? 'text-xs' : 'text-sm'
                    }`}>
                    {currentIndex + 1}/{images.length}
                </div>
            )}
        </div>
    );
}
