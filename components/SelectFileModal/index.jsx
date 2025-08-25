export default function SelectFileModal({
    isOpen,
    onClose,
    files,
    selectedFiles,
    onSelectionChange,
}) {
    if (!isOpen) return null;

    const handleCheckboxChange = (e, fileName) => {
        if (e.target.checked) {
            onSelectionChange([...selectedFiles, fileName]);
        } else {
            onSelectionChange(
                selectedFiles.filter((name) => name !== fileName)
            );
        }
    };

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
