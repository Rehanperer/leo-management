import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <img
                src="/logo.png"
                alt="Loading..."
                className={`${sizeClasses[size]} animate-spin object-contain`}
            />
        </div>
    );
}
