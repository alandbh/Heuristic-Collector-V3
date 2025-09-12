import { useEffect, useState, useRef } from "react";
import Spinner from "../Spinner";
import Debug from "../Debug";
import Image from "next/image";
import { ImageIcon, VideoIcon } from "../Icons";
import { legacyEmeaPlayers } from "./remea1";
import { BtnSmallPrimary } from "../Button";

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
    const [initialSelectedFiles, setInitialSelectedFiles] = useState([]);
    const [tempSelectedFiles, setTempSelectedFiles] = useState([]);
    const searchInputRef = useRef(null);

    const handlePreview = (file) => {
        console.log(file);
        setPreviewFile(file);
    };

    const handleBack = () => {
        setPreviewFile(null);
    };

    const handleApply = () => {
        onSelectionChange(tempSelectedFiles);
        setSearchTerm(""); // Limpa a busca ao fechar
        setPreviewFile(null); // Limpa o preview ao fechar
        onClose();
    };

    const handleCancel = () => {
        setTempSelectedFiles([...initialSelectedFiles]); // Reverte para seleções iniciais
        setSearchTerm(""); // Limpa a busca ao fechar
        setPreviewFile(null); // Limpa o preview ao fechar
        onClose();
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
        // Captura as seleções iniciais quando a modal abre
        setInitialSelectedFiles([...selectedFiles]);
        setTempSelectedFiles([...selectedFiles]);
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
            setTempSelectedFiles([...tempSelectedFiles, fileObj]);
        } else {
            setTempSelectedFiles(
                tempSelectedFiles.filter((item) => item.id !== fileObj.id)
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
                                                checked={tempSelectedFiles.some(
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
                                    No files with
                                    {`"${searchTerm}"`}.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    
                    <BtnSmallPrimary outline={true} onClick={handleCancel} textActive={"Cancel"} />
                    <BtnSmallPrimary onClick={handleApply} textActive={"Apply Selection"} />
                </div>
            </div>
        </div>
    );
}



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

    const specialProjectSlugs = ["retail-emea-1", "health", "finance-spla-1"];
    const isSpecialProject = specialProjectSlugs.includes(currentProject.slug);

    const _currentPlayer = isSpecialProject
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
