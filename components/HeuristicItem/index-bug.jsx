import { useEffect, useState } from "react";
import { gql } from "@apollo/client";

import { useScoresContext } from "../../context/scores";
import { useRouter } from "next/router";
import Range from "../Range";
import Evidence from "../Evidence";
import client from "../../lib/apollo";
import {
    debounce,
    throttle,
    processChange,
    processChangeEvidence,
    waitForNewData,
    standByData,
    Deferred,
} from "../../lib/utils";
import {
    MUTATION_SCORE,
    MUTATION_EVIDENCE,
    MUTATION_CREATE_SCORE,
} from "../../lib/mutations";

const newEmptyScoresPromisse = {
    run: null,
};

async function waitForPublish() {
    newEmptyScoresPromisse.run = new Deferred();

    function standByDataT() {
        return newEmptyScoresPromisse.run.promise;
    }

    let isPublished = await standByDataT();

    return isPublished;
}

const newEmptyScores = [];

const uniqueScores = [];

function getUnicScores(arr) {
    let unique = null;
    unique = arr.filter((element) => {
        const isDuplicate = uniqueScores.includes(element.heuristicId);

        if (!isDuplicate) {
            uniqueScores.push(element.heuristicId);

            return true;
        }

        return false;
    });

    return unique;
}

let stringCreateFunc = (
    projectSlug,
    playerSlug,
    journeySlug,
    heuristicId
) => `createScore(
    data: {
        scoreValue: 1
        project: { connect: { slug: "${projectSlug}" } }
        player: { connect: { slug: "${playerSlug}" } }
        journey: { connect: { slug: "${journeySlug}" } }
        evidenceUrl: ""
        note: ""
        heuristic: { connect: { id: "${heuristicId}" } }
    }
) {
    scoreValue
    id
},

`;

let multiString = "";

let stringCreate = "";

let MUTATION_CREATE_MANY_SCORE;

const writeNewScores = debounce(async (func) => {
    const newEmptyScoresArray = getUnicScores(newEmptyScores);

    localStorage.setItem(
        "new_empty_scores",
        JSON.stringify(newEmptyScoresArray)
    );
    // console.log("NEW", getUnicScores(newEmptyScores));

    // return;

    // console.log(newEmptyScores);
    newEmptyScoresArray.forEach((score) => {
        return (multiString =
            multiString +
            stringCreateFunc(
                score.projectSlug,
                score.playerSlug,
                score.journeySlug,
                score.heuristicId
            ));
    });

    stringCreate = `
    mutation createMultipleScores {
       ${multiString}
    }
    `;

    // console.log("stringCreate", stringCreate);

    MUTATION_CREATE_MANY_SCORE = gql(stringCreate);

    const { data: savedData } = await client.mutate({
        mutation: MUTATION_CREATE_MANY_SCORE,
    });

    console.log("SALVOUUUU", savedData);

    console.log("SALVOUUUU13");

    const PUBLISH_STRING = gql`
        mutation publishManyScores {
            publishManyScoresConnection(
                first: 10000
                where: { scoreValue: 1 }
            ) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
    `;

    const { data: dataPublished } = await client.mutate({
        mutation: PUBLISH_STRING,
    });
    console.log("PUBLICOU", dataPublished);
    // newEmptyScoresPromisse.run.resolve(true);
    func();
}, 3000);

/**
 *
 *
 *
 * ------------------------------------
 *      Begining of the component
 * ------------------------------------
 *
 *
 *
 */

function HeuristicItem({ heuristic, id }) {
    const [score, setScore] = useState(0);
    const [empty, setEmpty] = useState(false);
    const [text, setText] = useState(currentScore?.note || "");
    const [evidenceUrl, setEvidenceUrl] = useState(
        currentScore?.evidenceUrl || ""
    );
    const { allScores, setAllScores, getNewScores } = useScoresContext();
    const [boxOpen, setBoxOpen] = useState(false);
    const router = useRouter();

    // debugger;
    console.log("scores", allScores);
    // let currentScore;

    const currentScore = allScores.find(
        (someScore) =>
            someScore.heuristic.heuristicNumber === heuristic.heuristicNumber
    );

    useEffect(
        () => async () => {
            // JSON.parse(localStorage.getItem("new_empty_scores")).length > 1;
            // debugger;
            if (currentScore !== undefined) {
                console.log("HAS SCORE", currentScore);
                // debugger;
                setScore(currentScore.scoreValue);
                setText(currentScore.note);
                setEvidenceUrl(currentScore.evidenceUrl);
                if (currentScore.note || currentScore.scoreValue) {
                    setEnable(true);
                }
                setEmpty(false);
            } else {
                setEmpty(true);
                setScore(0);

                console.log("ESCREVEU????");

                const newEmptyScore = {
                    projectSlug: router.query.slug,
                    playerSlug: router.query.player,
                    journeySlug: router.query.journey,
                    heuristicId: heuristic.id,
                    scoreValue: 0,
                };

                newEmptyScores.push(newEmptyScore);

                if (localStorage.getItem("new_empty_scores") === null) {
                    writeNewScores(() => {
                        // getNewScores().then((data) => {
                        //     console.log("new scores", data);
                        //     currentScore = allScores.find(
                        //         (someScore) =>
                        //             someScore.heuristic.heuristicNumber ===
                        //             heuristic.heuristicNumber
                        //     );
                        // });
                    });
                    console.log("ESCREVEU!!!");
                }
            }
        },
        [router, heuristic, getNewScores, allScores, currentScore]
    );

    // useEffect(() => {
    //     console.log("antes response");
    //     getNewScores();
    //     waitForPublish().then((data) => getNewScores());
    // }, [getNewScores]);

    /**
     *
     *
     * Setting the Score
     * -----------------------
     *
     */

    const [enable, setEnable] = useState(false);
    const [toast, setToast] = useState({ open: false, text: "" });

    async function handleChangeRange(ev) {
        setScore(Number(ev.target.value));
        // let newScores = [...allScores];
        // debugger;

        // saveValue();

        // function saveValue() {
        //     if (empty) {
        //         // debugger;
        //         processChange(
        //             client,
        //             {
        //                 projectSlug: router.query.slug,
        //                 playerSlug: router.query.player,
        //                 journeySlug: router.query.journey,
        //                 heuristicId: heuristic.id,
        //                 scoreValue: Number(ev.target.value),
        //             },
        //             MUTATION_CREATE_SCORE,
        //             true
        //         );
        //     } else {
        //         processChange(
        //             client,
        //             {
        //                 scoreId: currentScore.id,
        //                 scoreValue: Number(ev.target.value),
        //                 scoreNote: currentScore.note,
        //             },
        //             MUTATION_SCORE
        //         );
        //     }
        // }

        processChange(
            client,
            {
                scoreId: currentScore.id,
                scoreValue: Number(ev.target.value),
                scoreNote: currentScore.note,
            },
            MUTATION_SCORE
        );

        let dataNew = await waitForNewData();

        console.log("NEW PROMISE", dataNew);
        setEnable(true);

        // if (empty) {
        //     setAllScores([...allScores, dataNew]);
        // } else {
        //     let newScores = allScores.map((score) =>
        //         score.heuristic.heuristicNumber === heuristic.heuristicNumber
        //             ? { ...score, scoreValue: Number(ev.target.value) }
        //             : score
        //     );

        //     setAllScores(newScores);
        // }
        // debugger;
        let newScores = allScores.map((score) =>
            score.heuristic.heuristicNumber === heuristic.heuristicNumber
                ? { ...score, scoreValue: Number(ev.target.value) }
                : score
        );

        setAllScores(newScores);

        setToast({
            open: true,
            text: `Heuristic ${dataNew.heuristic.heuristicNumber} updated!`,
        });
        setTimeout(() => {
            setToast({
                open: false,
                text: "",
            });
        }, 4000);
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
        let scoreId, scoreData;

        if (empty) {
            scoreData = await standByData();
            console.log("standByIdUrl", scoreData);

            scoreId = scoreData.id;
        } else {
            scoreId = currentScore.id;
        }

        setStatus("loading");

        processChangeEvidence(
            client,
            {
                scoreId,
                evidenceUrl: evidenceUrl,
                scoreNote: text,
            },
            MUTATION_EVIDENCE
        );

        let dataNew = await waitForNewData();

        setStatus("saved");

        setToast({
            open: true,
            text: `Evidence for Heuristic ${dataNew.heuristic.heuristicNumber} updated!`,
        });
        // console.log("toastText", dataNew.note);
        setTimeout(() => {
            setToast({
                open: false,
                text: "",
            });
        }, 4000);
    }

    const scoreDescription = {
        0: { color: "#999999", text: "Not evaluated yet" },
        1: { color: "#bb0000", text: "Totally disagree" },
        2: { color: "#ff0000", text: "Disagree" },
        3: { color: "orange", text: "Neutral" },
        4: { color: "#78b312", text: "Agree" },
        5: { color: "#14a914", text: "Totally agree" },
    };

    return (
        <li className="flex mb-10 gap-5">
            <div>
                <b className="text-xl">{heuristic.heuristicNumber}</b>
            </div>
            <div>
                <h2 className="text-lg mb-2 font-bold">{heuristic.name}</h2>
                <p className="text-sm">{heuristic.description}</p>

                <div className="flex flex-col gap-3 justify-between">
                    <div>
                        <Range
                            type={"range"}
                            id={id}
                            min={0}
                            max={5}
                            value={score}
                            onChange={(ev) => handleChangeRange(ev)}
                        />
                        <p
                            className="text-sm text-slate-500"
                            style={{ color: scoreDescription[score].color }}
                        >
                            {scoreDescription[score].text}
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
                            {(text || evidenceUrl) && "*"}
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
