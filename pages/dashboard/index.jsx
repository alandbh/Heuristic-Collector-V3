import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { gql } from "@apollo/client";
import { saveSvgAsPng } from "save-svg-as-png";
import client from "../../lib/apollo";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import Debugg from "../../lib/Debugg";

import BarChart from "../../components/BarChart";
import CompareBar from "../../components/CompareBar";
import Select from "../../components/Select";
import SearchBoxSimple from "../../components/SearchBoxSimple";
import ChartSection from "../../components/ChartSection";
import ScoreStatsTable from "../../components/ScoreStatsTable";
import { sortCollection } from "../../lib/utils";

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
            departmentObj {
                departmentName
                departmentSlug
                departmentOrder
            }
            previousScores
        }
    }
`;

function Dashboard() {
    const router = useRouter();
    const { project, heuristic, showPlayer, journey } = router.query;
    const [allJourneyScores, setAllJourneyScores] = useState(null);
    const [scoresByJourney, setScoresByJourney] = useState(null);
    const [allProjectScores, setAllProjectScores] = useState(null);
    const [allHeuristics, setAllHeuristics] = useState(null);
    const [allJourneys, setAllJourneys] = useState(null);
    const [allPlayers, setAllPlayers] = useState(null);
    const [currentJourney, setCurrentJourney] = useState(null);
    const [heuristicsByJourney, setHeuristicsByJourney] = useState(null);
    const [selectedHeuristic, setSelectedHeuristic] = useState(null);
    const [svgCopied, setSVGCopied] = useState(null);
    const [pngSrc, setPngSrc] = useState(null);
    const inputRef = useRef(null);
    const chartRef = useRef(null);
    const chartCompareRef = useRef(null);
    const journeyChartRef = useRef(null);
    const searchRef = useRef(null);
    const [user, loadingUser] = useAuthState(auth);

    function fetchAllJourneyScores(project, journey, heuristic, showPlayer) {
        if (!project || !journey) {
            return;
        }

        fetch(
            `/api/all?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}`
        ).then((data) => {
            data.json().then((result) => {
                // const orderedResults = result
                setAllJourneyScores(result);
            });
        });
    }
    function fetchAllProjectScores(project) {
        if (!project) {
            return;
        }

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
                    const orderedPlayers = sortCollection(data.players, "slug");

                    setAllPlayers(orderedPlayers);
                });
        }
    }, [router.query.project]);

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

    useEffect(() => {
        if (allHeuristics && allHeuristics.length > 0) {
            const heuristicsByJourneyFiltered = allHeuristics?.filter(
                (heuristic) => {
                    // Filterin the heuristics which the journeys array is empty
                    if (heuristic.journeys.length === 0) {
                        return true;
                    } else {
                        // Filtering the heuristics by the current journey and if journey is empty.
                        return (
                            heuristic.journeys.filter(
                                (journey) => journey.slug === currentJourney
                            ).length > 0
                        );
                    }
                }
            );
            setHeuristicsByJourney(heuristicsByJourneyFiltered);
            if (inputRef.current !== null) {
                inputRef.current.value = "";
                // setResult([]);
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
        // setResult([]);
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
        // setResult([]);
        // setSelectedHeuristic(null);
    }

    function handleClickHeuristic(item) {
        console.log({ item });
        setSelectedHeuristic({
            heuristicNumber: item.item.heuristicNumber,
            name: item.item.name,
        });
        // setResult([]);

        router.replace({
            query: {
                ...router.query,
                heuristic: item.item.heuristicNumber,
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

    const departmentList = Array.from(
        new Set(
            allJourneyScores.scores_by_heuristic?.map((score) => {
                return score.departmentSlug;
            })
        )
    );

    const isThereDepartments = allJourneyScores.scores_by_heuristic?.some(
        (score) => {
            return score.departmentSlug !== null;
        }
    );

    const datasetWithDepartments = [];
    departmentList.map((department, index) => {
        allJourneyScores.scores_by_heuristic
            .filter((score) => score.departmentSlug === department)
            .map((score) => {
                datasetWithDepartments.push(score);
            });

        if (index !== departmentList.length - 1) {
            datasetWithDepartments.push({
                label: "Separator",
                playerSlug: "separator",
                show_player: false,
                value: 0,
                valuePrev: null,
                averageScoreValuePrev: null,
                ignore_journey: false,
                zeroed_journey: false,
            });
        }
    });

    function path(pathParams) {
        const { w, h, tlr, trr, brr, blr, x = 0, maxHeight = 512 } = pathParams;
        const y = maxHeight - h;
        return `
            M ${x} ${tlr + y} 
            A ${tlr} ${tlr} 0 0 1 ${tlr + x} ${y} 
            L ${w - trr + x} ${y} 
            A ${trr} ${trr} 0 0 1 ${w + x} ${trr + y} 
            L ${w + x} ${h - brr}
            A ${brr} ${brr} 0 0 1 ${w - brr + x} ${h + y} 
            L ${blr + x} ${h + y} 
            A ${blr} ${blr} 0 0 1 ${x} ${h - blr} 
            Z`;
    }

    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50 p-10">
            <main className="mt-10 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                <div className="w-[864px] mx-auto flex flex-col">
                    <div className="flex w-full gap-10 mb-10 text-sm">
                        <Select
                            label="Select a journey"
                            onChange={(ev) => handleSelectJourney(ev)}
                            defaultValue={currentJourney}
                            options={allJourneys}
                        />

                        <div
                            className={`flex flex-col gap-1 flex-1 ${
                                currentJourney ? "opacity-100" : "opacity-40"
                            }`}
                            ref={searchRef}
                        >
                            <SearchBoxSimple
                                label="Find the heuristic"
                                type="search"
                                name="search"
                                id="search"
                                autoComplete="off"
                                accessKey="s"
                                disabled={!currentJourney}
                                onItemClick={handleClickHeuristic}
                                collection={heuristicsByJourney}
                                srOnlyIconText="Search for heuristics"
                                filterBy={["name", "heuristicNumber"]}
                            />
                        </div>
                        <div
                            className={`flex flex-col gap-1 flex-1 ${
                                currentJourney ? "opacity-100" : "opacity-40"
                            }`}
                        >
                            <Select
                                label="Select a player to highlight it"
                                disabled={!currentJourney}
                                onChange={(ev) => handleSelectPlayer(ev)}
                                defaultValue={router.query.showPlayer}
                                options={allPlayers}
                            />
                        </div>
                    </div>
                    {/* Debbugging  */}
                    {/* {<Debugg data={allJourneyScores.scores_by_heuristic} />} */}

                    {selectedHeuristic !== null &&
                    allJourneyScores.scores_by_heuristic ? (
                        <div>
                            <ChartSection
                                title="Heuristic Chart"
                                average={allJourneyScores.average_score}
                            >
                                <div className="flex border-b px-4 min-h-[50px]">
                                    <div className="flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
                                        <p>Selected Heuristic:</p>
                                    </div>
                                    <div className="flex gap-2 text-sm pt-4 pb-4">
                                        <b>
                                            {selectedHeuristic?.heuristicNumber}
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
                                    {/* <Debugg
                                        data={
                                            allJourneyScores?.scores_by_heuristic
                                        }
                                    /> */}

                                    <svg
                                        width="500"
                                        height={512}
                                        viewBox="0 0 500 512"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d={path({
                                                w: 40,
                                                h: 312,
                                                tlr: 20,
                                                trr: 20,
                                                brr: 0,
                                                blr: 0,
                                                x: 0,
                                                maxHeight: 512,
                                            })}
                                            fill="red"
                                        />
                                        <path
                                            d={path({
                                                w: 40,
                                                h: 412,
                                                tlr: 20,
                                                trr: 20,
                                                brr: 0,
                                                blr: 0,
                                                x: 50,
                                                maxHeight: 512,
                                            })}
                                            fill="red"
                                        />
                                        <path
                                            d={path({
                                                w: 40,
                                                h: 512,
                                                tlr: 20,
                                                trr: 20,
                                                brr: 0,
                                                blr: 0,
                                                x: 100,
                                                maxHeight: 512,
                                            })}
                                            fill="red"
                                        />
                                    </svg>

                                    {isThereDepartments ? (
                                        <BarChart
                                            refDom={chartRef}
                                            // allJourneyScores={allJourneyScores}
                                            dataSet={datasetWithDepartments}
                                            hasSeparator={true}
                                            averageLine={
                                                allJourneyScores.average_score
                                            }
                                        />
                                    ) : (
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
                                    )}

                                    {/* Debbugging  */}
                                    {<Debugg data={departmentList} />}
                                    {<Debugg data={datasetWithDepartments} />}
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
                                                handleClickCopyPng(chartRef, {
                                                    heuristicNumber:
                                                        selectedHeuristic?.heuristicNumber,
                                                    playerSlug: showPlayer,
                                                })
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

                                    <ScoreStatsTable
                                        collection={
                                            allJourneyScores.scores_by_heuristic
                                        }
                                    />

                                    <h3 className="text-lg font-bold mt-10 mb-5">
                                        Score Criteria
                                    </h3>
                                    <p className="text-xs break-all whitespace-pre-wrap">
                                        {selectedHeuristic?.description}
                                    </p>
                                </div>
                            </ChartSection>

                            {showPlayer &&
                            allJourneyScores &&
                            allJourneyScores.scores_by_heuristic &&
                            hasComparison &&
                            router.query.journey ? (
                                <ChartSection title="Comparative Chart">
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
                                    <div className=" px-8 pt-8 pb-4">
                                        <div className="flex flex-col items-center">
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
                                </ChartSection>
                            ) : null}
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
                        <ChartSection
                            title="Journey Chart"
                            average={(averageJourneyScore * 100).toFixed(2)}
                        >
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
                                    isPercentage
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
                        </ChartSection>
                    ) : null}
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
