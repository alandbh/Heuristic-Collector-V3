import { useState, useRef } from "react";
import Switch from "../Switch";
import { BtnSmallPrimary } from "../Button";

function FindingBlock({
    finding,
    callBack,
    index,
    doMutate,
    client,
    mutationEdit,
    mutationDelete,
    disable = false,
}) {
    const [text, setText] = useState(finding.findingObject.text || "");

    const [theType, setTheType] = useState(
        finding.findingObject.theType || "neutral"
    );
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("disabled");
    const [disabled, setDisabled] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const groupRef = useRef(null);

    function onChangeText(value) {
        setDisabled(false);
        setStatus("active");
        setText(value);
    }

    function onChangeTheType(type) {
        setTheType(type);
        setDisabled(false);
        setStatus("active");
    }

    function handleClickSaveFinding(id) {
        setLoading(true);
        setStatus("loading");
        setDisabled(true);
        doMutate(
            client,
            {
                findingId: finding.id,
                text,
                theType: theType,
            },
            mutationEdit,
            "edit",
            null,
            setStatus
        );
    }

    function handleClickDelete() {
        setConfirmOpen(true);
    }

    function doDeleteFinding(confirm) {
        if (confirm) {
            groupRef.current.style.transition = "0.5s";
            groupRef.current.style.opacity = "0";
            groupRef.current.style.transform = "translateX(-80px)";

            setTimeout(() => {
                setConfirmOpen(false);
                doMutate(
                    client,
                    {
                        findingId: finding.id,
                    },
                    mutationDelete,
                    "delete",
                    reloadFindingList,
                    setLoading
                );
            }, 500);
        } else {
            setConfirmOpen(false);
        }
    }

    function reloadFindingList(finding) {
        // setFindings([...findings, finding]);
        callBack();
    }

    return (
        <div className="flex flex-col gap-3 overflow-x-hidden">
            <div ref={groupRef} className="px-8">
                <h3 className="font-bold text-lg mb-4">Finding #{index + 1}</h3>
                <label
                    className="text-slate-500 mb-2 inline-block"
                    htmlFor={"findingText_" + finding.id}
                >
                    Type what you`ve found
                </label>
                <div className="flex gap-4 flex-col">
                    <textarea
                        id={"findingText_" + finding.id}
                        className="w-full border border-slate-300 dark:border-slate-500 p-2 h-28 text-slate-500 dark:text-slate-300 rounded-md"
                        rows="3"
                        value={text}
                        onChange={(ev) => {
                            onChangeText(ev.target.value);
                        }}
                        disabled={disable}
                    ></textarea>
                    <div
                        className={`flex ${
                            confirmOpen ? "justify-center" : "justify-end"
                        }`}
                    >
                        {confirmOpen ? (
                            <div className="flex gap-2 items-center">
                                <span className="opacity-60">
                                    Confirm delete?{" "}
                                </span>
                                <button
                                    className="border px-4 rounded-full h-7 text-red-500 border-red-500 hover:bg-red-700/10"
                                    onClick={() => doDeleteFinding(true)}
                                    disabled={disable}
                                >
                                    Yes
                                </button>
                                <button
                                    className="px-4 h-7  hover:underline"
                                    onClick={() => doDeleteFinding(false)}
                                    disabled={disable}
                                >
                                    No
                                </button>
                            </div>
                        ) : (
                            <button
                                className={`text-red-500 ${
                                    disable && "opacity-30"
                                }`}
                                onClick={handleClickDelete}
                                disabled={disable}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                    <div className="flex justify-between">
                        <div className="flex flex-col gap-2 relative w-full">
                            <label className="text-slate-500">
                                How do you describe this finding?
                            </label>
                            <div className="relative h-12 w-full">
                                <div className="absolute h-12 scale-75 md:scale-100 origin-top-left">
                                    <Switch
                                        options={[
                                            "blocker",
                                            "bad",
                                            "neutral",
                                            "good",
                                        ]}
                                        onChange={(theType) =>
                                            onChangeTheType(theType)
                                        }
                                        selected={theType}
                                        disable={disable}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center md:justify-end mb-5 mt-5">
                        <BtnSmallPrimary
                            disabled={disabled}
                            status={status}
                            textActive={`Save Finding #${index + 1}`}
                            textFinished="Saved"
                            onClick={handleClickSaveFinding}
                        />
                    </div>
                </div>
            </div>
            <div className="dark:opacity-10">
                <hr />
            </div>
        </div>
    );
}

export default FindingBlock;
