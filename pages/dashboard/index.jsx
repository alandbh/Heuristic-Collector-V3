import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
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

function Chart({ allScores }) {
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
    const [currentJourney, setCurrentJourney] = useState(null);
    const [heuristicsByJourney, setHeuristicsByJourney] = useState(null);
    const [result, setResult] = useState([]);

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
                setCurrentJourney(data.journeys[0].slug);
            });
    }, []);

    useEffect(() => {
        fetchAllScores(project, journey, heuristic, showPlayer);
        getHeuristics();
        getJourneys();
    }, [project, heuristic, showPlayer, journey, getHeuristics, getJourneys]);

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

        setHeuristicsByJourney(heuristicsByJourney);
    }, [currentJourney]);

    if (
        allScores === null ||
        allHeuristics === null ||
        allJourneys === null ||
        heuristicsByJourney === null
    ) {
        return null;
    }

    function handleSelectJourney(ev) {
        console.log("Journey", ev.target.value);
        setCurrentJourney(ev.target.value);
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

    return (
        <div className="m-10">
            <div className="flex max-w-md gap-10 mb-10">
                <div className="flex flex-col gap-1">
                    <label className="text-slate-400">Select a journey</label>
                    <select
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(ev) => handleSelectJourney(ev)}
                    >
                        {allJourneys.map((journey) => {
                            return (
                                <option key={journey.slug} value={journey.slug}>
                                    {journey.name}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-slate-400">Select a heuristic</label>
                    <input
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(e) => handleSearch(e)}
                        type="search"
                        name="search"
                        id="search"
                        autoComplete="off"
                        // ref={inputRef}
                        accessKey="s"
                        // placeholder={shortCut}
                    />

                    <ul>
                        {result.map((item, index) => {
                            return (
                                <li
                                    key={index}
                                    className="flex gap-1 border-b-2"
                                >
                                    <b>{item.item.heuristicNumber}</b>
                                    <span className="text-slate-500">
                                        {item.item.name}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
            {/* {<Debugg data={heuristicsByJourney} />} */}
            <Chart allScores={allScores} />
        </div>
    );
}

export default Dashboard;
