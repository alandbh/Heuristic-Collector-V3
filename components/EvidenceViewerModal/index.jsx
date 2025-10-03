import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ImageIcon, VideoIcon } from "../Icons";
import { BtnSmallPrimary } from "../Button";

export default function EvidenceViewerModal({
    isOpen,
    onClose,
    selectedFiles = [],
    thumbnailUrls = {},
    loading = false,
    error = null,
}) {
    const [currentFileIndex, setCurrentFileIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Filtra apenas arquivos que têm dados de thumbnail carregados
    const filesWithThumbnails = selectedFiles.filter(file => thumbnailUrls[file.id]);

    const currentFile = filesWithThumbnails[currentFileIndex];
    const currentFileData = currentFile ? thumbnailUrls[currentFile.id] : null;

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("overflow-hidden");
            setCurrentFileIndex(0); // Reset para o primeiro arquivo
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isOpen]);

    const handlePrevious = () => {
        setCurrentFileIndex((prev) => 
            prev > 0 ? prev - 1 : filesWithThumbnails.length - 1
        );
    };

    const handleNext = () => {
        setCurrentFileIndex((prev) => 
            prev < filesWithThumbnails.length - 1 ? prev + 1 : 0
        );
    };

    const handleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    const handleClose = () => {
        setIsFullscreen(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        // Overlay
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            {/* Modal */}
            <div className={`bg-white rounded-lg shadow-xl flex flex-col gap-4 ${
                isFullscreen 
                    ? "w-full h-full max-w-none max-h-none rounded-none" 
                    : "w-full max-w-4xl max-h-[90vh] p-6"
            }`}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClose}
                            className="text-slate-500/70 text-2xl py-1 px-2 rounded-md hover:text-gray-800 hover:bg-slate-100"
                        >
                            <span>×</span>
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Evidence Files ({filesWithThumbnails.length})
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleFullscreen}
                            className="text-slate-500/70 px-3 py-1 rounded-md hover:text-gray-800 hover:bg-slate-100 text-sm"
                        >
                            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading evidence files...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">Error loading files: {error}</p>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : filesWithThumbnails.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <p className="text-gray-600 mb-4">No evidence files available</p>
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 flex-1 min-h-0">
                        {/* File Navigation */}
                        {filesWithThumbnails.length > 1 && (
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={handlePrevious}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                                >
                                    <span>←</span> Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    {currentFileIndex + 1} of {filesWithThumbnails.length}
                                </span>
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                                >
                                    Next <span>→</span>
                                </button>
                            </div>
                        )}

                        {/* File Preview */}
                        <div className="flex-1 flex justify-center items-center min-h-0">
                            {currentFileData ? (
                                <div className="w-full h-full flex flex-col items-center">
                                    {currentFileData.type === "video" ? (
                                        <div className="w-full max-w-4xl">
                                            <div className="relative" style={{ paddingBottom: "56.25%" }}>
                                                <iframe
                                                    src={currentFileData.embedUrl}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ 
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        border: 0 
                                                    }}
                                                    allow="fullscreen"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative w-full h-full max-w-4xl max-h-[70vh] flex justify-center items-center">
                                            <div className="w-[200px] h-[500px] relative">
                                                <Image
                                                    src={currentFileData.url}
                                                    alt={currentFileData.name}
                                                    layout="fill"
                                                    objectFit="contain"
                                                    className="rounded-lg"
                                                    unoptimized={true}
                                                    onError={(e) => {
                                                        console.error("Error loading image:", e);
                                                        // Fallback: try to load as regular img if Next.js Image fails
                                                        const img = e.target;
                                                        img.style.display = 'none';
                                                        const fallbackImg = document.createElement('img');
                                                        fallbackImg.src = currentFileData.url;
                                                        fallbackImg.alt = currentFileData.name;
                                                        fallbackImg.style.maxWidth = '100%';
                                                        fallbackImg.style.maxHeight = '100%';
                                                        fallbackImg.style.objectFit = 'contain';
                                                        fallbackImg.className = 'rounded-lg';
                                                        img.parentNode.appendChild(fallbackImg);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-600">Loading file...</p>
                                </div>
                            )}
                        </div>

                        {/* File Info */}
                        {currentFileData && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center gap-3">
                                    {currentFileData.type === "video" ? (
                                        <VideoIcon />
                                    ) : (
                                        <ImageIcon />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">
                                            {currentFileData.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 capitalize">
                                            {currentFileData.type} file
                                        </p>
                                    </div>
                                    <a
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={`https://drive.google.com/open?id=${currentFileData.id}&usp=drive_fs`}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                                    >
                                        Open in Google Drive
                                    </a>
                                </div>
                            </div>
                        )}

                        {/* Thumbnail Strip */}
                        {filesWithThumbnails.length > 1 && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {filesWithThumbnails.map((file, index) => {
                                        const fileData = thumbnailUrls[file.id];
                                        return (
                                            <button
                                                key={file.id}
                                                onClick={() => setCurrentFileIndex(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                                                    index === currentFileIndex
                                                        ? "border-blue-500"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                {fileData ? (
                                                    <Image
                                                        src={fileData.url}
                                                        alt={fileData.name}
                                                        width={80}
                                                        height={80}
                                                        style={{ objectFit: "cover" }}
                                                        unoptimized={true}
                                                        onError={(e) => {
                                                            console.error("Error loading thumbnail:", e);
                                                            e.target.style.display = 'none';
                                                            const fallbackImg = document.createElement('img');
                                                            fallbackImg.src = fileData.url;
                                                            fallbackImg.alt = fileData.name;
                                                            fallbackImg.style.width = '100%';
                                                            fallbackImg.style.height = '100%';
                                                            fallbackImg.style.objectFit = 'cover';
                                                            e.target.parentNode.appendChild(fallbackImg);
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                        <ImageIcon />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <BtnSmallPrimary 
                        outline={true} 
                        onClick={handleClose} 
                        textActive="Close" 
                    />
                </div>
            </div>
        </div>
    );
}
