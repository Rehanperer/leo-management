'use client';

import { ReactNode } from 'react';

export default function DashboardTemplate({ children }: { children: ReactNode }) {
    return (
        <div className="animate-slide-in-right">
            {children}
        </div>
    );
}
