import { useEffect, useState, useRef } from "react";
import Spinner from "../Spinner";
import Debug from "../Debug";
import Image from "next/image";
import { ImageIcon, VideoIcon } from "../Icons";
import { legacyEmeaPlayers } from "./remea1";

const journeyMap = {
    "retail-emea-1": {
        "web-site": "SITE",
        "mobile-app": "APP",
    },
};

export default function SelectFileModal({
    currentProject,
    currentPlayer,
    currentJourney,
    isOpen,
    onClose,
    // files,
    selectedFiles = [],
    onSelectionChange,
}) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef(null);

    const handlePreview = (file) => {
        console.log(file);
        setPreviewFile(file);
    };

    const handleBack = () => {
        setPreviewFile(null);
    };

    const handleClose = () => {
        setSearchTerm(""); // Limpa a busca ao fechar
        setPreviewFile(null); // Limpa o preview ao fechar
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add("overflow-hidden");
        } else {
            document.body.classList.remove("overflow-hidden");
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        console.log("ffffff OPEN");
        if (files.length > 0) return;
        fetchFiles();

        // Fetch files from the API
    }, [isOpen]);

    useEffect(() => {
        setFiles([]);
        console.log("ffffff CHANGE JOURNEY");

        // Fetch files from the API
    }, [currentJourney, currentPlayer]);

    useEffect(() => {
        // Foca no campo de busca quando o modal abre e não está mais carregando
        if (isOpen && !loading && files.length > 0 && searchInputRef.current) {
            // Usamos um pequeno timeout para garantir que o elemento esteja 100% renderizado e visível no DOM,
            // especialmente se houver transições de CSS na abertura do modal.
            setTimeout(() => {
                searchInputRef.current.focus();
            }, 200);
        }
    }, [isOpen, loading, files.length]);

    async function fetchFiles() {
        setLoading(true);
        // https://heuristic-v4.vercel.app/api/listfolders?folderid=1JKf3bzWGCz27Jr4VBnJc94tr41o9QbwN
        console.log("ffffff FETCH");
        try {
            console.log("ffffff TRY");
            const response = await fetch(
                `/api/listfolders?folderid=${currentProject.evidenceFolderId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        api_key: "20rga25",
                    },
                    method: "GET",
                }
            );
            const driveData = await response.json();
            const evidenceFiles = getEvidenceFiles(
                driveData,
                currentPlayer,
                currentJourney,
                currentProject
            );
            // console.log("Fetched files:", evidenceFiles);
            setFiles(evidenceFiles || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching files:", error);
            setFiles([]);
            setErrorMessage("Failed to load files.");
        }
    }

    const handleCheckboxChange = (e, fileObj) => {
        if (e.target.checked) {
            onSelectionChange([...selectedFiles, fileObj]);
        } else {
            onSelectionChange(
                selectedFiles.filter((item) => item.id !== fileObj.id)
            );
        }
    };

    const filteredFiles = searchTerm
        ? files.filter((file) =>
              file.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : files;

    if (!isOpen) return null;
    return (
        // Overlay
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            {/* Modal */}
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col gap-4">
                {/* Header */}
                {previewFile ? (
                    <div className="flex items-center border-b border-gray-200 pb-3 gap-3">
                        <button
                            onClick={handleBack}
                            className="text-slate-500/70 text-2xl py-1 px-2 rounded-md hover:text-gray-800  hover:bg-slate-100"
                        >
                            <span>←</span>
                        </button>
                        <h2 className="text-lg font-semibold text-gray-800">
                            {previewFile.name}
                        </h2>
                    </div>
                ) : (
                    <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Select the files
                        </h2>
                        <button
                            onClick={() => fetchFiles()}
                            className="text-slate-500/70 px-5 py-1 rounded-md hover:text-gray-800 border border-slate-400 hover:bg-blue-100"
                        >
                            <span>Refresh</span>
                        </button>
                    </div>
                )}

                {/* Lista de Arquivos */}
                {loading ? (
                    <div className="flex gap-2 items-center">
                        <Spinner colorClass="blue-400" radius={14} thick={3} />{" "}
                        Getting Files From Drive...
                    </div>
                ) : errorMessage ? (
                    <p className="text-red-500">{errorMessage}</p>
                ) : files.length === 0 ? (
                    <p>Files not found.</p>
                ) : previewFile ? (
                    <div className="flex justify-center">
                        {previewFile.type === "video" ? (
                            <div className="flex flex-col gap-4 w-full justify-center">
                                <div className="relative">
                                    <iframe
                                        src={previewFile.embedUrl}
                                        width="100%"
                                        height="480" // ajuste a altura conforme necessário
                                        style={{ border: 0 }}
                                        allow="fullscreen"
                                    ></iframe>
                                </div>
                                <div className="flex justify-center">
                                    <a
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-500"
                                        href={`https://drive.google.com/open?id=${previewFile.id}&usp=drive_fs`}
                                    >
                                        Open in Google Drive
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="w-[200px] h-[500px] relative">
                                    <Image
                                        src={previewFile.url}
                                        layout="fill"
                                        objectFit="contain"
                                    />
                                </div>
                                <a
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500"
                                    href={`https://drive.google.com/open?id=${previewFile.id}&usp=drive_fs`}
                                >
                                    Open in Google Drive
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="mb-2">
                            <input
                                type="search"
                                ref={searchInputRef}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search files by name..."
                                className="w-full text-sm p-2 border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div className="max-h-[400px] overflow-y-auto flex flex-col gap-[2px] pr-2 mb-4">
                            {filteredFiles.length > 0 ? (
                                filteredFiles.map((file) => (
                                    <div
                                        className="flex items-center justify-between gap-3 py-2 px-3 rounded hover:bg-blue-50 [&:has(input:checked)]:bg-blue-200
        [&:has(input:checked)]:border-blue-500"
                                        key={file.id}
                                    >
                                        <label
                                            htmlFor={file.id}
                                            className="flex items-center cursor-pointer flex-1"
                                        >
                                            <input
                                                type="checkbox"
                                                id={file.id}
                                                checked={selectedFiles.some(
                                                    (item) =>
                                                        item.id === file.id
                                                )}
                                                onChange={(e) =>
                                                    handleCheckboxChange(
                                                        e,
                                                        file
                                                    )
                                                }
                                                className="invisible h-0 w-0 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-700 flex items-center gap-2 text-ellipsis text-sm">
                                                {file.type === "video" ? (
                                                    <VideoIcon />
                                                ) : (
                                                    <ImageIcon />
                                                )}{" "}
                                                {file.name}
                                            </span>
                                        </label>

                                        <button
                                            onClick={() => handlePreview(file)}
                                            className="text-sm border border-blue-500 rounded-full bg-transparent hover:bg-blue-100 text-blue-500 px-3"
                                        >
                                            Preview
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center p-4">
                                    Nenhum arquivo encontrado com o termo "
                                    {searchTerm}".
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 pt-4">
                    <button
                        onClick={handleClose}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// const ImageIcon = (props) => (
//     <svg
//         xmlns="http://www.w3.org/2000/svg"
//         style={{ width: "16px", height: "16px" }}
//         viewBox="0 0 16 16"
//         fill="red"
//     >
//         <path
//             fillRule="evenodd"
//             d="M16 14.222V1.778C16 .796 15.204 0 14.222 0H1.778C.796 0 0 .796 0 1.778v12.444C0 15.204.796 16 1.778 16h12.444c.982 0 1.778-.796 1.778-1.778M4.889 9.333l2.222 2.671L10.222 8l4 5.333H1.778l3.11-4z"
//             clipRule="evenodd"
//         ></path>
//     </svg>
// );

// const VideoIcon = (props) => (
//     <svg
//         xmlns="http://www.w3.org/2000/svg"
//         style={{ width: "16px", height: "16px" }}
//         viewBox="0 0 16 12"
//         fill="#3b82f6"
//     >
//         <path d="m12.8 0 1.6 3.2H12L10.4 0H8.8l1.6 3.2H8L6.4 0H4.8l1.6 3.2H4L2.4 0h-.8C.72 0 .008.72.008 1.6L0 11.2c0 .88.72 1.6 1.6 1.6h12.8c.88 0 1.6-.72 1.6-1.6V0z"></path>
//     </svg>
// );

function getEvidenceFiles(
    driveData,
    currentPlayer,
    currentJourney,
    currentProject
) {
    const _currentJourney =
        currentProject.startDate < 20250601
            ? journeyMap[currentProject.slug][currentJourney]
            : currentJourney;

    const _currentPlayer =
        currentProject.slug === "retail-emea-1" || "health" || "finance-spla-1"
            ? legacyEmeaPlayers.find(
                  (legacyPlayer) => legacyPlayer.slug === currentPlayer
              ).name
            : currentPlayer;

    const playerFolder = driveData.find(
        (p) => p.name.trim() === _currentPlayer.trim()
    );

    console.log("_currentJourney", { _currentPlayer, playerFolder });
    if (!playerFolder) return [];

    const journeyFolder =
        currentProject.slug === "finance-spla-1"
            ? playerFolder.subfolders[0]
            : playerFolder.subfolders.find(
                  (j) => j.name.trim() === _currentJourney
              );
    if (!journeyFolder) return [];

    return journeyFolder.evidence;
}
