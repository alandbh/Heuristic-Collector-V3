import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef } from "react";
import { gql } from "@apollo/client";
import client from "../../lib/apollo";
import Fuse from "fuse.js";
import Debugg from "../../lib/Debugg";

const QUERY_HEURISTICS = gql`
    query GetAllHeuristics($projectSlug: String) {
        heuristics(last: 10000, where: { project: { slug: $projectSlug } }) {
            name
            heuristicNumber
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
        }
    }
`;

function Chart({ allScores }) {
    if (!allScores || !allScores.scores_by_heuristic) {
        return null;
    }
    function getHeight(score) {
        return (340 / 5) * score;
    }
    function getAveragePosition(score) {
        let amount = score !== 0 ? 1 : -2;

        return 340 - (340 / 5) * score + amount;
    }

    function getColor(showPlayer) {
        return showPlayer ? "#5383EB" : "#D9D9D9";
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="901"
            height="340"
            fill="none"
            viewBox="0 0 901 339"
        >
            {allScores.scores_by_heuristic.map((score, index) => {
                return (
                    <rect
                        key={score.label}
                        x={index * 21 + index * 23}
                        y={340 - getHeight(score.value)}
                        height={getHeight(score.value)}
                        width="21"
                        fill={getColor(score.show_player)}
                    />
                );
            })}

            <rect
                x="0"
                y={getAveragePosition(allScores.average_score)}
                width="901"
                height="2"
                fill="#ff0000"
            />
        </svg>
    );
}

function Dashboard() {
    const router = useRouter();
    const { project, heuristic, showPlayer, journey } = router.query;
    const [allScores, setAllScores] = useState(null);
    const [allHeuristics, setAllHeuristics] = useState(null);
    const [allJourneys, setAllJourneys] = useState(null);
    const [allPlayers, setAllPlayers] = useState(null);
    const [currentJourney, setCurrentJourney] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [heuristicsByJourney, setHeuristicsByJourney] = useState(null);
    const [selectedHeuristic, setSelectedHeuristic] = useState(null);
    const [result, setResult] = useState([]);
    const inputRef = useRef(null);

    function fetchAllScores(project, journey, heuristic, showPlayer) {
        fetch(
            `/api/all?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}`
        ).then((data) => {
            data.json().then((result) => {
                // setApiResult(result);

                // setTotalOfScores(getAllScoresApi(result).length);
                setAllScores(result);
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
            console.log({ variables });
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

    useEffect(() => {
        fetchAllScores(project, journey, heuristic, showPlayer);
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
        if (router.query.journey !== undefined) {
            setCurrentJourney(router.query.journey);
        }
        if (router.query.showPlayer !== undefined) {
            setCurrentPlayer(router.query.showPlayer);
        }
        if (
            router.query.heuristic !== undefined &&
            router.query.heuristic !== "" &&
            allHeuristics !== null
        ) {
            const currentHeuristicByUrl = allHeuristics.filter((heuristic) => {
                return heuristic.heuristicNumber === router.query.heuristic;
            });
            console.log({ allHeuristics });
            setSelectedHeuristic(currentHeuristicByUrl[0]);
        }
    }, [
        router.query.journey,
        allHeuristics,
        router.query.heuristic,
        router.query.showPlayer,
    ]);
    // useEffect(() => {
    //     if (allScores !== null) {
    //         console.log("allScores", allScores);
    //     }
    // }, [allScores]);

    useEffect(() => {
        console.log({ allHeuristics });
    }, [allHeuristics]);

    useEffect(() => {
        const heuristicsByJourney = allHeuristics?.filter((heuristic) => {
            // Filtering the heuristics by the current journey and if journey is empty.
            return (
                heuristic.journeys.filter(
                    (journey) => journey.slug === currentJourney
                ).length > 0
            );
        });

        if (inputRef.current !== null) {
            inputRef.current.value = "";
            setResult([]);
        }

        setHeuristicsByJourney(heuristicsByJourney);
    }, [currentJourney, allHeuristics]);

    if (
        allScores === null ||
        allHeuristics === null ||
        allJourneys === null ||
        allPlayers === null ||
        heuristicsByJourney === null
    ) {
        return null;
    }

    function handleSelectJourney(ev) {
        console.log("Journey", ev.target.value);

        setCurrentJourney(ev.target.value);
        router.replace({
            query: {
                ...router.query,
                journey: ev.target.value,
                heuristic: null,
            },
        });
        setResult([]);
        setSelectedHeuristic(null);
    }
    function handleSelectPlayer(ev) {
        console.log("Player", ev.target.value);

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
        console.log("heuristicsByJourney", fuse.search(ev.target.value));

        setResult(fuse.search(ev.target.value));
    }

    function handleClickHeuristic(heuristicNumber, name) {
        console.log({ heuristicNumber, name });
        // console.log(
        //     allHeuristics.filter(
        //         (heuristic) => heuristic["heuristicNumber"] === heuristicNumber
        //     )[0]
        // );
        setSelectedHeuristic({ heuristicNumber, name });
        setResult([]);

        router.replace({
            query: {
                ...router.query,
                heuristic: heuristicNumber,
            },
        });
    }

    return (
        <div className="m-10">
            <div className="flex w-[800px] gap-10 mb-10">
                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-slate-500 font-bold">
                        Select a journey
                    </label>
                    <select
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(ev) => handleSelectJourney(ev)}
                        defaultValue={router.query.journey}
                    >
                        <option>...</option>
                        {allJourneys.map((journey) => {
                            return (
                                <option key={journey.slug} value={journey.slug}>
                                    {journey.name}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-slate-500 font-bold">
                        Find the heuristic
                    </label>
                    <input
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(e) => handleSearch(e)}
                        type="search"
                        name="search"
                        id="search"
                        autoComplete="off"
                        ref={inputRef}
                        accessKey="s"
                        placeholder={"Type something and select"}
                        tabIndex={1}
                    />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-slate-500 font-bold">
                        Select a player to highlight it
                    </label>

                    <select
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(ev) => handleSelectPlayer(ev)}
                        defaultValue={router.query.showPlayer}
                    >
                        <option>...</option>
                        {allPlayers?.map((player) => {
                            return (
                                <option key={player.slug} value={player.slug}>
                                    {player.name}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
            <div className="flex items-end content-end w-[600px] relative">
                {result.length > 0 ? (
                    <ul className="absolute top-[-20px] p-4 bg-white shadow-xl w-full">
                        {result.map((item, index) => {
                            return (
                                <li className="w-full" key={index}>
                                    <button
                                        onClick={() =>
                                            handleClickHeuristic(
                                                item.item.heuristicNumber,
                                                item.item.name
                                            )
                                        }
                                        className="flex gap-2 border-b-2 text-left h-16 bg-white"
                                        tabIndex={2}
                                    >
                                        <b>{item.item.heuristicNumber}</b>
                                        <span className="text-slate-500">
                                            {item.item.name.substring(0, 130) +
                                                "..."}
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
            {/* {<Debugg data={currentJourney} />} */}
            {/* {<Debugg data={heuristicsByJourney} />} */}
            {/* {<Debugg data={allScores} />} */}
            {selectedHeuristic !== null ? (
                <div>
                    <div className="mb-10">
                        <h1 className="font-bold text-xl my-4">
                            Selected Heuristic
                        </h1>
                        <div className="flex gap-2 text-left">
                            <b>{selectedHeuristic?.heuristicNumber}</b>
                            <p className="w-[600px] text-slate-500">
                                {selectedHeuristic?.name}
                            </p>
                        </div>
                        <div className="flex gap-2 text-left mt-5">
                            <b>Average:</b>
                            <p className="w-[600px] text-slate-500">
                                {allScores.average_score}
                            </p>
                        </div>
                    </div>
                    <Chart allScores={allScores} />
                </div>
            ) : currentJourney ? (
                <p>Please, find and select the heuristic</p>
            ) : (
                <p>Please, select a Journey</p>
            )}
        </div>
    );
}

export default Dashboard;