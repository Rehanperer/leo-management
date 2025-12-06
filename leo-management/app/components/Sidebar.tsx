'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Plus,
    FolderOpen,
    DollarSign,
    FileText,
    Users,
    Calendar,
    BrainCircuit,
    GraduationCap,
    LogOut,
    Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence } from 'framer-motion';

const menuItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard' },
    { name: 'New Project', icon: Plus, href: '/dashboard/projects/new' },
    { name: 'View Projects', icon: FolderOpen, href: '/dashboard/projects' },
    { name: 'Financial Records', icon: DollarSign, href: '/dashboard/financial' },
    { name: 'Reports', icon: FileText, href: '/dashboard/reports' },
    { name: 'Meetings', icon: Users, href: '/dashboard/meetings' },
    { name: 'Events', icon: Calendar, href: '/dashboard/events' },
    { name: 'Mindmaps', icon: BrainCircuit, href: '/dashboard/mindmap' },
    { name: 'D2 Resources', icon: GraduationCap, href: '/dashboard/classroom' },
];

function DockItem({
    mouseX,
    item,
    isActive
}: {
    mouseX: MotionValue;
    item: any;
    isActive: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
        return val - bounds.y - bounds.height / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setTooltipPos({
                top: rect.top + rect.height / 2,
                left: rect.right + 10
            });
        }
    };

    return (
        <Link
            href={item.href}
            className="w-full flex md:justify-center items-center mb-2 relative group px-4 md:px-0"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovered(false)}
        >
            <motion.div
                ref={ref}
                style={{ width, height: width }}
                className={`
                    flex items-center justify-center rounded-full transition-colors duration-200 flex-shrink-0
                    ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80'
                    }
                `}
            >
                <item.icon size={20} className={isActive ? 'text-white' : ''} />
            </motion.div>

            {/* Mobile Label */}
            <span className={`md:hidden ml-4 font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-700 dark:text-gray-200'}`}>
                {item.name}
            </span>

            {/* Desktop Tooltip (Portal) */}
            {mounted && isHovered && createPortal(
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: -10, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -10, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'fixed',
                                top: tooltipPos.top,
                                left: tooltipPos.left,
                                transform: 'translateY(-50%)',
                                zIndex: 9999
                            }}
                            className="hidden md:block pointer-events-none"
                        >
                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-gray-800 dark:text-white text-sm font-medium px-3 py-1.5 rounded-lg shadow-xl border border-white/20 dark:border-gray-700/30 flex items-center whitespace-nowrap -translate-y-1/2">
                                {item.name}
                                {/* Little triangle pointer */}
                                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-white/90 dark:bg-slate-800/90 rotate-45 border-l border-b border-white/20 dark:border-gray-700/30 transform" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </Link>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [logoClicks, setLogoClicks] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const mouseX = useMotionValue(Infinity);

    const handleLogoClick = () => {
        const newClicks = logoClicks + 1;
        setLogoClicks(newClicks);
        if (newClicks === 6) {
            router.push('/mini-games');
            setLogoClicks(0);
        }
    };

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-[100] p-3 min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-xl border border-white/20 text-gray-700 dark:text-gray-200 active:scale-95 transition-all"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <LogOut size={24} className="rotate-180" /> : <LayoutDashboard size={24} />}
            </button>

            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            <aside
                className={`
                    fixed md:relative inset-y-0 left-0 z-50
                    flex flex-col h-[100dvh] transition-all duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0 w-64 md:w-24' : '-translate-x-full md:translate-x-0 w-64 md:w-24'}
                    bg-white/40 dark:bg-slate-900/40
                    backdrop-blur-xl saturate-150 border-r border-white/20 shadow-2xl
                    items-center py-6
                `}
                onMouseMove={(e) => mouseX.set(e.clientY)}
                onMouseLeave={() => mouseX.set(Infinity)}
            >
                {/* Logo Section */}
                <div className="mb-8 flex flex-col items-center mt-12 md:mt-0">
                    <div
                        className="w-10 h-10 relative flex-shrink-0 cursor-pointer active:scale-95 transition-transform mb-2"
                        onClick={handleLogoClick}
                    >
                        <img src="/logo.png" alt="LeoLynk" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Navigation Items */}
                <div className="flex-1 flex flex-col items-center w-full gap-2 px-2 overflow-y-auto no-scrollbar">
                    {menuItems.map((item) => (
                        <DockItem
                            key={item.href}
                            mouseX={mouseX}
                            item={item}
                            isActive={pathname === item.href}
                        />
                    ))}
                </div>

                {/* User Profile & Logout */}
                <div className="mt-auto flex flex-col items-center gap-4 mb-4 w-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2">
                        <Link
                            href="/dashboard/settings"
                            className="p-2 rounded-full text-gray-500 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600 transition-colors"
                            title="Settings"
                        >
                            <Settings size={20} />
                        </Link>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
