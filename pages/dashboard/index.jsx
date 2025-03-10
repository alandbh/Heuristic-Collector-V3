import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { gql } from "@apollo/client";
import { saveSvgAsPng } from "save-svg-as-png";
import client from "../../lib/apollo";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import Debugg from "../../lib/Debugg";

import BarChart from "../../components/BarChart";
import Select from "../../components/Select";
import SearchBoxSimple from "../../components/SearchBoxSimple";
import ChartSection from "../../components/ChartSection";
import ScoreStatsTable from "../../components/ScoreStatsTable";
import { getAverage, sortCollection } from "../../lib/utils";
import BarChartCompare from "../../components/BarChartCompare";
import { useProject } from "../../lib/useProject";
import { useProjectFinance } from "../../lib/useProjectFinance";
import useFinalScoresDataset from "../../lib/useFinalScores";

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
            project {
                name
                slug
                year
            }
        }
    }
`;

const QUERY_PLAYERS = gql`
    query GetAllPlayers($projectSlug: String) {
        players(first: 10000, where: { project: { slug: $projectSlug } }) {
            name
            slug
            showInChart
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
    const { project, heuristic, showPlayer, journey, showManyPlayers, aaa } =
        router.query;
    const [allJourneyScores, setAllJourneyScores] = useState(null);
    const [scoresByJourney, setScoresByJourney] = useState(null);
    const [allProjectScores, setAllProjectScores] = useState(null);
    const [allHeuristics, setAllHeuristics] = useState(null);
    const [allJourneys, setAllJourneys] = useState(null);
    const [allPlayers, setAllPlayers] = useState(null);
    const [currentJourney, setCurrentJourney] = useState(null);
    const [heuristicsByJourney, setHeuristicsByJourney] = useState(null);
    const [selectedHeuristic, setSelectedHeuristic] = useState(null);
    const [compareDataset, setCompareDataset] = useState(null);
    const [hasComparison, setHasComparison] = useState(false);
    const [svgCopied, setSVGCopied] = useState(null);
    const inputRef = useRef(null);
    const chartRef = useRef(null);
    const chartJourneyRef = useRef(null);
    const chartCompareRef = useRef(null);
    const journeyChartRef = useRef(null);
    const finalChartRef = useRef(null);
    const searchRef = useRef(null);
    const [user, loadingUser] = useAuthState(auth);

    const fetchAllJourneyScores = useCallback(
        (project, journey, heuristic, showPlayer, showManyPlayers) => {
            if (!project || !journey) {
                return;
            }

            fetch(
                `/api/all?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}&showManyPlayers=${showManyPlayers}`
            ).then((data) => {
                data.json().then((result) => {
                    // const orderedResults = result
                    setAllJourneyScores(result);
                });
            });
        }
    );

    // function fetchAllJourneyScores(
    //     project,
    //     journey,
    //     heuristic,
    //     showPlayer,
    //     showManyPlayers
    // ) {
    //     if (!project || !journey) {
    //         return;
    //     }

    //     fetch(
    //         `/api/all?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}&showManyPlayers=${showManyPlayers}`
    //     ).then((data) => {
    //         data.json().then((result) => {
    //             // const orderedResults = result
    //             setAllJourneyScores(result);
    //         });
    //     });
    // }
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
                    const filteredPlayers = data.players.filter(
                        (player) =>
                            player.showInChart === null ||
                            player.showInChart === true
                    );

                    const orderedPlayers = sortCollection(
                        filteredPlayers,
                        "slug"
                    );

                    setAllPlayers(orderedPlayers);
                });
        }
    }, [router.query.project]);

    useEffect(() => {
        fetchAllProjectScores(project);
        fetchAllJourneyScores(
            project,
            journey,
            heuristic,
            showPlayer,
            showManyPlayers
        );
        getHeuristics();
        getJourneys();
        getPlayers();
    }, [
        project,
        heuristic,
        showPlayer,
        showManyPlayers,
        journey,
        // getHeuristics,
        // getJourneys,
        // getPlayers,
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

    /**
     *
     * Mover este useffect para um custom hook
     * que retorna um selectedHeuristic
     */

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
        // console.log("allJourneys", allJourneys);

        const filteredAllProjectScores = allProjectScores?.filter((player) => {
            return (
                !player.scores[currentJourney]?.ignore_journey &&
                (player.showInChart === null || player.showInChart === true)
            );
        });

        const scores = filteredAllProjectScores?.map((playerScore) => {
            const playerObj = {};
            playerObj.journeyScores = {};
            playerObj.journeyScoresArr = [];

            playerObj.playerSlug = playerScore.slug;
            playerObj.playerName = playerScore.name;

            // setScoresByJourney(currentJourney);

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
            // function setScoresByJourney(journey) {}

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
            const geraisMaximumScore = geraisArr.length * 5;

            // Jornada	Peso de Gerais

            const geraisWeight = {
                "open-finance": 0.25,
                cartao: 0.625,
                abertura: 0.5416666667,
                gerais: 0,
            };

            const maximunScore = allProjectScores.length * 5;
            const maximunJourneyScore = playerObj.journeyScoresArr.length * 5;

            // Calculating current journey score based on gerais weight

            // if (playerScore.slug === "banco-do-brasil") {
            //     console.log(
            //         "aaa",
            //         geraisMaximumScore * geraisWeight[currentJourney]
            //     );
            // }

            if (geraisArr.length === 0) {
                // for Retail
                playerObj.journeyTotalScore = journeyTotalScore;
                playerObj.journeyTotalPercentage =
                    journeyTotalScore / maximunJourneyScore;
                playerObj.maximunScore = maximunScore;
                playerObj.maximunJourneyScore = maximunJourneyScore;
                return playerObj;
            }

            if (playerScore.scores[currentJourney]?.zeroed_journey) {
                playerObj.journeyTotalPercentage = 0;
                playerObj.journeyTotalScore = 0;
            } else {
                playerObj.journeyTotalPercentage =
                    (geraisTotalScore * geraisWeight[currentJourney] +
                        journeyTotalScore) /
                    (geraisMaximumScore * geraisWeight[currentJourney] +
                        maximunJourneyScore);
                playerObj.journeyTotalScore = journeyTotalScore;
            }

            playerObj.geraisTotalScore = geraisTotalScore;
            playerObj.maximunScore = maximunScore;
            playerObj.maximunJourneyScore = maximunJourneyScore;

            playerObj;
            return playerObj;
        });

        const filterdScores = scores?.filter(
            (score) => score.journeyScoresArr.length > 0
        );

        setScoresByJourney(filterdScores);
    }, [allProjectScores, currentJourney]);

    /**
     *
     * Getting the Project data, including the previous scores
     *
     */

    const departmentList = Array.from(
        new Set(
            allJourneyScores?.scores_by_heuristic
                ?.filter((score) => score.departmentSlug !== null)
                .map((score) => {
                    return score.departmentSlug;
                })
        )
    )
        .filter((dep) => dep !== null)
        .sort();

    // const currentDepartment = departmentList.find()

    const {
        projectName,
        projectCurrentYear,
        previousProjectSlug,
        previousPlayerScoreAverage,
        previousAllPlayersScoreAverage,
        previousDepartmentPlayersScoreAverage,
    } = useProject(router.query.project, showPlayer, router.query.heuristic);

    useEffect(() => {
        if (!allJourneyScores) {
            return;
        }

        const dataset = {};

        const playerScore = getScoreFromPlayerSlug(
            showPlayer,
            allJourneyScores?.scores_by_heuristic,
            "allJourneysScoreAverage"
        );

        const currentPlayerObj = allJourneyScores?.scores_by_heuristic?.find(
            (score) => score.playerSlug === router.query.showPlayer
        );

        // console.log("playerScore", currentPlayerObj);

        // console.log(
        //     "allJourneyScores.scores_by_heuristic",
        //     allJourneyScores.scores_by_heuristic.filter((score) =>
        //         departmentList.includes(currentPlayerObj.departmentSlug)
        //     )
        // );

        const currentDepartmentScores =
            allJourneyScores.scores_by_heuristic?.filter(
                (score) =>
                    score.departmentSlug === currentPlayerObj?.departmentSlug
            );

        // console.log("currentDepartmentScores", currentDepartmentScores);

        const averageScore =
            project.includes("retail") || project.includes("latam")
                ? getAverageScore(
                      currentDepartmentScores,
                      "allJourneysScoreAverage"
                  )
                : getAverageScore(
                      allJourneyScores.scores_by_heuristic,
                      "value"
                  );

        dataset.currentYearScores = {
            year: projectCurrentYear,
            playerScore,
            averageScore,
        };

        dataset.previousYearScores = {
            year: projectCurrentYear - 1,
            playerScore: previousPlayerScoreAverage,
            // averageScore: previousAllPlayersScoreAverage,
            averageScore: previousDepartmentPlayersScoreAverage,
        };
        if (
            router.query.project.includes("retail") ||
            router.query.project.includes("latam")
        ) {
            setCompareDataset(dataset);
            setHasComparison(Boolean(previousPlayerScoreAverage));
        }
    }, [
        allJourneyScores,
        previousAllPlayersScoreAverage,
        previousPlayerScoreAverage,
        project,
        projectCurrentYear,
        projectName,
        showPlayer,
    ]);

    /**
     *
     * Prepares the dataset for comparison v4
     */

    const {
        _projectCurrentYear,
        _playerScore,
        _previousPlayerScore,
        _previousAllPlayersScoreAverage,
        _allPlayersScoreAverageWithZeroed,
    } = useProjectFinance(
        router.query.project,
        showPlayer,
        router.query.journey,
        router.query.heuristic
    );

    useEffect(() => {
        if (!router.query.project) {
            return;
        }
        const dataset = {};

        dataset.currentYearScores = {
            year: _projectCurrentYear,
            playerScore: _playerScore,
            averageScore: _allPlayersScoreAverageWithZeroed,
        };

        dataset.previousYearScores = {
            year: _projectCurrentYear - 1,
            playerScore: _previousPlayerScore,
            // averageScore: previousAllPlayersScoreAverage,
            averageScore: _previousAllPlayersScoreAverage,
        };

        if (router.query.project.includes("finance")) {
            setCompareDataset(dataset);
            setHasComparison(Boolean(_previousPlayerScore));
        }
    }, [
        _allPlayersScoreAverageWithZeroed,
        _playerScore,
        _previousAllPlayersScoreAverage,
        _previousPlayerScore,
        _projectCurrentYear,
        router.query.project,
    ]);

    /**
     *
     *
     * Preparing the dataset for the Journey Chart
     *
     *
     */

    let journeyScoresDatasetArr = useMemo(() => {
        let colorNumber = 1;
        if (scoresByJourney) {
            const dataset = scoresByJourney.map((player) => {
                const playerObj = {};
                playerObj.value = player.journeyTotalPercentage;
                playerObj.total = player.journeyTotalScore;
                playerObj.label = player.playerName;
                playerObj.maximunJourneyScore = player.maximunJourneyScore;
                playerObj.playerSlug = player.playerSlug;
                playerObj.show_player = player.playerSlug === showPlayer;
                playerObj.barColor = player.barColor;
                if (
                    showManyPlayers &&
                    showManyPlayers.includes(playerObj.playerSlug)
                ) {
                    playerObj.show_player = true;
                    playerObj.barColor = "color_" + colorNumber++;
                } else {
                    // playerObj.barColor = "color_0";
                    playerObj.barColor =
                        playerObj.playerSlug === showPlayer
                            ? "color_1"
                            : "color_0";
                }

                return playerObj;
            });
            return dataset;
        }
    }, [scoresByJourney, showManyPlayers, showPlayer]);

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
            // console.log("bbb", scoresArr);

            // console.log("sum", sumScores / scoresArr.length);

            return sumScores / scoresArr.length;
        }
    }, [scoresByJourney, journeyScoresDatasetArr]);

    const apikey = "20rga24";
    let allowedExternalUser = apikey === router.query.apikey;

    /**
     *
     * ----------------------------------------------------------------
     * GETTING FINAL SCORES DATASET
     * ----------------------------------------------------------------
     *
     *
     */

    const finalScoresDataset = useFinalScoresDataset(
        allProjectScores,
        allJourneys,
        showPlayer
    );

    // console.log("finalScoresDataset", finalScoresDataset);

    if (!user && !loadingUser && !allowedExternalUser) {
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

    // if (!allowedExternalUser) {
    // }
    if (
        allJourneyScores === null ||
        allProjectScores === null ||
        allHeuristics === null ||
        allJourneys === null ||
        allPlayers === null ||
        !journeyScoresDatasetArr ||
        heuristicsByJourney === null
        // || !user
    ) {
        return null;
    }

    function handleSelectJourney(ev) {
        // console.log("Journey", ev.target.value);
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
        },
        scale = 2
    ) {
        saveSvgAsPng(
            ref.current,
            `chart-${currentJourney}${
                heuristicNumber && "-h_" + heuristicNumber
            }${playerSlug && "-" + playerSlug}.png`,
            { scale }
        );
    }

    // Retrying to fectch the scores in case the api returns empty data
    if (allJourneyScores.average_score === null) {
        // fetchAllJourneyScores()
        fetchAllJourneyScores(project, journey, heuristic, showPlayer);
    }

    function isValidJourney(journeySlugToTest) {
        return Boolean(
            allJourneys.find((journey) => journey.slug === journeySlugToTest)
        );
    }

    const datasetWithSeparatorUnsorted = [];
    // console.log("departmentList", departmentList);
    departmentList.map((department, index) => {
        allJourneyScores.scores_by_heuristic
            .filter((score) => score.departmentSlug === department)
            .map((score) => {
                datasetWithSeparatorUnsorted.push(score);
            });
    });

    const datasetWithSeparator = sortCollection(
        datasetWithSeparatorUnsorted,
        "departmentOrder"
    );

    function getAverageScore(dataSetArray, keyValue = "value") {
        const dataSetWithoutSeparator = dataSetArray?.filter(
            (score) => score.playerSlug !== "separator"
        );

        if (!dataSetWithoutSeparator) {
            return;
        }

        const average_score = Number(
            (
                dataSetWithoutSeparator
                    .map((score) => score[keyValue])
                    .reduce((acc, n) => {
                        return acc + n;
                    }, 0) / dataSetWithoutSeparator.length
            ).toFixed(2)
        );

        // console.log("dataSetWithoutSeparator", dataSetWithoutSeparator);

        return average_score;
    }

    function getScoreFromPlayerSlug(playerSlug, scores, key) {
        if (!scores) {
            return;
        }
        const playerScore = scores.find(
            (score) => score.playerSlug === playerSlug
        );

        return key && playerScore ? playerScore[key] : playerScore;
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
                                placeholder="type the number or the name of the heuristic"
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
                    {/* {
                        <Debugg
                            data={allJourneyScores.scores_by_heuristic.filter(
                                (score) => score.departmentSlug !== null
                            )}
                        />
                    } */}
                    {/* {<Debugg data={departmentList} />} */}
                    {/* {<Debugg data={datasetWithSeparator} />} */}

                    {selectedHeuristic !== null &&
                    allJourneyScores.scores_by_heuristic ? (
                        <div>
                            <ChartSection
                                title="Heuristic Chart"
                                average={
                                    project.includes("retail") ||
                                    project.includes("latam")
                                        ? getAverageScore(
                                              datasetWithSeparator,
                                              "allJourneysScoreAverage"
                                          )
                                        : getAverageScore(
                                              datasetWithSeparator,
                                              "value"
                                          )
                                }
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

                                {project.includes("retail") ||
                                project.includes("latam") ? (
                                    <div
                                        style={{ width: 864 }}
                                        className=" px-8 pt-8 pb-4"
                                    >
                                        <h3 className="text-lg font-bold my-5">
                                            Average scores for all journeys
                                        </h3>
                                        {/* <Debugg data={datasetWithSeparator} /> */}

                                        <BarChart
                                            refDom={chartRef}
                                            dataSet={datasetWithSeparator}
                                            valueKey={"allJourneysScoreAverage"}
                                            averageLine={getAverageScore(
                                                datasetWithSeparator,
                                                "allJourneysScoreAverage"
                                            )}
                                            height={251}
                                            width={915}
                                            radius={4}
                                            gap={12}
                                            barWidth={16}
                                            separatorWidth={69}
                                            barColors="#a5a5a5, #4285F4, #174EA6, #333"
                                            averageLineColor="#a5a5a5"
                                            averageLineDash="8,7"
                                            averageLineWidth={1.8}
                                            hOffset={0}
                                            vOffset={0}
                                            id="heuristic-chart"
                                        />

                                        {/* Debbugging  */}
                                        {/* {<Debugg data={departmentList} />} */}
                                        {/* {<Debugg data={datasetWithSeparator} />} */}
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
                                ) : (
                                    <div
                                        style={{ width: 864 }}
                                        className="px-8 pb-8"
                                    >
                                        <h3 className="text-lg font-bold my-5">
                                            Scores for{": "}
                                            {
                                                allJourneys.find(
                                                    (journey) =>
                                                        journey.slug ===
                                                        currentJourney
                                                )?.name
                                            }
                                        </h3>

                                        <BarChart
                                            refDom={chartRef}
                                            dataSet={datasetWithSeparator}
                                            // valueKey={"allJourneysScoreAverage"}
                                            averageLine={getAverageScore(
                                                datasetWithSeparator
                                            )}
                                            height={287}
                                            width={804}
                                            radius={0}
                                            gap={32}
                                            barWidth={18}
                                            separatorWidth={62}
                                            barColors="#BDC1C6, #4285f4, #174EA6, #333"
                                            averageLineColor="#EA4335"
                                            averageLineDash="0,0"
                                            averageLineWidth={1}
                                            hOffset={28}
                                            vOffset={0}
                                            id="heuristic-chart"
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
                                )}

                                <div
                                    style={{ width: 864 }}
                                    className="px-8 pb-8"
                                >
                                    <h3 className="text-lg font-bold my-5">
                                        Score Stats (for{" "}
                                        {
                                            allJourneys.find(
                                                (journey) =>
                                                    journey.slug ===
                                                    currentJourney
                                            )?.name
                                        }{" "}
                                        only).
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

                            <Debugg data={compareDataset}></Debugg>
                            {/* <Debugg data={hasComparison}></Debugg> */}

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
                                            <BarChartCompare
                                                refDom={chartCompareRef}
                                                dataSet={compareDataset}
                                                hOffset={29}
                                                barWidth={29}
                                                gap={50}
                                                gapBetweenCharts={38}
                                                height={224}
                                                barMaxHeight={169}
                                                width={367}
                                                barColor="#4285F4"
                                                bottomOffset={25}
                                                id="compare-chart"
                                                // hideBaseLine={true}
                                                // hideBaseText={true}
                                                // hideYears={true}
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
                    <div className="hidden">
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

                                {/* <Debugg data={scoresByJourney} />
                            <Debugg data={journeyScoresDatasetArr} /> */}

                                <div className=" px-8 pt-8 pb-4">
                                    {project.includes("retail") ||
                                    project.includes("latam") ? (
                                        <BarChart
                                            refDom={journeyChartRef}
                                            // allJourneyScores={allJourneyScores}
                                            dataSet={journeyScoresDatasetArr}
                                            barColors="#a5a5a5, #4285F4, #174EA6, #333 "
                                            averageLine={getAverageScore(
                                                journeyScoresDatasetArr
                                            )}
                                            isPercentage
                                            id="journey-chart"
                                        />
                                    ) : (
                                        <BarChart
                                            refDom={journeyChartRef}
                                            isPercentage
                                            dataSet={journeyScoresDatasetArr}
                                            averageLine={getAverageScore(
                                                journeyScoresDatasetArr
                                            )}
                                            height={251}
                                            width={915}
                                            radius={4}
                                            gap={12}
                                            barWidth={16}
                                            separatorWidth={69}
                                            barColors="#a5a5a5, #4285F4, #174EA6, #333"
                                            averageLineColor="#a5a5a5"
                                            averageLineDash="8,7"
                                            averageLineWidth={1.8}
                                            hOffset={0}
                                            vOffset={0}
                                            id="journey-chart"
                                        />
                                    )}

                                    {/* <Debugg data={scoresByJourney} /> */}
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

                    {/* 
                    *
                    *
                    * 
                    * 
                    ----------------------------------------------------------------
                    Final Scores Chart
                    ----------------------------------------------------------------
                    *
                    *
                    * 
                    * 
                     */}
                    {/* 
                    ================================================
                        
                        REMOVER DELETAR HARDCODED HARD CODED NUMBER 
                        (AVERAGE PROPERTY)

                    ================================================
                    */}
                    <div className="">
                        {currentJourney && isValidJourney(currentJourney) ? (
                            <ChartSection
                                title="Final Scores Chart"
                                // average={49.16} // REMOVER DELETAR HARDCODED HARD CODED NUMBER
                                average={
                                    project.includes("latam")
                                        ? 49.16
                                        : (
                                              getAverage(finalScoresDataset) *
                                              100
                                          ).toFixed(2)
                                }
                            >
                                <div className="flex border-b px-4 min-h-[50px]">
                                    {/* <div className="flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
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
                                    </div> */}
                                    {showPlayer && (
                                        <>
                                            <div className="ml-auto flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
                                                <p>Player Score:</p>
                                            </div>
                                            <div className="flex gap-2 text-sm pt-4 pb-4">
                                                <b className="max-w-lg text-slate-700">
                                                    {(
                                                        finalScoresDataset.find(
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

                                {/* <Debugg data={scoresByJourney} />
                            <Debugg data={journeyScoresDatasetArr} /> */}

                                <div className=" px-8 pt-8 pb-4">
                                    {project.includes("retail") ||
                                    project.includes("latam") ? (
                                        <BarChart
                                            refDom={finalChartRef}
                                            isPercentage={true}
                                            dataSet={finalScoresDataset}
                                            averageLine={getAverageScore(
                                                finalScoresDataset
                                            )}
                                            plotValues
                                            height={251}
                                            width={1031}
                                            radius={4}
                                            gap={18}
                                            barWidth={16}
                                            separatorWidth={55}
                                            barColors="#a5a5a5, #4285F4, #174EA6, #333"
                                            averageLineColor="#a5a5a5"
                                            averageLineDash="8,7"
                                            averageLineWidth={0}
                                            hOffset={10}
                                            vOffset={0}
                                            id="finalscores-chart"
                                        />
                                    ) : (
                                        <div>Not Retail or Latam</div>
                                    )}

                                    {/* <Debugg data={scoresByJourney} /> */}
                                    <div className="mt-4 flex gap-10">
                                        <button
                                            className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 whitespace-nowrap text-sm"
                                            onClick={() =>
                                                handleClickCopySvg(
                                                    finalChartRef,
                                                    "id4"
                                                )
                                            }
                                        >
                                            {svgCopied?.id4
                                                ? "✅ SVG Copied"
                                                : "Copy as SVG"}
                                        </button>
                                        <button
                                            className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400  whitespace-nowrap text-sm"
                                            onClick={() =>
                                                handleClickCopyPng(
                                                    finalChartRef,
                                                    {
                                                        playerSlug: showPlayer,
                                                    },
                                                    4
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
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
