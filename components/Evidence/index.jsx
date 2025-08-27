import { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { BtnSmallPrimary } from "../Button";
import SelectFileModal from "../SelectFileModal";
import Debug from "../Debug";
import { ImageIcon, VideoIcon } from "../Icons";

function Evidence({
    currentJourney,
    currentPlayer,
    openBox,
    text,
    evidenceUrl,
    evidenceFolderId,
    heuristicNumber,
    onChangeText,
    onChangeEvidenceUrl,
    onChangeSelectedEvidences,
    selectedFiles,
    onSaveEvidence,
    status,
    hid,
    disabled = false,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // const [selectedFiles, setSelectedFiles] = useState([]);
    const urlRef = useRef(null);
    const collapseRef = useRef(null);

    useEffect(() => {
        if (collapseRef) {
            if (openBox) {
                collapseRef.current.style.display = "block";
                collapseRef.current.style.transition = "0.3s";
                urlRef.current.focus();

                setTimeout(() => {
                    collapseRef.current.style.height =
                        collapseRef.current.scrollHeight + "px";
                    collapseRef.current.style.opacity = 1;
                }, 10);
            } else {
                collapseRef.current.style.height = "0px";
                collapseRef.current.style.opacity = 0;

                // setTimeout(() => {
                //     if (collapseRef.current !== null) {
                //         collapseRef.current.style.display = "none";
                //     }
                // }, 300);
            }
        }

        return;
    }, [openBox]);

    function moveCursorToTheEnd(target) {
        // target.selectionEnd = target.value.length;

        // Removing this feature until the analysis is complete.
        // Remove the return below

        return;

        target.scrollTop = target.scrollHeight;

        setTimeout(() => {
            target.selectionStart = target.value.length;
        }, 80);
    }

    function handleOnFocusText(target) {
        //Moving the cursor to the end of the textarea.

        moveCursorToTheEnd(target);
    }

    function handleOnClickText(target) {
        //Moving the cursor to the end of the textarea.
        moveCursorToTheEnd(target);
    }

    function onSelectionChange(newSelectedFiles) {
        // setSelectedFiles(newSelectedFiles);
        onChangeSelectedEvidences(newSelectedFiles);
        // onChangeEvidenceUrl(
        //     evidenceUrl + " // " + getSelectedFilesNames(newSelectedFiles)
        // );

        collapseRef.current.style.height =
            collapseRef.current.scrollHeight + "px";
        collapseRef.current.style.height = "auto";
    }

    function getSelectedFilesNames(_selectedFiles) {
        if (!_selectedFiles || _selectedFiles.length === 0) return "";

        return _selectedFiles
            .map((file) => file.name)
            .map((name) => name.split("-")[0])
            .join(", ");
    }

    function removeExtension(filename) {
        // Encontra a posição do último ponto.
        const lastDotIndex = filename.lastIndexOf(".");

        // Se não houver ponto (ou se for o primeiro caractere, como em ".htaccess"),
        // retorna a string original.
        if (lastDotIndex <= 0) {
            return filename;
        }

        // Retorna a parte da string antes do último ponto.
        return filename.slice(0, lastDotIndex);
    }

    return (
        <div
            className={`flex flex-col pb-5 gap-3 overflow-hidden justify-between`}
            ref={collapseRef}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-center items-center gap-5 mt-4">
                    <button
                        className="w-[200px] border border-blue-500 text-blue-500 rounded-full px-3 py-1 text-sm hover:bg-blue-100 "
                        onClick={() => setIsModalOpen(true)}
                    >
                        Select Evidence File(s)
                    </button>

                    {/* <Debug data={getThumb()} /> */}

                    <SelectFileModal
                        evidenceFolderId={evidenceFolderId}
                        currentJourney={currentJourney}
                        currentPlayer={currentPlayer}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        selectedFiles={selectedFiles}
                        onSelectionChange={onSelectionChange}
                    />
                    {selectedFiles && selectedFiles.length > 0 && (
                        <ul className="max-h-[400px] rounded-lg flex-1 w-full overflow-y-auto flex flex-col gap-[2px] p-1 mb-4 border border-dashed border-spacing-2 border-slate-400">
                            {selectedFiles.map((file) => (
                                <li
                                    className="flex items-center gap-3 py-2 px-3 rounded hover:bg-slate-50"
                                    key={file.id + "_h_" + heuristicNumber}
                                >
                                    <span className="text-gray-700 cursor-default flex items-center gap-2 text-ellipsis text-sm">
                                        {file.type === "video" ? (
                                            <VideoIcon />
                                        ) : (
                                            <ImageIcon />
                                        )}{" "}
                                        {removeExtension(file.name)}
                                    </span>
                                    {/* <div className="text-blue-600 hover:bg-slate-100 rounded px-1">
                                        {removeExtension(file.name)}
                                    </div> */}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="flex flex-col gap-1 _hidden">
                    <label
                        className="text-slate-900/50 dark:text-slate-50/50"
                        htmlFor={"evidenceUrl_" + hid}
                    >
                        <span className="text-red-500">⚠️ Legacy</span>
                        <b> | Evidence file{"(s)"}</b>
                    </label>
                    <input
                        id={"evidenceUrl_" + hid}
                        disabled={true}
                        type="text"
                        placeholder="Deprecated"
                        value={evidenceUrl}
                        onChange={(ev) => {
                            onChangeEvidenceUrl(ev.target.value);
                        }}
                        ref={urlRef}
                        className="w-full border border-slate-300 dark:border-slate-500 p-2 h-10 text-slate-500 dark:text-slate-300 rounded-md"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label
                        className="text-slate-900/50 dark:text-slate-50/50"
                        htmlFor={"noteText_" + hid}
                    >
                        <b>Justification</b> <br />
                        <small>
                            {"(Justify the given score as clearly as possible)"}
                        </small>
                    </label>
                    <textarea
                        id={"noteText_" + hid}
                        disabled={disabled}
                        className="w-full border border-slate-300 dark:border-slate-500 p-2 h-52 text-slate-500 text-sm dark:text-slate-300 rounded-md"
                        rows="3"
                        value={text || ""}
                        onFocus={(ev) => {
                            handleOnFocusText(ev.target);
                        }}
                        onClick={(ev) => {
                            handleOnClickText(ev.target);
                        }}
                        onChange={(ev) => {
                            onChangeText(ev.target.value);
                        }}
                    ></textarea>
                </div>
            </div>
            <div className="flex justify-start py-4">
                <BtnSmallPrimary
                    status={status}
                    onClick={() => onSaveEvidence()}
                    textActive="Save Evidence"
                    textFinished="Evidence Saved"
                    disabled={disabled || status !== "active"}
                />
            </div>
        </div>
    );
}

export default Evidence;
