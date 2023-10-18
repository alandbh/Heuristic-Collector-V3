import { useEffect, useRef, useState } from "react";
import Spinner from "../Spinner";
import { BtnSmallPrimary } from "../Button";

function Evidence({
    openBox,
    text,
    evidenceUrl,
    onChangeText,
    onChangeEvidenceUrl,
    onSaveEvidence,
    status,
    hid,
    disabled = false,
}) {
    const urlRef = useRef(null);
    const collapseRef = useRef(null);

    useEffect(() => {
        if (collapseRef) {
            if (openBox) {
                collapseRef.current.style.display = "block";
                collapseRef.current.style.transition = "0.3s";
                urlRef.current.focus();

                setTimeout(() => {
                    collapseRef.current.style.height = "420px";
                    collapseRef.current.style.opacity = 1;
                }, 10);
            } else {
                collapseRef.current.style.height = "0px";
                collapseRef.current.style.opacity = 0;

                setTimeout(() => {
                    if (collapseRef.current !== null) {
                        collapseRef.current.style.display = "none";
                    }
                }, 300);
            }
        }

        return;
    }, [openBox]);

    return (
        <div
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
