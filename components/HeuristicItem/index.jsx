import { useCallback, useEffect, useState } from "react";

import { useProjectContext } from "../../context/project";
import { useScoresObjContext } from "../../context/scoresObj";
import { useCredentialsContext } from "../../context/credentials";
import Debug from "../Debug";

import { useRouter } from "next/router";
import Range from "../Range";
import Evidence from "../Evidence";
import client from "../../lib/apollo";
import { processChange, delay, getUserLevel, delayv2 } from "../../lib/utils";
import { MUTATION_SCORE_OBJ } from "../../lib/mutations";
import ScoreButtons from "../ScoreButtons";

/**
 *
 *
 * Begining of the component
 * ----------------------------------
 *
 */

function HeuristicItem({
    heuristic,
    id,
    allScoresJson,
    allScoresObj,
    className,
}) {
    const { currentPlayer, previousProjectPlayerScores } = useProjectContext();
    const [scoreValue, setScoreValue] = useState(0);
    const [empty, setEmpty] = useState(false);
    const [text, setText] = useState(currentScore?.note || "");
    const [evidenceUrl, setEvidenceUrl] = useState(
        currentScore?.evidenceUrl || ""
    );
    const { getNewScoresJson } = useScoresObjContext();
    const [boxOpen, setBoxOpen] = useState(false);
    const router = useRouter();
    const { user, userType } = useCredentialsContext();
    const [scoreHasChanged, setScoreHasChanged] = useState(false);
    const [enable, setEnable] = useState(false);
    const [toast, setToast] = useState({ open: false, text: "" });
    const [scoreAlert, setScoreAlert] = useState(null);
    const [currentJourney, setCurrentJourney] = useState(null);
    const [showScoreAlert, setShowScoreAlert] = useState(false);
    const [showPreviousScoreAlert, setShowPreviousScoreAlert] = useState(true);

    const currentScore = allScoresObj?.find(
        (someScore) =>
            someScore.heuristic.heuristicNumber === heuristic.heuristicNumber
    );

    // console.log("allScoresObj", allScoresObj);

    const previousScore = previousProjectPlayerScores?.find(
        (score) => score.heuristic.heuristicNumber === heuristic.heuristicNumber
    );
    console.log("contextoPrevious", previousScore);

    // 25/04/2023
    // OBSERVAR WATCH se este useEffect abaixo vai causar algum problema depois de comentado.
    // DELETAR
    // useEffect(() => {
    //     getNewScoresObj();
    // }, [router.query.journey]);

    const createSingleZeroedScore = useCallback(() => {
        // console.log("criando novo - avulso");

        console.log("createSingleZeroedScore");

        const allScoresObjJson = JSON.stringify(allScoresJson);
        const allScoresObjJsonClone = JSON.parse(allScoresObjJson);

        if (!allScoresObjJsonClone) {
            return;
        }

        if (
            allScoresObjJsonClone[router.query.journey].some(
                (score) =>
                    score.id ===
                    `${router.query.player}-${router.query.journey}-h${heuristic.heuristicNumber}`
            )
        ) {
            return;
        }

        let singleScore = {};

        singleScore.id = `${router.query.player}-${router.query.journey}-h${heuristic.heuristicNumber}`;
        singleScore.note = "";
        singleScore.group = { name: heuristic.group.name };
        singleScore.heuristic = {
            heuristicNumber: heuristic.heuristicNumber,
        };
        singleScore.scoreValue = 0;
        singleScore.evidenceUrl = "";

        // console.log("singleScore", singleScore);

        // console.log("singleScore", singleScore);

        allScoresObjJsonClone[router.query.journey]?.push(singleScore);

        processChange(
            client,
            {
                playerId: currentPlayer.id,
                scoresObj: allScoresObjJsonClone,
            },
            MUTATION_SCORE_OBJ,
            true
        );
    }, [
        allScoresJson,
        router.query.journey,
        currentPlayer,
        heuristic,
        router.query.player,
    ]);

    useEffect(() => {
        setCurrentJourney(router.query.journey);
    }, [location.search]);

    useEffect(() => {
        // if (previousScore?.scoreValue !== scoreValue) {
        //     setShowPreviousScoreAlert(true);
        // }
        // setScoreAlert(null)
        // debugger;
        if (currentScore) {
            setScoreValue(currentScore.scoreValue);
            setShowScoreAlert(
                currentScore.showScoreAlert !== undefined
                    ? currentScore.showScoreAlert
                    : false
            );
            setShowPreviousScoreAlert(
                currentScore.showPreviousScoreAlert !== undefined
                    ? currentScore.showPreviousScoreAlert
                    : false
            );
            setText(currentScore.note);
            setEvidenceUrl(currentScore.evidenceUrl);
            if (currentScore.note.length > 0 || currentScore.scoreValue > 0) {
                setEnable(true);

                makeScoreAlert(
                    currentScore.scoreValue,
                    currentScore.showScoreAlert
                );
            }
            setEmpty(false);
            console.log("currentScore", currentScore);
        } else {
            setEmpty(true);

            if (allScoresObj) {
                if (allScoresObj[0].id) {
                    // Suspeita de estar criando scores duplicados
                    createSingleZeroedScore();
                }
            }
        }
    }, [
        currentScore,
        router,
        heuristic,
        userType,
        allScoresObj,
        allScoresJson,
        createSingleZeroedScore,
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
            if (callBack) {
                callBack();
            }

            // toastMessage(message);
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

    function handleHideScoreAlert(show) {
        setShowScoreAlert(show);
        setScoreHasChanged(true);
        setStatus("loading");
    }

    function handleHidePreviousScoreAlert(show) {
        setShowPreviousScoreAlert(show);
        setScoreHasChanged(true);
        setStatus("loading");
    }

    useEffect(() => {
        if (empty || currentScore === undefined || !scoreHasChanged) {
            return;
        }

        // return;
        let allScoresObjJson = JSON.stringify(allScoresJson);
        let allScoresObjJsonClone = JSON.parse(allScoresObjJson);
        allScoresObjJsonClone[router.query.journey].map((item) => {
            if (item.id === currentScore.id) {
                const updateObj = {
                    dateTime: new Date().getTime(),
                    user: { name: user.displayName, email: user.email },
                    showScoreAlert,
                    showPreviousScoreAlert,
                    scoreObj: {
                        scoreValue,
                        note: text,
                        evidenceUrl,
                    },
                };

                if (item.updates && item.updates.length > 0) {
                    item.updates.push(updateObj);
                } else {
                    item.updates = [
                        {
                            dateTime: new Date().getTime(),
                            user: { name: user.displayName, email: user.email },
                            showScoreAlert,
                            showPreviousScoreAlert,
                            scoreObj: {
                                scoreValue,
                                note: text,
                                evidenceUrl,
                            },
                        },
                    ];
                }
                item.scoreValue = scoreValue;
                item.note = text;
                item.evidenceUrl = evidenceUrl;
                item.showScoreAlert = showScoreAlert;
                item.showPreviousScoreAlert = showPreviousScoreAlert;
            }

            return item;
        });

        setScoreHasChanged(false);
        setStatus("loading");

        doTheChangeInScoreObj(allScoresObjJsonClone, null, () => {
            // setStatus("loading");
        });
    }, [scoreValue, scoreHasChanged, showScoreAlert, showPreviousScoreAlert]);

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

        // await delayv2(400);

        // const newScoresJson = await getNewScoresJson();

        // setScoreHasChanged(true);

        delay(async () => {
            const newScoresJson = await getNewScoresJson();

            setScoreHasChanged(true);
        }, 400);
    }
    async function handleChangeScore(_scoreValue) {
        // const newScoreValue = Number(ev.target.value);
        setScoreValue(Number(_scoreValue));

        makeScoreAlert(_scoreValue, true);
        setShowPreviousScoreAlert(true);

        // setScoreHasChanged(true);

        delay(async () => {
            const newScoresJson = await getNewScoresJson();

            setScoreHasChanged(true);
        }, 400);
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
                const updateObj = {
                    dateTime: new Date().getTime(),
                    user: { name: user.displayName, email: user.email },
                    showScoreAlert,
                    showPreviousScoreAlert,
                    scoreObj: {
                        scoreValue,
                        note: text,
                        evidenceUrl,
                    },
                };

                if (item.updates && item.updates.length > 0) {
                    item.updates.push(updateObj);
                } else {
                    item.updates = [
                        {
                            dateTime: new Date().getTime(),
                            user: { name: user.displayName, email: user.email },
                            showScoreAlert,
                            showPreviousScoreAlert,
                            scoreObj: {
                                scoreValue,
                                note: text,
                                evidenceUrl,
                            },
                        },
                    ];
                }

                let scoreTextWithTesterName = "";

                if (
                    text.trim().length > 0 &&
                    !text.endsWith("\n----\nBy: " + user.displayName + "\n \n")
                ) {
                    scoreTextWithTesterName =
                        text + "\n----\nBy: " + user.displayName + "\n \n";
                } else {
                    scoreTextWithTesterName = text;
                }

                item.note = scoreTextWithTesterName;
                item.evidenceUrl = evidenceUrl;
                item.scoreValue = scoreValue;
                item.showScoreAlert = showScoreAlert;
                item.showPreviousScoreAlert = showPreviousScoreAlert;
            }

            return item;
        });

        doTheChangeInScoreObj(
            allScoresObjJsonClone,
            `Evidence for Heuristic ${currentScore.heuristic.heuristicNumber} updated!`,
            () => {
                // setStatus("changed");
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

    /**
     *
     * Watching the changes in the current score
     *
     */

    useEffect(() => {
        if (currentScore?.scoreValue === scoreValue && status === "loading") {
            setStatus("saved");
            toastMessage(
                `Score for Heuristic ${currentScore?.heuristic.heuristicNumber} updated!`
            );
        }
    }, [currentScore?.scoreValue]);

    useEffect(() => {
        if (status == "loading") {
            setStatus("saved");
            toastMessage(
                `Justify for Heuristic ${currentScore?.heuristic.heuristicNumber} updated!`
            );
        }
    }, [currentScore?.note]);

    useEffect(() => {
        if (status == "loading") {
            setStatus("saved");
            toastMessage(
                `Evidence files for Heuristic ${currentScore?.heuristic.heuristicNumber} updated!`
            );
        }
    }, [currentScore?.evidenceUrl]);

    useEffect(() => {
        if (status == "loading") {
            setStatus("saved");
        }
    }, [currentScore?.showScoreAlert]);

    useEffect(() => {
        if (status == "loading") {
            setStatus("saved");
        }
    }, [currentScore?.showPreviousScoreAlert]);

    if (empty) {
        return <div>Empty</div>;
    }

    async function makeScoreAlert(_scoreValue, show = false) {
        console.log("newScoresJson score", Number(_scoreValue));
        console.log("newScoresJson score state", scoreValue);

        // await delayv2(400);

        const newScoresJson = await getNewScoresJson();
        // console.log("newScoresJson", Object.keys(newScoresJson));
        console.log("newScoresJson", currentScore);

        Object.keys(newScoresJson).map((journey) => {
            if (journey !== currentJourney) {
                const otherScore = newScoresJson[journey].find(
                    (scoreObj) =>
                        scoreObj.heuristic.heuristicNumber ===
                        currentScore.heuristic.heuristicNumber
                );
                console.log("newScoresJson", otherScore);
                if (
                    otherScore &&
                    otherScore.scoreValue > 0 &&
                    otherScore.scoreValue !== Number(_scoreValue)
                ) {
                    console.log("newScoresJson score 2", Number(_scoreValue));
                    console.log("newScoresJson Other", otherScore.scoreValue);
                    setScoreAlert({
                        alertText: `In ${journey} the score is: `,
                        scoreValue: otherScore.scoreValue,
                    });
                    setShowScoreAlert(show);
                } else {
                    setScoreAlert(null);
                }
            }
        });
        console.log("newScoresJson", scoreAlert);
        // console.log("newScoresJson", currentScore);
    }

    const isMobile =
        typeof navigator !== "undefined"
            ? /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
            : true;

    return (
        <li
            id={heuristic.id}
            className={
                `${
                    scoreValue > 0 &&
                    text.trim().length > 0 &&
                    evidenceUrl.trim().length > 0 &&
                    status === "saved"
                        ? "bg-blue-50 dark:bg-blue-900/50 border-l-[6px] border-blue-500"
                        : "border-l-[6px] border-transparent"
                }  ` + className
            }
        >
            <div className="flex py-5 px-4 gap-5">
                <div>
                    <b className="text-xl">{heuristic.heuristicNumber}</b>
                </div>
                <div className="w-full">
                    <h2 className="text-lg mb-2 font-bold">{heuristic.name}</h2>
                    <p className="text-sm __break-all whitespace-pre-wrap">
                        {heuristic.description}
                    </p>
                    {/* <p>
                        <Debug data={currentScore.scoreValue} />
                    </p> */}
                    {scoreAlert && showScoreAlert && (
                        <div className=" mt-4 flex items-center gap-3 border-dashed border-red-500 border-2 rounded-lg px-3 py-3">
                            <p className="flex gap-2">
                                <b className="text-red-500">⚠️ Attention: </b>{" "}
                                <span className="text-slate-500">
                                    <span>{scoreAlert.alertText}</span>
                                    <b> {scoreAlert.scoreValue}</b>
                                </span>
                            </p>
                            <button
                                onClick={() => handleHideScoreAlert(false)}
                                className="border px-3 rounded-full h-7 text-blur-500 border-blue-500 hover:bg-blue-700/10 text-xs text-blue-500"
                            >
                                Understood
                            </button>
                        </div>
                    )}
                    {previousScore &&
                        showPreviousScoreAlert &&
                        previousScore?.scoreValue !== scoreValue && (
                            <div className=" mt-4 md:flex items-center gap-3 border-dashed border-red-500 border-2 rounded-lg px-3 py-3">
                                <p className="flex gap-2 w-full">
                                    <b className="text-red-500 whitespace-nowrap">
                                        ⚠️ Watch out:{" "}
                                    </b>{" "}
                                    <span>
                                        On last study this player scored:{" "}
                                        <b>{previousScore?.scoreValue}</b>
                                    </span>{" "}
                                </p>
                                <button
                                    onClick={() =>
                                        handleHidePreviousScoreAlert(false)
                                    }
                                    className="border px-3 rounded-full h-7 text-blur-500 border-blue-500 hover:bg-blue-700/10 text-xs text-blue-500"
                                >
                                    Understood
                                </button>
                            </div>
                        )}

                    <div className="flex flex-col gap-3 justify-between mt-2">
                        <div className="max-w-sm">
                            {isMobile ? (
                                <Range
                                    type={"range"}
                                    id={id}
                                    min={0}
                                    max={5}
                                    value={scoreValue}
                                    onChange={handleChangeRange}
                                    disabled={getUserLevel(userType) > 2}
                                />
                            ) : (
                                <ScoreButtons
                                    id={id}
                                    scoreValue={scoreValue}
                                    disabled={getUserLevel(userType) > 2}
                                    onChangeScore={handleChangeScore}
                                />
                            )}

                            <small
                                className="text-sm text-slate-500 pt-2"
                                style={{
                                    color: scoreDescription[scoreValue].color,
                                }}
                            >
                                {scoreDescription[scoreValue].text}
                            </small>
                        </div>
                        <div className="flex justify-between">
                            <button
                                className={`font-bold py-1 pr-3 text-sm text-primary w-40 whitespace-nowrap ${
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
                            {currentScore?.updates && (
                                <small className="text-slate-400 text-xs">
                                    Last updated by: <br />{" "}
                                    {
                                        currentScore.updates
                                            ?.slice(-1)[0]
                                            .user.name.split(" ")[0]
                                    }{" "}
                                    <span
                                        className={
                                            getUserLevel(userType) > 1
                                                ? "hidden"
                                                : ""
                                        }
                                    >
                                        at{" "}
                                        {new Date(
                                            currentScore.updates?.slice(
                                                -1
                                            )[0].dateTime
                                        ).toLocaleString("en-US", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </span>
                                </small>
                            )}
                        </div>

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
                            disabled={getUserLevel(userType) > 2}
                        />

                        {/* <Debug data={user}></Debug> */}
                    </div>
                </div>
                <div
                    className={`transition fixed right-5 bottom-40 bg-green-600 text-white/80 flex items-center p-3 w-80 font-bold z-10 ${
                        toast.open
                            ? "translate-y-20 opacity-100"
                            : "translate-y-60 opacity-0"
                    }`}
                >
                    {toast.text}
                </div>
            </div>
        </li>
    );
}

export default HeuristicItem;
