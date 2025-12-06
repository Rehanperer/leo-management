'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Calendar, Users, Clock, Heart, MapPin } from 'lucide-react';
import ImageSlideshow from '@/app/components/ImageSlideshow';

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    status: string;
    beneficiaries?: number;
    serviceHours?: number;
    participants?: number;
    photos?: string;
    club: { name: string };
    user: { username: string };
}

interface ProjectTimelineProps {
    projects: Project[];
}

export default function ProjectTimeline({ projects }: ProjectTimelineProps) {
    const [visibleProjects, setVisibleProjects] = useState<Set<number>>(new Set());
    const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Sort projects by date (newest first)
    const sortedProjects = [...projects].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute('data-index'));
                        setVisibleProjects((prev) => new Set([...prev, index]));
                    }
                });
            },
            { threshold: 0.1, rootMargin: '50px' }
        );

        projectRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, [sortedProjects.length]);

    const parsePhotos = (photosData: string | undefined) => {
        if (!photosData) return [];
        try {
            const parsed = JSON.parse(photosData);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    };

    if (sortedProjects.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Create your first project to see the timeline!</p>
                <Link href="/dashboard/projects/new" className="btn btn-primary">
                    Create Project
                </Link>
            </div>
        );
    }

    return (
        <div className="relative max-w-6xl mx-auto py-12">
            {/* Timeline Line */}
            <div
                ref={timelineRef}
                className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-leo-400 via-purple-400 to-leo-400 transform -translate-x-1/2 timeline-line"
            />

            {/* Projects */}
            <div className="space-y-16">
                {sortedProjects.map((project, index) => {
                    const isLeft = index % 2 !== 0; // Changed: first project on right (index 0 = right)
                    const isVisible = visibleProjects.has(index);
                    const projectDate = new Date(project.date);
                    const monthYear = projectDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                    return (
                        <div
                            key={project.id}
                            ref={(el) => {
                                projectRefs.current[index] = el;
                            }}
                            data-index={index}
                            className="relative"
                        >
                            {/* Timeline Date Marker */}
                            <div className="absolute left-8 md:left-1/2 top-0 transform -translate-x-1/2 z-10">
                                <div className={`timeline-dot ${isVisible ? 'timeline-dot-visible' : ''}`}>
                                    <div className="w-6 h-6 bg-gradient-to-br from-leo-500 to-purple-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                        <Calendar className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <div className={`hidden md:block absolute top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-md border border-leo-200 timeline-date ${isVisible ? 'timeline-date-visible' : ''}`}>
                                    <span className="text-sm font-semibold text-leo-600">{monthYear}</span>
                                </div>
                                {/* Mobile Date Label */}
                                <div className={`md:hidden absolute left-8 top-0 ml-4 whitespace-nowrap bg-white px-2 py-0.5 rounded-full shadow-sm border border-leo-100`}>
                                    <span className="text-xs font-semibold text-leo-600">{monthYear}</span>
                                </div>
                            </div>

                            {/* Project Card */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pl-16 md:pl-0">
                                {/* Show on LEFT side (index 1, 3, 5...) - Desktop Only logic mixed with Mobile */}
                                {isLeft && (
                                    <>
                                        <div className="text-left md:text-right md:pr-8">
                                            <Link
                                                href={`/dashboard/projects/${project.id}`}
                                                className={`block card hover:shadow-xl transition-all duration-300 cursor-pointer timeline-card ${isVisible ? 'timeline-card-visible' : ''
                                                    } timeline-card-right md:timeline-card-left`}
                                                style={{ transitionDelay: `${index * 100}ms` }}
                                            >
                                                {/* Project Images Slideshow */}
                                                {parsePhotos(project.photos).length > 0 && (
                                                    <div className="mb-4 -mx-6 -mt-6">
                                                        <ImageSlideshow images={parsePhotos(project.photos)} compact={false} />
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>

                                                {/* Project Title */}
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {project.title}
                                                </h3>

                                                {/* Category */}
                                                {project.category && (
                                                    <span className="inline-block px-2 py-1 bg-leo-100 text-leo-700 text-xs font-medium rounded mb-3">
                                                        {project.category}
                                                    </span>
                                                )}

                                                {/* Description */}
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {project.description}
                                                </p>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    {project.beneficiaries !== undefined && project.beneficiaries > 0 && (
                                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Heart className="w-4 h-4 text-green-600" />
                                                                <span className="text-xs text-green-700 font-medium">Beneficiaries</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-green-800">{project.beneficiaries.toLocaleString()}</p>
                                                        </div>
                                                    )}

                                                    {project.serviceHours !== undefined && project.serviceHours > 0 && (
                                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Clock className="w-4 h-4 text-blue-600" />
                                                                <span className="text-xs text-blue-700 font-medium">Hours</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-blue-800">{project.serviceHours}</p>
                                                        </div>
                                                    )}

                                                    {project.participants !== undefined && project.participants > 0 && (
                                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Users className="w-4 h-4 text-purple-600" />
                                                                <span className="text-xs text-purple-700 font-medium">Participants</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-purple-800">{project.participants}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer Info */}
                                                <div className="pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{project.club.name}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="hidden md:block" /> {/* Empty right side only on desktop */}
                                    </>
                                )}

                                {/* Show on RIGHT side (index 0, 2, 4...)*/}
                                {!isLeft && (
                                    <>
                                        <div className="hidden md:block" /> {/* Empty left side only on desktop */}
                                        <div className="text-left md:pl-8">
                                            <Link
                                                href={`/dashboard/projects/${project.id}`}
                                                className={`block card hover:shadow-xl transition-all duration-300 cursor-pointer timeline-card ${isVisible ? 'timeline-card-visible' : ''
                                                    } timeline-card-right`}
                                                style={{ transitionDelay: `${index * 100}ms` }}
                                            >
                                                {/* Project Images Slideshow */}
                                                {parsePhotos(project.photos).length > 0 && (
                                                    <div className="mb-4 -mx-6 -mt-6">
                                                        <ImageSlideshow images={parsePhotos(project.photos)} compact={false} />
                                                    </div>
                                                )}

                                                {/* Status Badge */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${project.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {project.status}
                                                    </span>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>

                                                {/* Project Title */}
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {project.title}
                                                </h3>

                                                {/* Category */}
                                                {project.category && (
                                                    <span className="inline-block px-2 py-1 bg-leo-100 text-leo-700 text-xs font-medium rounded mb-3">
                                                        {project.category}
                                                    </span>
                                                )}

                                                {/* Description */}
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {project.description}
                                                </p>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    {project.beneficiaries !== undefined && project.beneficiaries > 0 && (
                                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Heart className="w-4 h-4 text-green-600" />
                                                                <span className="text-xs text-green-700 font-medium">Beneficiaries</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-green-800">{project.beneficiaries.toLocaleString()}</p>
                                                        </div>
                                                    )}

                                                    {project.serviceHours !== undefined && project.serviceHours > 0 && (
                                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Clock className="w-4 h-4 text-blue-600" />
                                                                <span className="text-xs text-blue-700 font-medium">Hours</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-blue-800">{project.serviceHours}</p>
                                                        </div>
                                                    )}

                                                    {project.participants !== undefined && project.participants > 0 && (
                                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Users className="w-4 h-4 text-purple-600" />
                                                                <span className="text-xs text-purple-700 font-medium">Participants</span>
                                                            </div>
                                                            <p className="text-lg font-bold text-purple-800">{project.participants}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer Info */}
                                                <div className="pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{project.club.name}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .timeline-line {
                    animation: growDown 1s ease-out forwards;
                }

                @keyframes growDown {
                    from {
                        transform: translateX(-50%) scaleY(0);
                        transform-origin: top;
                    }
                    to {
                        transform: translateX(-50%) scaleY(1);
                        transform-origin: top;
                    }
                }

                .timeline-dot {
                    opacity: 0;
                    transform: scale(0);
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .timeline-dot-visible {
                    opacity: 1;
                    transform: scale(1);
                }

                .timeline-date {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-10px);
                    transition: all 0.5s ease-out 0.2s;
                }

                .timeline-date-visible {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }

                .timeline-card {
                    opacity: 0;
                    transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .timeline-card-left {
                    transform: translateX(50px);
                }

                .timeline-card-right {
                    transform: translateX(-50px);
                }

                .timeline-card-visible {
                    opacity: 1;
                    transform: translateX(0);
                }
            `}</style>
        </div>
    );
}
