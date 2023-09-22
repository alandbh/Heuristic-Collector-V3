import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { gql } from "@apollo/client";
import { saveSvgAsPng } from "save-svg-as-png";
import client from "../../lib/apollo";
import Fuse from "fuse.js";
import useKeyPress from "../../lib/useKeyPress";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import Debugg from "../../lib/Debugg";

//test

// import { bancoDoBrasil } from "./edition2021/banco-do-brasil";
import { prevScores as rawPrevScores } from "../../components/edition2021/prevScores";

import BarChart from "../../components/BarChart";
import CompareBar from "../../components/CompareBar";

const QUERY_HEURISTICS = gql`
    query GetAllHeuristics($projectSlug: String) {
        heuristics(last: 10000, where: { project: { slug: $projectSlug } }) {
            name
            heuristicNumber
            description
            journeys {
                slug
                name
            }
        }
    }
`;

const QUERY_JOURNEYS = gql`
    query GetAllJourneys($projectSlug: String) {
        journeys(first: 1000, where: { project: { slug: $projectSlug } }) {
            name
            slug
        }
    }
`;

const QUERY_PLAYERS = gql`
    query GetAllPlayers($projectSlug: String) {
        players(first: 10000, where: { project: { slug: $projectSlug } }) {
            name
            slug
            previousScores
        }
    }
`;

function isMac() {
    // "use client"
    if (typeof navigator !== "undefined") {
        return navigator.userAgent.indexOf("Mac") != -1;
    }

    return false;
}

function Dashboard() {
    const router = useRouter();
    const { project, heuristic, showPlayer, journey } = router.query;
    const [allJourneyScores, setAllJourneyScores] = useState(null);
    const [scoresByJourney, setScoresByJourney] = useState(null);
    const [allProjectScores, setAllProjectScores] = useState(null);
    const [prevScores, setPrevScores] = useState(null);
    const [allHeuristics, setAllHeuristics] = useState(null);
    const [allJourneys, setAllJourneys] = useState(null);
    const [allPlayers, setAllPlayers] = useState(null);
    const [currentJourney, setCurrentJourney] = useState(null);
    const [heuristicsByJourney, setHeuristicsByJourney] = useState(null);
    const [selectedHeuristic, setSelectedHeuristic] = useState(null);
    const [result, setResult] = useState([]);
    const [svgCopied, setSVGCopied] = useState(null);
    const [pngSrc, setPngSrc] = useState(null);
    const inputRef = useRef(null);
    const chartRef = useRef(null);
    const chartCompareRef = useRef(null);
    const journeyChartRef = useRef(null);
    const resultRef = useRef(null);
    const searchRef = useRef(null);
    const [user, loadingUser] = useAuthState(auth);

    function fetchAllJourneyScores(project, journey, heuristic, showPlayer) {
        fetch(
            `/api/all?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}`
        ).then((data) => {
            data.json().then((result) => {
                setAllJourneyScores(result);
            });
        });
    }
    function fetchAllProjectScores(project) {
        fetch(`/api/all?project=${project}`).then((data) => {
            data.json().then((result) => {
                setAllProjectScores(result.length > 0 ? result : null);
            });
        });
    }

    const getHeuristics = useCallback(() => {
        const variables = {
            projectSlug: router.query.project,
        };

        // Not using clientFast in order to not cache results
        client
            .query({
                query: QUERY_HEURISTICS,
                variables,
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                setAllHeuristics(data.heuristics);
            });
    }, [router]);

    const getJourneys = useCallback(() => {
        if (router.query.project !== undefined) {
            const variables = {
                projectSlug: router.query.project,
            };
            client
                .query({
                    query: QUERY_JOURNEYS,
                    variables,
                    fetchPolicy: "network-only",
                })
                .then(({ data }) => {
                    setAllJourneys(data.journeys);
                });
        }
    }, [router.query.project]);

    const getPlayers = useCallback(() => {
        if (router.query.project !== undefined) {
            const variables = {
                projectSlug: router.query.project,
            };
            client
                .query({
                    query: QUERY_PLAYERS,
                    variables,
                    fetchPolicy: "network-only",
                })
                .then(({ data }) => {
                    setAllPlayers(data.players);
                });
        }
    }, [router.query.project]);

    const onKeyPress = (event) => {
        inputRef.current.focus();
    };

    const changeKey = isMac() ? ["metaKey", "k"] : ["ctrlKey", "l"];
    const shortCut = isMac() ? "Cmd + K" : "Ctrl + L";

    useKeyPress(changeKey, onKeyPress);

    useEffect(() => {
        fetchAllProjectScores(project);
        fetchAllJourneyScores(project, journey, heuristic, showPlayer);
        getHeuristics();
        getJourneys();
        getPlayers();
    }, [
        project,
        heuristic,
        showPlayer,
        journey,
        getHeuristics,
        getJourneys,
        getPlayers,
    ]);

    useEffect(() => {
        setPrevScores(rawPrevScores);
    }, []);

    useEffect(() => {
        if (!currentJourney && allJourneys?.length > 0) {
            setCurrentJourney(allJourneys[0].slug);
        }
    }, [currentJourney, allJourneys]);

    useEffect(() => {
        if (currentJourney && router.query.project && !router.query.journey) {
            router.replace({
                query: {
                    ...router.query,
                    journey: currentJourney,
                    // heuristic: null,
                },
            });
        }
    }, [currentJourney, router]);

    useEffect(() => {
        if (currentJourney) {
            setSelectedHeuristic(null);
        }
    }, [currentJourney]);

    useEffect(() => {
        if (router.query.journey !== undefined) {
            setCurrentJourney(router.query.journey);
        }

        // if (router.query.showPlayer !== undefined) {
        //     setCurrentPlayer(router.query.showPlayer);
        // }
        if (
            router.query.heuristic !== undefined &&
            router.query.heuristic !== "" &&
            allHeuristics !== null &&
            heuristicsByJourney !== null &&
            heuristicsByJourney !== undefined &&
            heuristicsByJourney.length > 0
        ) {
            const currentHeuristicByUrl = heuristicsByJourney.filter(
                (heuristic) => {
                    return heuristic.heuristicNumber === router.query.heuristic;
                }
            );
            // console.log({ allHeuristics });
            setSelectedHeuristic(currentHeuristicByUrl[0]);
        }
    }, [
        router.query.journey,
        allHeuristics,
        router.query.heuristic,
        router.query.showPlayer,
        heuristicsByJourney,
    ]);
    // useEffect(() => {
    //     if (allJourneyScores !== null) {
    //         console.log("allJourneyScores", allJourneyScores);
    //     }
    // }, [allJourneyScores]);

    // useEffect(() => {
    //     console.log({ allProjectScores });
    // }, [allProjectScores]);

    useEffect(() => {
        if (allHeuristics && allHeuristics.length > 0) {
            const heuristicsByJourneyFiltered = allHeuristics?.filter(
                (heuristic) => {
                    // Filtering the heuristics by the current journey and if journey is empty.
                    return (
                        heuristic.journeys.filter(
                            (journey) => journey.slug === currentJourney
                        ).length > 0
                    );
                }
            );
            setHeuristicsByJourney(heuristicsByJourneyFiltered);
            if (inputRef.current !== null) {
                inputRef.current.value = "";
                setResult([]);
            }
        }
    }, [currentJourney, allHeuristics]);

    /**
     *
     * Getting the scores for the current journey
     *
     */

    useEffect(() => {
        // Filtering all zeroed or ignored players

        const filteredSllProjectScores = allProjectScores?.filter((player) => {
            return !player.scores[currentJourney]?.ignore_journey;
        });

        const scores = filteredSllProjectScores?.map((playerScore) => {
            const playerObj = {};
            playerObj.journeyScores = {};
            playerObj.journeyScoresArr = [];

            playerObj.playerSlug = playerScore.slug;
            playerObj.playerName = playerScore.name;

            setScoresByJourney(currentJourney);

            for (const heuristic in playerScore.scores[currentJourney]) {
                let scoresArray = [];
                if (heuristic.includes("h_")) {
                    if (playerScore.scores[currentJourney].zeroed_journey) {
                        playerObj.journeyScores[heuristic] = 0;
                    } else {
                        playerObj.journeyScores[heuristic] =
                            playerScore.scores[currentJourney][
                                heuristic
                            ].scoreValue;
                    }

                    playerObj.journeyScoresArr.push(
                        playerScore.scores[currentJourney][heuristic].scoreValue
                    );

                    scoresArray.push(
                        playerScore.scores[currentJourney][heuristic].scoreValue
                    );
                }
            }
            function setScoresByJourney(journey) {}

            const geraisArr = [];

            for (const heuristic in playerScore.scores["gerais"]) {
                if (heuristic.includes("h_")) {
                    geraisArr.push(
                        playerScore.scores["gerais"][heuristic].scoreValue
                    );
                }
            }

            // Total score for the current journey

            const journeyTotalScore = playerObj.journeyScoresArr.reduce(
                (acc, current) => {
                    return acc + current;
                },
                0
            );

            // Total score for the "gerais" journey
            const geraisTotalScore = geraisArr.reduce((acc, current) => {
                return acc + current;
            }, 0);

            // Jornada	Peso de Gerais

            const geraisWeight = {
                "open-finance": 0.2380952381,
                cartao: 0.619047619,
                abertura: 0.6666666667,
                gerais: 0,
            };

            const maximunScore = allProjectScores.length * 5;
            const maximunJourneyScore = playerObj.journeyScoresArr.length * 5;

            // Calculating current journey score based on gerais weight

            if (playerScore.scores[currentJourney]?.zeroed_journey) {
                playerObj.journeyTotalPercentage = 0;
                playerObj.journeyTotalScore = 0;
            } else {
                playerObj.journeyTotalPercentage =
                    (geraisTotalScore * geraisWeight[currentJourney] +
                        journeyTotalScore) /
                    (maximunScore * geraisWeight[currentJourney] +
                        maximunJourneyScore);
                playerObj.journeyTotalScore = journeyTotalScore;
            }

            playerObj.geraisTotalScore = geraisTotalScore;
            playerObj.maximunScore = maximunScore;
            playerObj.maximunJourneyScore = maximunJourneyScore;

            playerObj;
            return playerObj;
        });

        setScoresByJourney(scores);
    }, [allProjectScores, currentJourney]);

    /**
     *
     * Controlling the search result display
     *
     *
     */
    const closeResultSearchBox = useCallback(
        (ev) => {
            if (result.length > 0) {
                if (searchRef) {
                    if (
                        !searchRef.current?.contains(ev.target) ||
                        ev.key === "Escape"
                    ) {
                        setResult([]);
                        inputRef.current.blur();
                        // removeListening();
                        window.removeEventListener(
                            "click",
                            closeResultSearchBox,
                            true
                        );
                        window.removeEventListener(
                            "keydown",
                            closeResultSearchBox,
                            true
                        );
                    }
                }
            }
        },
        [searchRef, result]
    );

    useEffect(() => {
        if (typeof window !== "undefined" && result.length > 0) {
            window.addEventListener("click", closeResultSearchBox, true);
            window.addEventListener("keydown", closeResultSearchBox, true);
        }
    }, [result, closeResultSearchBox]);

    /**
     *
     *
     * Preparing the dataset for the Journey Chart
     *
     *
     */

    let journeyScoresDatasetArr = useMemo(() => {
        if (scoresByJourney) {
            const dataset = scoresByJourney.map((player) => {
                const playerObj = {};
                playerObj.value = player.journeyTotalPercentage;
                playerObj.total = player.journeyTotalScore;
                playerObj.label = player.playerName;
                playerObj.maximunJourneyScore = player.maximunJourneyScore;
                playerObj.playerSlug = player.playerSlug;
                playerObj.show_player = player.playerSlug === showPlayer;
                return playerObj;
            });
            return dataset;
        }
    }, [scoresByJourney, showPlayer]);

    journeyScoresDatasetArr?.sort((a, b) => {
        return b.value - a.value;
    });

    const averageJourneyScore = useMemo(() => {
        if (scoresByJourney && journeyScoresDatasetArr) {
            const scoresArr = journeyScoresDatasetArr.map((player) => {
                return Number(player.value.toFixed(4));
            });

            const sumScores = scoresArr.reduce((acc, current) => {
                return acc + current;
            }, 0);

            console.log("sum", sumScores / scoresArr.length);

            return sumScores / scoresArr.length;
        }
    }, [scoresByJourney, journeyScoresDatasetArr]);

    if (!user && !loadingUser) {
        router.push(
            `/login?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}&page=dashboard`
        );
        return;
    }

    /**
     *
     *
     *
     * Checking whether all the data is available. If not, returns null.
     * ----------------------------------------------------------------
     *
     *
     *
     */

    if (
        allJourneyScores === null ||
        allProjectScores === null ||
        allHeuristics === null ||
        allJourneys === null ||
        allPlayers === null ||
        !journeyScoresDatasetArr ||
        heuristicsByJourney === null ||
        !user
    ) {
        return null;
    }

    console.log({ user });

    function handleSelectJourney(ev) {
        console.log("Journey", ev.target.value);
        setResult([]);
        setSelectedHeuristic(null);

        setCurrentJourney(ev.target.value);
        router.replace({
            query: {
                ...router.query,
                journey: ev.target.value,
                heuristic: null,
            },
        });
    }
    function handleSelectPlayer(ev) {
        // console.log("Player", ev.target.value);

        // setCurrentPlayer(ev.target.value);
        router.replace({
            query: {
                ...router.query,
                showPlayer: ev.target.value,
            },
        });
        setResult([]);
        // setSelectedHeuristic(null);
    }

    const options = {
        includeScore: true,
        keys: ["name", "heuristicNumber"],
        minMatchCharLength: 2,
        threshold: 0.3,
        location: 0,
        distance: 2000,
    };

    const fuse = new Fuse(heuristicsByJourney, options);

    function handleSearch(ev) {
        setResult(fuse.search(ev.target.value));
    }

    const fullResult = heuristicsByJourney.map((heuristic) => {
        return {
            item: heuristic,
        };
    });

    function handleFocusSearch() {
        // fuse.setCollection(heuristicsByJourney);
        setResult(fullResult.slice(0, 5));
    }

    function handleClickHeuristic(heuristicNumber, name) {
        setSelectedHeuristic({ heuristicNumber, name });
        setResult([]);

        router.replace({
            query: {
                ...router.query,
                heuristic: heuristicNumber,
            },
        });
    }

    function handleClickCopySvg(ref, id) {
        navigator.clipboard.writeText(ref.current.outerHTML);
        setSVGCopied({ [id]: true });

        setTimeout(() => {
            setSVGCopied(null);
        }, 6000);
    }

    function handleClickCopyPng(
        ref,
        { heuristicNumber = "", playerSlug = "" } = {
            heuristicNumber: "",
            playerSlug: "",
        }
    ) {
        let domUrl = window.URL || window.webkitURL || window;

        const svgText = ref.current.outerHTML;

        saveSvgAsPng(
            ref.current,
            `chart-${currentJourney}${
                heuristicNumber && "-h_" + heuristicNumber
            }${playerSlug && "-" + playerSlug}.png`
        );
        return;

        /**
         * Caso seja necessário plotar o PNG na tela
         *
         * Remover o return acima
         */
        const svgBlob = new Blob([svgText], {
            type: "image/svg+xml;charset=utf-8",
        });

        const svgUrl = domUrl.createObjectURL(svgBlob);

        // create a canvas element to pass through
        let canvas = document.createElement("canvas");
        // width="901" height="340"
        canvas.width = 901;
        canvas.height = 340;
        let ctx = canvas.getContext("2d");

        // create a new image to hold it the converted type
        const img = new Image();

        // when the image is loaded we can get it as base64 url
        img.onload = function () {
            // draw it to the canvas
            ctx.drawImage(this, 0, 0);

            // if it needs some styling, we need a new canvas
            let styled = document.createElement("canvas");
            styled.width = canvas.width;
            styled.height = canvas.height;
            let styledCtx = styled.getContext("2d");
            styledCtx.save();
            // styledCtx.fillStyle = fill;
            styledCtx.fillRect(0, 0, canvas.width, canvas.height);
            styledCtx.strokeRect(0, 0, canvas.width, canvas.height);
            styledCtx.restore();
            styledCtx.drawImage(canvas, 0, 0);
            canvas = styled;

            // we don't need the original any more
            domUrl.revokeObjectURL(svgUrl);
            // now we can resolve the promise, passing the base64 url
            return canvas.toDataURL();
        };

        // load the image
        img.src = svgUrl;

        setPngSrc(svgUrl);
    }

    // Retrying to fectch the scores in case the api returns empty data
    if (allJourneyScores.average_score === null) {
        // fetchAllJourneyScores()
        fetchAllJourneyScores(project, journey, heuristic, showPlayer);
    }

    // const hasComparison = Boolean(
    //     prevScores[showPlayer] && prevScores[showPlayer][currentJourney]
    //         ? prevScores[showPlayer][currentJourney].find(
    //               (score) =>
    //                   score.id === Number(selectedHeuristic?.heuristicNumber)
    //           )
    //         : false
    // );

    let hasComparison = false;

    function checkHasComparison() {
        const hasComparison = Boolean(
            getPreviousScoresByPlayer(showPlayer)
                ? getPreviousScoresByPlayer(showPlayer)[currentJourney]?.find(
                      (score) =>
                          score.id ===
                          Number(selectedHeuristic?.heuristicNumber)
                  )
                : false
        );

        return hasComparison;
    }

    hasComparison = checkHasComparison();
    // const hasComparison = prevScores[showPlayer][currentJourney];
    function isValidJourney(journeySlugToTest) {
        return Boolean(
            allJourneys.find((journey) => journey.slug === journeySlugToTest)
        );
    }

    function getPreviousScoresByPlayer(playerSlug = showPlayer) {
        const currentPlayerObj = allPlayers.find(
            (player) => player.slug === playerSlug
        );

        return currentPlayerObj ? currentPlayerObj.previousScores : null;
    }

    function getUniqueScores(scoresObj) {
        const nonZeroedScores = scoresObj.filter(
            (scoresObj) => scoresObj.value > 0
        );
        const table = [];
        const scores = nonZeroedScores.map((scoreObj) => scoreObj.value);

        const uniqueScores = Array.from(new Set(scores));

        uniqueScores.map((score) => {
            const tableRow = {};

            tableRow.score = score;
            tableRow.qtd = nonZeroedScores.filter(
                (scoreObj) => scoreObj.value === score
            ).length;
            tableRow.players = nonZeroedScores
                .filter((scoreObj) => scoreObj.value === score)
                .map((scoreObj) => scoreObj.label)
                .join(", ");

            table.push(tableRow);
        });

        const sortedTable = table.sort((a, b) => b.score - a.score);

        return sortedTable;
    }

    function getCellColor(scoreValue) {
        const colorClasses = {
            5: "bg-lime-600 text-black font-bold border-none",
            4: "bg-lime-400 text-black font-bold border-none",
            3: "bg-yellow-400 text-black font-bold border-none",
            2: "bg-red-300 text-black font-bold border-none",
            1: "bg-red-500 text-black font-bold border-none",
        };

        return colorClasses[scoreValue];
    }

    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50 p-10">
            <main className="mt-10 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                <div className="w-[864px] mx-auto flex flex-col">
                    <div className="flex w-full gap-10 mb-10 text-sm">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-slate-500 font-bold">
                                Select a journey
                            </label>
                            <select
                                className="border border-slate-300  block h-10 px-4 rounded-sm"
                                onChange={(ev) => handleSelectJourney(ev)}
                                defaultValue={currentJourney}
                            >
                                <option value="">...</option>
                                {allJourneys.map((journey) => {
                                    return (
                                        <option
                                            key={journey.slug}
                                            value={journey.slug}
                                        >
                                            {journey.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div
                            className={`flex flex-col gap-1 flex-1 ${
                                currentJourney ? "opacity-100" : "opacity-40"
                            }`}
                            ref={searchRef}
                        >
                            <label className="text-slate-500 font-bold">
                                Find the heuristic
                            </label>

                            <div
                                className={`rounded flex items-center gap-2 pl-2 border-slate-300 border text-slate-500 w-full bg-white dark:bg-transparent `}
                            >
                                <label htmlFor="search">
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M16.325 14.899L21.705 20.279C21.8941 20.4682 22.0003 20.7248 22.0002 20.9923C22.0001 21.2599 21.8937 21.5164 21.7045 21.7055C21.5153 21.8946 21.2587 22.0008 20.9912 22.0007C20.7236 22.0006 20.4671 21.8942 20.278 21.705L14.898 16.325C13.2897 17.5707 11.2673 18.1569 9.24214 17.9643C7.21699 17.7718 5.34124 16.815 3.99649 15.2886C2.65174 13.7622 1.939 11.7808 2.00326 9.74753C2.06753 7.71427 2.90396 5.78185 4.34242 4.34339C5.78087 2.90494 7.71329 2.0685 9.74656 2.00424C11.7798 1.93998 13.7612 2.65272 15.2876 3.99747C16.814 5.34222 17.7708 7.21796 17.9634 9.24312C18.1559 11.2683 17.5697 13.2907 16.324 14.899H16.325ZM10 16C11.5913 16 13.1174 15.3678 14.2427 14.2426C15.3679 13.1174 16 11.5913 16 9.99999C16 8.40869 15.3679 6.88257 14.2427 5.75735C13.1174 4.63213 11.5913 3.99999 10 3.99999C8.40871 3.99999 6.88259 4.63213 5.75737 5.75735C4.63215 6.88257 4.00001 8.40869 4.00001 9.99999C4.00001 11.5913 4.63215 13.1174 5.75737 14.2426C6.88259 15.3678 8.40871 16 10 16V16Z"
                                            fill="currentColor"
                                        ></path>
                                    </svg>
                                    <span className="sr-only">
                                        Search for heuristics
                                    </span>
                                </label>
                                <input
                                    className="h-10 p-2 rounded-md bg-transparent text-slate-500 w-full"
                                    type="search"
                                    name="search"
                                    id="search"
                                    autoComplete="off"
                                    accessKey="s"
                                    placeholder={shortCut}
                                    disabled={!currentJourney}
                                    onChange={(e) => handleSearch(e)}
                                    onFocus={handleFocusSearch}
                                    ref={inputRef}
                                />
                            </div>
                            {/* <label className="text-slate-500 font-bold">
                                Find the heuristic
                            </label>
                            <input
                                className="border border-slate-300  block h-10 px-4 rounded-sm"
                                onChange={(e) => handleSearch(e)}
                                type="search"
                                name="search"
                                id="search"
                                autoComplete="off"
                                ref={inputRef}
                                accessKey="s"
                                placeholder={"Type something and select"}
                                tabIndex={1}
                            /> */}
                            <div className="flex items-end content-end  relative">
                                {result?.length > 0 ? (
                                    <ul
                                        className="absolute flex flex-col top-[0px] left-1/2 -ml-[300px] w-[600px]  bg-white shadow-2xl "
                                        ref={resultRef}
                                    >
                                        {result.map((item, index) => {
                                            return (
                                                <li
                                                    className="w-full"
                                                    key={index}
                                                >
                                                    <button
                                                        onClick={() =>
                                                            handleClickHeuristic(
                                                                item.item
                                                                    .heuristicNumber,
                                                                item.item.name
                                                            )
                                                        }
                                                        className="flex flex-1 w-full gap-2 text-left py-4 px-4 bg-white focus:bg-blue-50 focus:outline-blue-200"
                                                        tabIndex={0}
                                                    >
                                                        <b className="block w-12 ">
                                                            {
                                                                item.item
                                                                    .heuristicNumber
                                                            }
                                                        </b>
                                                        <span className="text-slate-500 flex-1">
                                                            {item.item.name.substring(
                                                                0,
                                                                130
                                                            ) + "..."}
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    ""
                                )}
                            </div>
                        </div>
                        <div
                            className={`flex flex-col gap-1 flex-1 ${
                                currentJourney ? "opacity-100" : "opacity-40"
                            }`}
                        >
                            <label className="text-slate-500 font-bold">
                                Select a player to highlight it
                            </label>

                            <select
                                className="border border-slate-300  block h-10 px-4 rounded-sm"
                                disabled={!currentJourney}
                                onChange={(ev) => handleSelectPlayer(ev)}
                                defaultValue={router.query.showPlayer}
                            >
                                <option value="">...</option>
                                {allPlayers?.map((player) => {
                                    return (
                                        <option
                                            key={player.slug}
                                            value={player.slug}
                                        >
                                            {player.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* {<Debugg data={currentJourney} />} */}
                    {/* {<Debugg data={result} />}
                    {<Debugg data={heuristicsByJourney} />} */}
                    {/* {<Debugg data={getPlayerObj(showPlayer).valuePrev} />} */}
                    {/* {<Debugg data={allJourneyScores} />}  */}
                    {/* {<Debugg data={allPlayers} />} */}
                    {/* {<Debugg data={journeyScoresDatasetArr} />} */}
                    {/* <Debugg
                        data={
                            getPreviousScoresByPlayer(showPlayer) &&
                            getPreviousScoresByPlayer(showPlayer)[
                                currentJourney
                            ]
                        }
                    /> */}

                    {selectedHeuristic !== null ? (
                        <div>
                            <div className="heuristic-chart">
                                <header className="flex justify-between mb-6 items-center px-4 gap-3">
                                    <h1 className="text-xl font-bold">
                                        <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                        Heuristic Chart
                                    </h1>
                                    <div className="text-lg flex items-center gap-1 whitespace-nowrap">
                                        <b>Average: </b>
                                        <span className=" text-slate-500">
                                            {allJourneyScores.average_score}
                                        </span>
                                    </div>
                                </header>

                                <div className="bg-white dark:bg-slate-800 pb-1 rounded-lg shadow-lg max-w-fit mb-16">
                                    <div className="flex border-b px-4 min-h-[50px]">
                                        <div className="flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
                                            <p>Selected Heuristic:</p>
                                        </div>
                                        <div className="flex gap-2 text-sm pt-4 pb-4">
                                            <b>
                                                {
                                                    selectedHeuristic?.heuristicNumber
                                                }
                                            </b>
                                            <span className="max-w-lg text-slate-700">
                                                {selectedHeuristic?.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        style={{ width: 864 }}
                                        className=" px-8 pt-8 pb-4"
                                    >
                                        <BarChart
                                            refDom={chartRef}
                                            // allJourneyScores={allJourneyScores}
                                            dataSet={
                                                allJourneyScores.scores_by_heuristic
                                            }
                                            averageLine={
                                                allJourneyScores.average_score
                                            }
                                        />
                                        <div className="mt-4 flex gap-10">
                                            <button
                                                className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 whitespace-nowrap text-sm"
                                                onClick={() =>
                                                    handleClickCopySvg(
                                                        chartRef,
                                                        "id1"
                                                    )
                                                }
                                            >
                                                {svgCopied?.id1
                                                    ? "✅ SVG Copied"
                                                    : "Copy as SVG"}
                                            </button>
                                            <button
                                                className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400  whitespace-nowrap text-sm"
                                                onClick={() =>
                                                    handleClickCopyPng(
                                                        chartRef,
                                                        {
                                                            heuristicNumber:
                                                                selectedHeuristic?.heuristicNumber,
                                                            playerSlug:
                                                                showPlayer,
                                                        }
                                                    )
                                                }
                                            >
                                                Export as a PNG file
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        style={{ width: 864 }}
                                        className="px-8 pb-8"
                                    >
                                        <h3 className="text-lg font-bold my-5">
                                            Score Stats
                                        </h3>

                                        <table className="table-fixed w-full text-sm  text-center">
                                            <thead className="border border-b-4 h-10">
                                                <tr>
                                                    <th className="border border-solid w-[120px]">
                                                        Score value
                                                    </th>
                                                    <th className="border border-solid w-[220px]">
                                                        Amount of players by
                                                        score
                                                    </th>
                                                    <th className="border border-solid">
                                                        Players by score
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {getUniqueScores(
                                                    allJourneyScores.scores_by_heuristic
                                                ).map((score) => (
                                                    <tr key={score.score}>
                                                        <td
                                                            className={getCellColor(
                                                                score.score
                                                            )}
                                                        >
                                                            {score.score}
                                                        </td>
                                                        <td className="border  border-solid h-12">
                                                            <b className="text-xl">
                                                                {score.qtd}
                                                            </b>
                                                        </td>
                                                        <td className="text-left p-2 text-xs border-l border  border-solid">
                                                            {score.players}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <h3 className="text-lg font-bold mt-10 mb-5">
                                            Score Criteria
                                        </h3>
                                        <p className="text-xs break-all whitespace-pre-wrap">
                                            {selectedHeuristic?.description}
                                        </p>
                                        {/* <Debugg
                                            data={getUniqueScores(
                                                allJourneyScores.scores_by_heuristic
                                            )}
                                        /> */}
                                    </div>
                                </div>
                            </div>

                            <div className="comparative-chart">
                                {showPlayer &&
                                allJourneyScores &&
                                allJourneyScores.scores_by_heuristic &&
                                hasComparison &&
                                router.query.journey ? (
                                    <>
                                        <header className="flex justify-between mb-6 items-center px-4 gap-3">
                                            <h1 className="text-xl font-bold">
                                                <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                                Comparative Chart
                                            </h1>
                                        </header>
                                        <div className="bg-white dark:bg-slate-800 pb-1 rounded-lg shadow-lg mb-16">
                                            <div className="flex border-b px-4 min-h-[50px]">
                                                <div className="flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
                                                    <p>Selected Heuristic:</p>
                                                </div>
                                                <div className="flex gap-2 text-sm pt-4 pb-4">
                                                    <b>
                                                        {
                                                            selectedHeuristic?.heuristicNumber
                                                        }
                                                    </b>
                                                    <span className="max-w-lg text-slate-700">
                                                        {
                                                            selectedHeuristic?.name
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                            <div className=" px-8 pt-8 pb-4">
                                                <div className="flex flex-col items-center">
                                                    {/* <CompareBar
                                                        showPlayer={showPlayer}
                                                        allJourneyScores={
                                                            allJourneyScores
                                                        }
                                                        prevScores={
                                                            prevScores[
                                                                showPlayer
                                                            ][currentJourney]
                                                        }
                                                        currentJourney={
                                                            router.query.journey
                                                        }
                                                        selectedHeuristic={
                                                            selectedHeuristic
                                                        }
                                                        refDom={chartCompareRef}
                                                    /> */}
                                                    <CompareBar
                                                        showPlayer={showPlayer}
                                                        allJourneyScores={
                                                            allJourneyScores
                                                        }
                                                        prevScores={
                                                            getPreviousScoresByPlayer(
                                                                showPlayer
                                                            ) &&
                                                            getPreviousScoresByPlayer(
                                                                showPlayer
                                                            )[currentJourney]
                                                        }
                                                        currentJourney={
                                                            router.query.journey
                                                        }
                                                        selectedHeuristic={
                                                            selectedHeuristic
                                                        }
                                                        refDom={chartCompareRef}
                                                    />
                                                </div>
                                                <div className="mt-4 flex gap-10">
                                                    <button
                                                        className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 text-sm"
                                                        onClick={() =>
                                                            handleClickCopySvg(
                                                                chartCompareRef,
                                                                "id2"
                                                            )
                                                        }
                                                    >
                                                        {svgCopied?.id2
                                                            ? "✅ SVG Copied"
                                                            : "Copy as SVG"}
                                                    </button>
                                                    <button
                                                        className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 text-sm"
                                                        onClick={() =>
                                                            handleClickCopyPng(
                                                                chartCompareRef,
                                                                {
                                                                    heuristicNumber:
                                                                        selectedHeuristic?.heuristicNumber,
                                                                    playerSlug:
                                                                        showPlayer +
                                                                        "_comp",
                                                                }
                                                            )
                                                        }
                                                    >
                                                        Export as a PNG file
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        currentJourney &&
                        isValidJourney(currentJourney) && (
                            <div className="mb-10">
                                <div className="flex border-orange-200 border bg-yellow-100 min-h-[64px]">
                                    <div className="w-24 flex items-center justify-center">
                                        <svg
                                            width="100"
                                            height="100"
                                            viewBox="0 0 100 100"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            style={{ width: 36, height: 36 }}
                                        >
                                            <path
                                                d="M50 90C60.6087 90 70.7828 85.7857 78.2843 78.2843C85.7857 70.7828 90 60.6087 90 50C90 39.3913 85.7857 29.2172 78.2843 21.7157C70.7828 14.2143 60.6087 10 50 10C39.3913 10 29.2172 14.2143 21.7157 21.7157C14.2143 29.2172 10 39.3913 10 50C10 60.6087 14.2143 70.7828 21.7157 78.2843C29.2172 85.7857 39.3913 90 50 90ZM50 100C22.385 100 0 77.615 0 50C0 22.385 22.385 0 50 0C77.615 0 100 22.385 100 50C100 77.615 77.615 100 50 100ZM45 45V75H55V45H45ZM45 25H55V35H45V25Z"
                                                fill="orange"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-slate-800/70 py-4 pl-0 pr-5 text-lg flex-1">
                                        Please, find and select an heuristic.
                                    </p>
                                </div>
                            </div>
                        )
                    )}

                    {currentJourney && isValidJourney(currentJourney) ? (
                        <>
                            <header className="flex justify-between mb-6 items-center px-4 gap-3">
                                <h1 className="text-xl font-bold">
                                    <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                    Journey Chart
                                </h1>
                                <div className="text-lg flex items-center gap-1 whitespace-nowrap">
                                    <b>Average: </b>
                                    <span className=" text-slate-500">
                                        {(averageJourneyScore * 100).toFixed(2)}
                                        %
                                    </span>
                                </div>
                            </header>
                            <div className="bg-white dark:bg-slate-800 pb-1 rounded-lg shadow-lg max-w-fit mb-16">
                                <div className="flex border-b px-4 min-h-[50px]">
                                    <div className="flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
                                        <p>Selected Journey:</p>
                                    </div>
                                    <div className="flex gap-2 text-sm pt-4 pb-4">
                                        <b className="max-w-lg text-slate-700">
                                            {
                                                allJourneys.find(
                                                    (journey) =>
                                                        journey.slug ===
                                                        currentJourney
                                                )?.name
                                            }
                                        </b>
                                    </div>
                                    {showPlayer && (
                                        <>
                                            <div className="ml-auto flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
                                                <p>Player Score:</p>
                                            </div>
                                            <div className="flex gap-2 text-sm pt-4 pb-4">
                                                <b className="max-w-lg text-slate-700">
                                                    {(
                                                        journeyScoresDatasetArr.find(
                                                            (player) =>
                                                                player.playerSlug ===
                                                                showPlayer
                                                        )?.value * 100
                                                    ).toFixed(2)}
                                                    %
                                                </b>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className=" px-8 pt-8 pb-4">
                                    <BarChart
                                        refDom={journeyChartRef}
                                        // allJourneyScores={allJourneyScores}
                                        dataSet={journeyScoresDatasetArr}
                                        averageLine={averageJourneyScore}
                                        percentage
                                    />
                                    <div className="mt-4 flex gap-10">
                                        <button
                                            className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 whitespace-nowrap text-sm"
                                            onClick={() =>
                                                handleClickCopySvg(
                                                    journeyChartRef,
                                                    "id3"
                                                )
                                            }
                                        >
                                            {svgCopied?.id3
                                                ? "✅ SVG Copied"
                                                : "Copy as SVG"}
                                        </button>
                                        <button
                                            className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400  whitespace-nowrap text-sm"
                                            onClick={() =>
                                                handleClickCopyPng(
                                                    journeyChartRef,
                                                    {
                                                        playerSlug: showPlayer,
                                                    }
                                                )
                                            }
                                        >
                                            Export as a PNG file
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="mb-10">
                            <div className="flex border-red-200 border bg-red-50 min-h-[64px]">
                                <div className="w-24 flex items-center justify-center">
                                    <svg
                                        width="100"
                                        height="100"
                                        viewBox="0 0 100 100"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{ width: 36, height: 36 }}
                                    >
                                        <path
                                            d="M50 90C60.6087 90 70.7828 85.7857 78.2843 78.2843C85.7857 70.7828 90 60.6087 90 50C90 39.3913 85.7857 29.2172 78.2843 21.7157C70.7828 14.2143 60.6087 10 50 10C39.3913 10 29.2172 14.2143 21.7157 21.7157C14.2143 29.2172 10 39.3913 10 50C10 60.6087 14.2143 70.7828 21.7157 78.2843C29.2172 85.7857 39.3913 90 50 90ZM50 100C22.385 100 0 77.615 0 50C0 22.385 22.385 0 50 0C77.615 0 100 22.385 100 50C100 77.615 77.615 100 50 100ZM45 45V75H55V45H45ZM45 25H55V35H45V25Z"
                                            fill="red"
                                        />
                                    </svg>
                                </div>
                                <p className="text-slate-800/70 py-4 pl-0 pr-5 text-lg flex-1">
                                    Please, Select a valid Journey.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
