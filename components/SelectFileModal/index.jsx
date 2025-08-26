import { useEffect, useState } from "react";

export default function SelectFileModal({
    evidenceFolderId,
    currentPlayer,
    currentJourney,
    isOpen,
    onClose,
    // files,
    selectedFiles,
    onSelectionChange,
}) {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

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

    const handleCheckboxChange = (e, fileName) => {
        if (e.target.checked) {
            onSelectionChange([...selectedFiles, fileName]);
        } else {
            onSelectionChange(
                selectedFiles.filter((name) => name !== fileName)
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
                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Selecione as Evidências
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                {/* Lista de Arquivos */}
                {loading ? (
                    <p>Loading...</p>
                ) : errorMessage ? (
                    <p className="text-red-500">{errorMessage}</p>
                ) : files.length === 0 ? (
                    <p>Files not found.</p>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto flex flex-col gap-2 pr-2">
                        {files.map((file) => (
                            <label
                                key={file.id}
                                htmlFor={file.id}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    id={file.id}
                                    checked={selectedFiles.includes(file.name)}
                                    onChange={(e) =>
                                        handleCheckboxChange(e, file.name)
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
                <div className="flex justify-end border-t border-gray-200 pt-4">
                    <button
                        onClick={onClose}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Confirmar
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
