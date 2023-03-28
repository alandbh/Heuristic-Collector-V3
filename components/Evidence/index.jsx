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
                    collapseRef.current.style.height = "312px";
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
                        className="text-slate-500"
                        htmlFor={"evidenceUrl_" + hid}
                    >
                        Evidence URL
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
                        className="text-slate-500"
                        htmlFor={"noteText_" + hid}
                    >
                        Note
                    </label>
                    <textarea
                        id={"noteText_" + hid}
                        disabled={disabled}
                        className="w-full border border-slate-300 dark:border-slate-500 p-2 h-28 text-slate-500 dark:text-slate-300 rounded-md"
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
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default Evidence;

// function BtnSmallPrimary({ status = "active", onClick }) {
//     const contentStatus = {
//         active: "Save Evidence",
//         loading: (
//             <span className="flex items-center gap-2">
//                 <Spinner radius={8} thick={2} /> Wait...
//             </span>
//         ),
//         saved: (
//             <span className="flex items-center gap-2">
//                 <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 16 16"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                 >
//                     <path
//                         d="M8 14.4C9.69739 14.4 11.3253 13.7257 12.5255 12.5255C13.7257 11.3253 14.4 9.69739 14.4 8C14.4 6.30261 13.7257 4.67475 12.5255 3.47452C11.3253 2.27428 9.69739 1.6 8 1.6C6.30261 1.6 4.67475 2.27428 3.47452 3.47452C2.27428 4.67475 1.6 6.30261 1.6 8C1.6 9.69739 2.27428 11.3253 3.47452 12.5255C4.67475 13.7257 6.30261 14.4 8 14.4V14.4ZM8 16C3.5816 16 0 12.4184 0 8C0 3.5816 3.5816 0 8 0C12.4184 0 16 3.5816 16 8C16 12.4184 12.4184 16 8 16ZM4.8 6.4L3.2 8L7.2 12L12.8 6.4L11.2 4.8L7.2 8.8L4.8 6.4Z"
//                         fill="currentColor"
//                     />
//                 </svg>
//                 Evidence Saved
//             </span>
//         ),
//     };

//     return (
//         <button
//             onClick={onClick}
//             className={`py-2 px-4 rounded-md text-white/70 text-sm ${
//                 status === "saved"
//                     ? "border opacity-70"
//                     : "bg-primary hover:bg-primary/60"
//             }`}
//         >
//             {contentStatus[status]}
//         </button>
//     );
// }
