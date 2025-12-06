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
    Settings,
    Shield
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { motion, useMotionValue, useSpring, useTransform, MotionValue, AnimatePresence } from 'framer-motion';

// Defined color palette type
type ItemColor = 'blue' | 'emerald' | 'amber' | 'green' | 'violet' | 'indigo' | 'rose' | 'pink' | 'cyan' | 'slate' | 'red';

interface MenuItem {
    name: string;
    icon: any;
    href: string;
    color: ItemColor;
}

const menuItems: MenuItem[] = [
    { name: 'Home', icon: LayoutDashboard, href: '/dashboard', color: 'blue' },
    { name: 'New Project', icon: Plus, href: '/dashboard/projects/new', color: 'emerald' },
    { name: 'View Projects', icon: FolderOpen, href: '/dashboard/projects', color: 'amber' },
    { name: 'Financial Records', icon: DollarSign, href: '/dashboard/financial', color: 'green' },
    { name: 'Reports', icon: FileText, href: '/dashboard/reports', color: 'violet' },
    { name: 'Meetings', icon: Users, href: '/dashboard/meetings', color: 'indigo' },
    { name: 'Events', icon: Calendar, href: '/dashboard/events', color: 'rose' },
    { name: 'Mindmaps', icon: BrainCircuit, href: '/dashboard/mindmap', color: 'pink' },
    { name: 'D2 Resources', icon: GraduationCap, href: '/dashboard/classroom', color: 'cyan' },
];

function getActiveClasses(color: ItemColor): string {
    switch (color) {
        case 'blue': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20';
        case 'emerald': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/20';
        case 'amber': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-500/20';
        case 'green': return 'bg-green-500/15 text-green-600 dark:text-green-400 shadow-lg shadow-green-500/20';
        case 'violet': return 'bg-violet-500/15 text-violet-600 dark:text-violet-400 shadow-lg shadow-violet-500/20';
        case 'indigo': return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-lg shadow-indigo-500/20';
        case 'rose': return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-lg shadow-rose-500/20';
        case 'pink': return 'bg-pink-500/15 text-pink-600 dark:text-pink-400 shadow-lg shadow-pink-500/20';
        case 'cyan': return 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 shadow-lg shadow-cyan-500/20';
        case 'red': return 'bg-red-500/15 text-red-600 dark:text-red-400 shadow-lg shadow-red-500/20';
        case 'slate': return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 shadow-lg shadow-slate-500/20';
        default: return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/20';
    }
}

function getMobileTextClass(color: ItemColor): string {
    switch (color) {
        case 'blue': return 'text-blue-600 dark:text-blue-400';
        case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
        case 'amber': return 'text-amber-600 dark:text-amber-400';
        case 'green': return 'text-green-600 dark:text-green-400';
        case 'violet': return 'text-violet-600 dark:text-violet-400';
        case 'indigo': return 'text-indigo-600 dark:text-indigo-400';
        case 'rose': return 'text-rose-600 dark:text-rose-400';
        case 'pink': return 'text-pink-600 dark:text-pink-400';
        case 'cyan': return 'text-cyan-600 dark:text-cyan-400';
        case 'red': return 'text-red-600 dark:text-red-400';
        case 'slate': return 'text-slate-600 dark:text-slate-400';
        default: return 'text-blue-600 dark:text-blue-400';
    }
}


function DockItem({
    mouseX,
    item,
    isActive
}: {
    mouseX: MotionValue;
    item: MenuItem;
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

    const activeClasses = getActiveClasses(item.color);
    const mobileTextClass = getMobileTextClass(item.color);

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
                        ? activeClasses
                        : 'bg-white/50 dark:bg-slate-800/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-slate-700/80'
                    }
                `}
            >
                <item.icon size={20} className={isActive ? 'currentColor' : ''} />
            </motion.div>

            {/* Mobile Label */}
            <span className={`md:hidden ml-4 font-medium transition-colors ${isActive ? mobileTextClass : 'text-gray-700 dark:text-gray-200'}`}>
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
                    {user?.role === 'admin' && (
                        <DockItem
                            mouseX={mouseX}
                            item={{ name: 'Admin Panel', icon: Shield, href: '/dashboard/admin', color: 'red' }}
                            isActive={pathname === '/dashboard/admin'}
                        />
                    )}
                </div>

                {/* User Profile & Logout */}
                <div className="mt-auto flex flex-col items-center gap-4 mb-4 w-full">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0 overflow-hidden">
                        {user?.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            user?.username?.[0]?.toUpperCase() || 'U'
                        )}
                    </div>

                    <div className="flex flex-row md:flex-col gap-2">
                        <Link
                            href="/dashboard/settings"
                            className="p-2 rounded-full text-gray-800 dark:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-blue-600 transition-colors"
                            title="Settings"
                        >
                            <Settings size={20} />
                        </Link>
                        <button
                            onClick={logout}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
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
