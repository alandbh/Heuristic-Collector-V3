import { useCallback, useEffect, useState } from "react";

import { useProjectContext } from "../../context/project";
import { useScoresObjContext } from "../../context/scoresObj";
import { useCredentialsContext } from "../../context/credentials";

import { useRouter } from "next/router";
import Range from "../Range";
import Evidence from "../Evidence";
import client from "../../lib/apollo";
import { processChange, waitForNewData, delay } from "../../lib/utils";
import { MUTATION_SCORE_OBJ } from "../../lib/mutations";

/**
 *
 *
 * Begining of the component
 * ----------------------------------
 *
 */

function HeuristicItem({ heuristic, id, allScoresJson }) {
    const { currentPlayer } = useProjectContext();
    const [scoreValue, setScoreValue] = useState(0);
    const [empty, setEmpty] = useState(false);
    const [text, setText] = useState(currentScore?.note || "");
    const [evidenceUrl, setEvidenceUrl] = useState(
        currentScore?.evidenceUrl || ""
    );
    const { getNewScoresObj, getNewScoresJson, allScoresObj } =
        useScoresObjContext();
    const [boxOpen, setBoxOpen] = useState(false);
    const router = useRouter();
    const { userType } = useCredentialsContext();
    const [scoreHasChanged, setScoreHasChanged] = useState(false);
    const [enable, setEnable] = useState(false);
    const [toast, setToast] = useState({ open: false, text: "" });

    // console.log("aaaaaaa", userType);

    // debugger;
    console.log("allScoresObj currentPlayer", allScoresObj);
    console.log("allScoresObj Number", heuristic.heuristicNumber);

    const currentScore = allScoresObj?.find(
        (someScore) =>
            Number(someScore.heuristic.heuristicNumber) ===
            Number(heuristic.heuristicNumber)
    );
    console.log("allScoresObj currentScore", currentScore);

    useEffect(() => {
        getNewScoresObj();
    }, [router.query.journey]);

    useEffect(() => {
        // debugger;
        // console.log("HAS SCORE", currentScore);
        if (
            currentScore !== undefined &&
            allScoresObj !== null &&
            allScoresObj.length > 0
        ) {
            console.log("allScoresObj", "NOT EMPTY");
            setScoreValue(currentScore.scoreValue);
            setText(currentScore.note);
            setEvidenceUrl(currentScore.evidenceUrl);
            if (currentScore.note.length > 0 || currentScore.scoreValue > 0) {
                setEnable(true);
            }
            setEmpty(false);
        } else {
            console.log("allScoresObj", "YESSSS EMPTY");
            setEmpty(true);
            setScoreValue(0);
        }
    }, [
        currentScore,
        router,
        heuristic,
        userType,
        allScoresObj,
        allScoresJson,
    ]);

    /**
     *
     *
     * Fires the change in the score Object and updates the database
     * ----------------------------------------------------------------
     *
     */

    const doTheChangeInScoreObj = (
        allScoresObjJsonClone,
        customMessage,
        callBack
    ) => {
        const message =
            customMessage ||
            `Heuristic ${currentScore.heuristic.heuristicNumber} updated!`;
        processChange(
            client,
            {
                playerId: currentPlayer.id,
                scoresObj: allScoresObjJsonClone,
            },
            MUTATION_SCORE_OBJ
        );

        async function getNewData() {
            let newData = await waitForNewData();
            console.log("allScoresObjChange", allScoresObj);

            if (callBack) {
                callBack();
            }

            toastMessage(message);
        }

        getNewData();
    };

    const toastMessage = useCallback((message) => {
        setToast({
            open: true,
            text: message,
        });
        setTimeout(() => {
            setToast({
                open: false,
                text: "",
            });
        }, 4000);
    }, []);

    /**
     *
     * Listening the change of the Score Value
     * ------------------------
     */

    useEffect(() => {
        if (empty || currentScore === undefined || !scoreHasChanged) {
            return;
        }
        // return;
        let allScoresObjJson = JSON.stringify(allScoresJson);
        let allScoresObjJsonClone = JSON.parse(allScoresObjJson);
        allScoresObjJsonClone[router.query.journey].map((item) => {
            if (item.id === currentScore.id) {
                item.scoreValue = scoreValue;
                item.note = text;
                item.evidenceUrl = evidenceUrl;
            }

            return item;
        });

        setScoreHasChanged(false);
        setStatus("loading");

        console.log("criando?");

        doTheChangeInScoreObj(allScoresObjJsonClone, null, () => {
            setStatus("saved");
        });
    }, [scoreValue, scoreHasChanged]);

    /**
     *
     *
     * Setting the Score Value
     * ------------------------
     *
     */

    async function handleChangeRange(ev) {
        // const newScoreValue = Number(ev.target.value);
        setScoreValue(Number(ev.target.value));

        delay(async () => {
            const newScoresJson = await getNewScoresJson();

            setScoreHasChanged(true);
        }, 1000);
    }

    /**
     *
     *
     * Setting the Note
     * ------------------------
     *
     */

    async function handleChangeText(newText) {
        setText(newText);
        setStatus("active");
    }

    async function handleChangeEvidenceUrl(newText) {
        setEvidenceUrl(newText);
        setStatus("active");
    }

    /**
     *
     * Setting the Evidence (URL and Note)
     * --------------------------------------
     *
     */

    const [status, setStatus] = useState("saved");

    async function onSaveEvidence() {
        setStatus("loading");

        const newScoresJson = await getNewScoresJson();

        let allScoresObjJson = JSON.stringify(newScoresJson);
        let allScoresObjJsonClone = JSON.parse(allScoresObjJson);
        allScoresObjJsonClone[router.query.journey].map((item) => {
            if (item.id === currentScore.id) {
                item.note = text;
                item.evidenceUrl = evidenceUrl;
                item.scoreValue = scoreValue;
            }

            return item;
        });

        console.log("saving allScoresUpdated", allScoresObjJsonClone);

        doTheChangeInScoreObj(
            allScoresObjJsonClone,
            `Evidence for Heuristic ${currentScore.heuristic.heuristicNumber} updated!`,
            () => {
                setStatus("saved");
            }
        );
    }

    const scoreDescription = {
        0: { color: "#999999", text: "Not evaluated yet" },
        1: { color: "#bb0000", text: "Totally disagree" },
        2: { color: "#ff0000", text: "Disagree" },
        3: { color: "orange", text: "Neutral" },
        4: { color: "#78b312", text: "Agree" },
        5: { color: "#14a914", text: "Totally agree" },
    };

    if (empty) {
        return <div>Empty</div>;
    }

    return (
        <li id={heuristic.id} className="flex mb-10 gap-5">
            <div>
                <b className="text-xl">{heuristic.heuristicNumber}</b>
            </div>
            <div className="w-full">
                <h2 className="text-lg mb-2 font-bold">{heuristic.name}</h2>
                <p className="text-sm break-all whitespace-pre-wrap">
                    {heuristic.description}
                </p>

                <div className="flex flex-col gap-3 justify-between">
                    <div className="max-w-sm">
                        <Range
                            type={"range"}
                            id={id}
                            min={0}
                            max={5}
                            value={scoreValue}
                            onChange={handleChangeRange}
                            disabled={userType !== "tester"}
                        />
                        <p
                            className="text-sm text-slate-500"
                            style={{
                                color: scoreDescription[scoreValue].color,
                            }}
                        >
                            {scoreDescription[scoreValue].text}
                        </p>
                    </div>
                    <button
                        className={`font-bold py-1 pr-3 text-sm text-primary w-40  ${
                            enable ? "opacity-100" : "opacity-40"
                        }`}
                        onClick={() => setBoxOpen(!boxOpen)}
                        disabled={!enable}
                    >
                        <span className="flex gap-2">
                            <svg
                                width="20"
                                height="23"
                                viewBox="0 0 20 23"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M2 0.221802H18V12.2218H16V2.2218H2V18.2218H10V20.2218H0V0.221802H2ZM4 4.2218H14V6.2218H4V4.2218ZM14 8.2218H4V10.2218H14V8.2218ZM4 12.2218H11V14.2218H4V12.2218ZM17 17.2218H20V19.2218H17V22.2218H15V19.2218H12V17.2218H15V14.2218H17V17.2218Z"
                                    fill="#1E77FC"
                                />
                            </svg>
                            {boxOpen ? "Close" : "Add Evidence"}{" "}
                            {(text || evidenceUrl) && "✓"}
                        </span>
                    </button>

                    <Evidence
                        openBox={boxOpen}
                        currentScore={currentScore}
                        text={text}
                        evidenceUrl={evidenceUrl}
                        onChangeText={handleChangeText}
                        onChangeEvidenceUrl={handleChangeEvidenceUrl}
                        onSaveEvidence={onSaveEvidence}
                        status={status}
                        hid={heuristic.id}
                        disabled={userType !== "tester"}
                    />
                </div>
            </div>
            <div
                className={`transition fixed right-5 bottom-40 bg-green-600 text-white/80 flex items-center p-3 w-80 font-bold z-10 ${
                    toast.open ? "translate-y-20" : "translate-y-60"
                }`}
            >
                {toast.text}
            </div>
        </li>
    );
}

export default HeuristicItem;
