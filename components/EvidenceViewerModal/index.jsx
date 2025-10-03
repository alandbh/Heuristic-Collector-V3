import { useEffect, useState, useRef } from "react";
import { ImageIcon, VideoIcon } from "../Icons";
import Image from "next/image";

export default function EvidenceViewerModal({
  isOpen,
  onClose,
  selectedFiles = [],
  thumbnailUrls = {},
  loading = false,
  error = null,
  initialFileIndex = 0,
}) {
  const [currentFileIndex, setCurrentFileIndex] = useState(initialFileIndex);

  // Filtra apenas arquivos que têm dados de thumbnail carregados
  const filesWithThumbnails = selectedFiles.filter(
    (file) => thumbnailUrls[file.id]
  );

  // Valida e ajusta o índice inicial se necessário
  const validInitialIndex = Math.min(
    Math.max(0, initialFileIndex),
    Math.max(0, filesWithThumbnails.length - 1)
  );

  const currentFile = filesWithThumbnails[currentFileIndex];
  const currentFileData = currentFile ? thumbnailUrls[currentFile.id] : null;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      setCurrentFileIndex(validInitialIndex); // Usa o índice inicial validado
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, validInitialIndex]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    // Overlay
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl flex flex-col gap-4 relative w-full max-w-4xl max-h-[90vh] p-6">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-0 right-0 z-10 text-slate-500/70 text-2xl py-0 px-2 rounded-md hover:text-gray-800 "
        >
          <span>&times;</span>
        </button>

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
            {/* File Preview */}
            <div className="flex-1 flex justify-center items-center min-h-0">
              {currentFileData ? (
                <div className="w-full h-full flex flex-col items-center">
                  {currentFileData.type === "video" ? (
                    <div className="w-full max-w-4xl">
                      <div
                        className="relative"
                        style={{ paddingBottom: "56.25%" }}
                      >
                        <iframe
                          src={currentFileData.embedUrl}
                          width="100%"
                          height="100%"
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            border: 0,
                          }}
                          allow="fullscreen"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full h-full max-w-4xl max-h-[70vh] flex justify-center items-center">
                      {/* <img
                                                src={currentFileData.url}
                                                alt={currentFileData.name}
                                                style={{
                                                    maxWidth: "100%",
                                                    maxHeight: "100%",
                                                    objectFit: "contain"
                                                }}
                                                className="rounded-lg"
                                                onError={(e) => {
                                                    console.error("Error loading image:", e);
                                                    e.target.style.display = 'none';
                                                }}
                                            /> */}
                      {/* tailwind class for ratio 9:16 */}

                      <div className="w-full h-[500px] relative">
                        <Image
                          src={currentFileData.url}
                          layout="fill"
                          objectFit="contain"
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
                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                          index === currentFileIndex
                            ? "border-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {fileData ? (
                          <div className="w-16 h-16 relative">
                            <Image
                              src={fileData.url}
                              layout="fill"
                              objectFit="cover"
                            />
                          </div>
                        ) : (
                          //   <img
                          //     src={fileData.url}
                          //     alt={fileData.name}
                          //     style={{
                          //       width: "100%",
                          //       height: "100%",
                          //       objectFit: "cover",
                          //     }}
                          //     onError={(e) => {
                          //       console.error("Error loading thumbnail:", e);
                          //       e.target.style.display = "none";
                          //     }}
                          //   />
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
      </div>
    </div>
  );
}
