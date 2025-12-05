'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ProjectImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export default function ProjectImageUpload({
    images,
    onChange,
    maxImages = 5
}: ProjectImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (files: FileList | null) => {
        if (!files) return;

        const remainingSlots = maxImages - images.length;
        const filesToProcess = Array.from(files).slice(0, remainingSlots);

        const newImages: string[] = [];
        for (const file of filesToProcess) {
            if (file.type.startsWith('image/')) {
                const base64 = await convertToBase64(file);
                newImages.push(base64);
            }
        }

        onChange([...images, ...newImages]);
    };

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeImage = (index: number) => {
        onChange(images.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {images.length < maxImages && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${isDragging
                            ? 'border-leo-500 bg-leo-50'
                            : 'border-gray-300 hover:border-leo-400 hover:bg-gray-50'
                        }`}
                >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB ({images.length}/{maxImages} images)
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />
                </div>
            )}

            {/* Image Previews */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                        >
                            <img
                                src={image}
                                alt={`Project image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                type="button"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white text-center">
                                    Image {index + 1}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Info Note */}
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <ImageIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                    {images.length === 0
                        ? `You can add up to ${maxImages} images to showcase your project. Images are optional but recommended for completed projects.`
                        : `${images.length} of ${maxImages} images added. ${images.length < maxImages
                            ? `You can add ${maxImages - images.length} more.`
                            : 'Maximum reached.'
                        }`}
                </p>
            </div>
        </div>
    );
}
