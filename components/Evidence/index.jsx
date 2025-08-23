import { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { BtnSmallPrimary } from "../Button";
import EvidenceModal from "../EvidenceModal";
import Debug from "../Debug";

const mergeEvidenceLists = (evidenceList, selectedEvidences) => {
    return evidenceList.map((evidence) => {
        const selectedEvidence = selectedEvidences.find(
            (selected) => selected.id === evidence.id
        );
        return selectedEvidence
            ? { ...evidence, ...selectedEvidence }
            : evidence;
    });
};

const areArraysIdentical = (array1, array2) => {
    if (array1.length !== array2.length) return false;

    const sortedArray1 = [...array1].sort((a, b) => a.id - b.id);
    const sortedArray2 = [...array2].sort((a, b) => a.id - b.id);

    return JSON.stringify(sortedArray1) === JSON.stringify(sortedArray2);
};

function Evidence({
    openBox,
    text,
    evidenceUrl,
    currentPlayer,
    currentJourney,
    evidenceList = [],
    driveData = [],
    onChangeText,
    onChangeEvidenceUrl,
    onChangeEvidenceList,
    onSaveEvidence,
    status,
    hid,
    disabled = false,
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvidences, setSelectedEvidences] = useState([]);
    const [evidencesToShow, setEvidencesToShow] = useState([]);
    const [newStatus, setNewStatus] = useState(status);

    const urlRef = useRef(null);
    const collapseRef = useRef(null);

    useEffect(() => {
        // if (status === "saved") {
        //     setNewStatus("saved");
        // }
        setNewStatus(status);
    }, [status]);

    console.log({ status, newStatus });
    useEffect(() => {
        if (!evidenceList) return;
        if (evidenceList.length === 0) return;
        setSelectedEvidences(evidenceList);
    }, [evidenceList]);

    useEffect(() => {
        onChangeEvidenceList(selectedEvidences);
        // I need to make a merge of the current evidenceList and the selectedEvidences

        // const updatedEvidenceList = mergeEvidenceLists(
        //     evidenceList,
        //     selectedEvidences
        // );
        // onChangeEvidenceList(updatedEvidenceList);
        // setCollapseHeight(collapseRef ? collapseRef.current.scrollHeight : 0);
        changeCollapseHeight(
            collapseRef ? collapseRef.current.scrollHeight : 0
        );

        // setNewStatus("active");
        if (areArraysIdentical(evidenceList, selectedEvidences)) {
            setNewStatus("saved");
            onChangeEvidenceList(selectedEvidences);
        } else {
            setNewStatus("active");
        }
    }, [selectedEvidences]);

    useEffect(() => {
        if (collapseRef) {
            // let scrollHeight = collapseRef.current.scrollHeight;
            changeCollapseHeight(collapseRef.current.scrollHeight);
        }

        return;
    }, [openBox]);

    function changeCollapseHeight(height = 0) {
        if (openBox) {
            collapseRef.current.style.display = "block";
            collapseRef.current.style.transition = "0.3s";
            urlRef.current.focus();

            setTimeout(() => {
                collapseRef.current.style.height = height + "px";
                collapseRef.current.style.opacity = 1;
            }, 10);
        } else {
            collapseRef.current.style.height = "0px";
            collapseRef.current.style.opacity = 0;

            setTimeout(() => {
                if (collapseRef.current !== null) {
                    // collapseRef.current.style.display = "none";
                }
            }, 300);
        }
    }

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

    function handleClickAddEvidence() {
        setIsModalOpen(true);
        // setNewStatus("active");
    }

    function handleSaveEvidence() {
        if (newStatus === "active") {
            onSaveEvidence();
            setNewStatus("loading");
        }
    }

    const getEvidenceFiles = () => {
        if (!driveData || !currentPlayer) return;
        console.log({ currentPlayer });
        const playerFolder = driveData.find(
            (p) => p.name.trim() === currentPlayer
        );
        if (!playerFolder) return [];

        const journeyFolder = playerFolder.subfolders.find(
            (j) => j.name.trim() === currentJourney
        );
        if (!journeyFolder) return [];

        return journeyFolder.evidence;
    };

    const evidenceFiles = getEvidenceFiles();

    // function listEvidencesToShow() {
    //     const arrayOne = evidenceList || [];
    //     const arrayTwo = selectedEvidences || [];
    //     // return [...arrayOne, ...arrayTwo];
    //     return mergeEvidenceLists(arrayOne, arrayTwo);
    // }

    // setEvidencesToShow();

    return (
        <div
            id="evidenceBox"
            className={`flex flex-col gap-3 overflow-hidden justify-between`}
            ref={collapseRef}
        >
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <label
                        className="text-slate-900/50 dark:text-slate-50/50"
                        htmlFor={"evidenceUrl_" + hid}
                    >
                        <b>Evidence file{"(s)"}</b>
                    </label>
                    <button
                        onClick={() => handleClickAddEvidence()}
                        className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Add Evidences
                    </button>

                    <EvidenceModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        files={evidenceFiles}
                        selectedFiles={selectedEvidences}
                        evidenceList={evidenceList}
                        onSelectionChange={setSelectedEvidences}
                    />
                    {/* <Debug data={evidenceList} /> */}
                    {/* <Debug data={selectedEvidences} /> */}
                    {selectedEvidences?.length > 0 && (
                        <ul className="flex flex-col gap-2 mt-2">
                            {selectedEvidences?.map((evidence, index) => (
                                <li
                                    key={evidence.fileId}
                                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-2 rounded-md"
                                >
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {evidence.fileName}
                                    </span>
                                    <button
                                        onClick={() => {
                                            // const updatedList =
                                            //     selectedEvidences.filter(
                                            //         (ev) =>
                                            //             ev.fileName !==
                                            //             evidence.fileName
                                            //     );
                                            setSelectedEvidences((prev) => {
                                                return prev.filter(
                                                    (ev) =>
                                                        ev.fileId !==
                                                        evidence.fileId
                                                );
                                            });
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

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
                    status={newStatus}
                    onClick={() => handleSaveEvidence()}
                    textActive="Save Evidence"
                    textFinished="Evidence Saved"
                    disabled={disabled || newStatus !== "active"}
                />
            </div>
        </div>
    );
}

export default Evidence;
