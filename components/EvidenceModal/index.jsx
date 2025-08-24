import { use, useState, useEffect } from "react";

export default function EvidenceModal({
    isOpen,
    onClose,
    files,
    selectedFiles,
    evidenceList,
    onSelectionChange,
    onSaveEvidence,
    saveEvidenceOnLocalStorage,
}) {
    if (!isOpen || !files) return null;

    const [selectedFilesState, setSelectedFilesState] = useState(evidenceList);

    useEffect(() => {
        onSelectionChange(selectedFilesState);
        saveEvidenceOnLocalStorage(selectedFilesState);
    }, [selectedFilesState]);

    const handleCheckboxChange = (e, file) => {
        if (e.target.checked) {
            setSelectedFilesState((prev) => [
                ...prev,
                { fileName: file.name, fileId: file.id },
            ]);
            // onSelectionChange([
            //     ...selectedFiles,
            //     { fileName: file.name, fileId: file.id },
            // ]);
        } else {
            onSelectionChange(
                setSelectedFilesState((prev) =>
                    prev.filter((fileItem) => fileItem.fileId !== file.id)
                )
            );
        }
    };

    function handleClickSaveSelection() {
        onSaveEvidence(selectedFilesState);

        onClose();
    }

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
                                checked={selectedFilesState?.some(
                                    (storedFile) =>
                                        storedFile.fileId === file.id
                                )}
                                onChange={(e) => handleCheckboxChange(e, file)}
                                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            {/* <Checkbox
                                file={file}
                                selectedFiles={selectedFiles}
                                handleCheckboxChange={handleCheckboxChange}
                            /> */}
                            {/* File Icon and Name */}
                            <span className="text-gray-700">
                                {file.type === "video" ? "📹" : "🖼️"}{" "}
                                {file.name}
                            </span>
                        </label>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-gray-200 pt-4">
                    <button
                        onClick={handleClickSaveSelection}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                        Save selection
                    </button>
                </div>
            </div>
        </div>
    );
}

const Checkbox = ({ file, selectedFiles, handleCheckboxChange }) => {
    const isChecked =
        selectedFiles?.some(
            (selectedFile) => selectedFile.fileName === file.name
        ) || false;

    return (
        <input
            type="checkbox"
            id={file.id}
            checked={isChecked}
            onChange={(e) => handleCheckboxChange(e, file)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
    );
};
