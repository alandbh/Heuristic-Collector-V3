import { useEffect, useState } from "react";
import Spinner from "../Spinner";
import Debug from "../Debug";

export default function SelectFileModal({
    evidenceFolderId,
    currentPlayer,
    currentJourney,
    isOpen,
    onClose,
    onCancel,
    onInsert,
    // files,
    selectedFiles = [],
    onSelectionChange,
}) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

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

        // Fetch files from the API
        async function fetchFiles() {
            // https://heuristic-v4.vercel.app/api/listfolders?folderid=1JKf3bzWGCz27Jr4VBnJc94tr41o9QbwN
            console.log("ffffff FETCH");
            try {
                console.log("ffffff TRY");
                const response = await fetch(
                    `https://heuristic-v4.vercel.app/api/listfolders?folderid=${evidenceFolderId}`,
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
                    currentJourney
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

        fetchFiles();
    }, [isOpen]);

    const handleCheckboxChange = (e, fileObj) => {
        if (e.target.checked) {
            onSelectionChange([...selectedFiles, fileObj]);
        } else {
            onSelectionChange(
                selectedFiles.filter((item) => item.id !== fileObj.id)
            );
        }
    };

    if (!isOpen) return null;
    return (
        // Overlay
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
            {/* Modal */}
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Select the files
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500/70 px-5 py-1 rounded-md hover:text-gray-800 border border-slate-400 hover:bg-blue-100"
                    >
                        <span>Close</span>
                    </button>
                </div>

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
                ) : (
                    <div className="max-h-[400px] overflow-y-auto flex flex-col gap-2 pr-2 mb-4">
                        {files.map((file) => (
                            <label
                                key={file.id}
                                htmlFor={file.id}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    id={file.id}
                                    // checked={selectedFiles.includes(file.name)}
                                    checked={selectedFiles.some(
                                        (item) => item.id === file.id
                                    )}
                                    onChange={(e) =>
                                        handleCheckboxChange(e, file)
                                    }
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-gray-700">
                                    {file.type === "video" ? "📹" : "🖼️"}{" "}
                                    {file.name}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div className="__flex justify-end border-t border-gray-200 pt-4 hidden">
                    <button
                        onClick={onCancel}
                        className=" text-blue-500 font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onInsert}
                        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Insert
                    </button>
                </div>
            </div>
        </div>
    );
}

function getEvidenceFiles(driveData, currentPlayer, currentJourney) {
    const playerFolder = driveData.find((p) => p.name.trim() === currentPlayer);
    if (!playerFolder) return [];

    const journeyFolder = playerFolder.subfolders.find(
        (j) => j.name.trim() === currentJourney
    );
    if (!journeyFolder) return [];

    return journeyFolder.evidence;
}
