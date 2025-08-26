import { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { BtnSmallPrimary } from "../Button";
import SelectFileModal from "../SelectFileModal";

function Evidence({
    currentJourney,
    currentPlayer,
    openBox,
    text,
    evidenceUrl,
    evidenceFolderId,
    onChangeText,
    onChangeEvidenceUrl,
    onSaveEvidence,
    status,
    hid,
    disabled = false,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
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
        setSelectedFiles(newSelectedFiles);
    }

    console.log({ selectedFiles });

    return (
        <div
            className={`flex flex-col gap-3 overflow-hidden justify-between`}
            ref={collapseRef}
        >
            <div className="flex flex-col gap-4">
                <div>
                    <BtnSmallPrimary onClick={() => setIsModalOpen(true)}>
                        Select Evidence
                    </BtnSmallPrimary>
                    <SelectFileModal
                        evidenceFolderId={evidenceFolderId}
                        currentJourney={currentJourney}
                        currentPlayer={currentPlayer}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        selectedFiles={selectedFiles}
                        onSelectionChange={onSelectionChange}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label
                        className="text-slate-900/50 dark:text-slate-50/50"
                        htmlFor={"evidenceUrl_" + hid}
                    >
                        <b>Evidence file{"(s)"}</b>
                    </label>
                    <input
                        id={"evidenceUrl_" + hid}
                        disabled={disabled}
                        type="text"
                        placeholder="https://"
                        value={evidenceUrl || ""}
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
