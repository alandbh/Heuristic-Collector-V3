import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
// import client from "../../lib/apollo";

// import Debugg from "../../lib/Debugg";
import Donnut from "../Donnut";
import Progress from "../Progress";
import { SwitchMono } from "../Switch";
import {
    getAllScoresApi,
    getAllFindingsApi,
    useIsSticky,
    timestampToDateString,
    dateStringToUTCDate,
} from "../../lib/utils";
import Link from "next/link";
import Debugg from "../../lib/Debugg";
import useCollect from "../../lib/useCollect";
import ProgressChart from "../ProgressChart";
import ProgressChartDaily from "../ProgressChartDaily";
import BurnDownChart from "../BurnDownChart";

const QUERY_ALL_JOURNEYS = gql`
    query getAllJourneys($projectSlug: String) {
        journeys(where: { project: { slug: $projectSlug } }, first: 10000) {
            name
            slug
        }
    }
`;

function getUncompletedScores(params) {
    const { scores, journey, player } = params;
    let uncompleted;
    if (scores && journey && player) {
        uncompleted = scores?.filter(
            (score) =>
                (
                    score.scoreValue === 0 ||
                    score.evidenceUrl.trim().length === 0 ||
                    score.note.trim().length === 0 ||
                    score.selectedFiles.length === 0
                ) &&
                score.playerSlug === player &&
                score.journeySlug === journey
        );
    } else if (scores && journey) {
        uncompleted = scores?.filter(
            (score) =>
                (score.scoreValue === 0 ||
                    score.evidenceUrl.trim().length === 0 ||
                    score.note.trim().length === 0 ||
                    score.selectedFiles.length === 0
                ) &&
                score.journeySlug === journey
        );
    } else if (scores && player) {
        uncompleted = scores?.filter(
            (score) =>
                (score.scoreValue === 0 ||
                    score.evidenceUrl.trim().length === 0 ||
                    score.note.trim().length === 0 ||
                    score.selectedFiles.length === 0
                ) &&
                score.playerSlug === player
        );
    } else {
        uncompleted = scores?.filter(
            (score) =>
                score.scoreValue === 0 ||
                score.evidenceUrl.trim().length === 0 ||
                score.note.trim().length === 0 ||
                score.selectedFiles.length === 0
        );
    }

    return uncompleted;
}

function getZeroedScores(params) {
    const { scores, journey, player } = params;
    let zeroed;
    if (scores && journey && player) {
        zeroed = scores?.filter(
            (score) =>
                score.scoreValue === 0 &&
                score.playerSlug === player &&
                score.journeySlug === journey
        );
    } else if (scores && journey) {
        zeroed = scores?.filter(
            (score) => score.scoreValue === 0 && score.journeySlug === journey
        );
    } else if (scores && player) {
        zeroed = scores?.filter(
            (score) => score.scoreValue === 0 && score.playerSlug === player
        );
    } else {
        zeroed = scores?.filter((score) => score.scoreValue === 0);
    }

    return zeroed;
}

function getAllScores(params) {
    const { scores, journey, player } = params;

    // const scoresByJourneyAndPlayer = scores?.filter(
    //     (score) =>
    //         score.playerSlug === player && score.journeySlug === journey
    // );

    let allScores;
    if (scores && journey && player) {
        allScores = scores?.filter(
            (score) =>
                score.playerName === player && score.journeySlug === journey
        );
    } else if (scores && journey) {
        allScores = scores?.filter((score) => score.journeySlug === journey);
    } else if (scores && player) {
        allScores = scores?.filter((score) => score.playerSlug === player);
    } else {
        allScores = scores;
    }

    return allScores;
}

function getAllPlayers(scores, journey) {
    const scoresByJourney = getAllScores({
        scores,
        journey,
    });
    const playersArr = scoresByJourney.map((score) => score.playerSlug);

    return getUnique(playersArr);
}
function getAllPlayersObj(params) {
    const { scores, journey, player } = params;
    const scoresByJourney = getAllScores({
        scores,
        journey,
    });
    const playersArr = scoresByJourney.map((score) => {
        return { playerName: score.playerName, playerSlug: score.playerSlug };
    });

    // return all unique players without any duplicates

    const allPlayersUnsorted = [
        ...new Map(
            playersArr.map((player) => [player.playerSlug, player])
        ).values(),
    ];

    // sort players by Sluf
    // sorting by name causes inconsistent results with special caracters like Pão de Açúcar
    const sortedPlayers = [...allPlayersUnsorted].sort((a, b) => {
        const nameA = a.playerSlug.toUpperCase(); // ignore upper and lowercase
        const nameB = b.playerSlug.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        // names must be equal
        return 0;
    });

    return sortedPlayers;

    // return [...new Set(playersArr)];

    // return getUnique(playersArr, "playerSlug");
}

function getCompletedPlayersSucessfully(params) {
    const { scores, journey, player, findings } = params;
    const completed = getCompletedPlayers(params);
    const blocked = getBlockedPlayers({
        findings,
        journey,
    });
    const successfullyFinished = completed.filter(
        ({ playerSlug: playerSlug_1 }) =>
            !blocked.some(
                ({ playerSlug: playerSlug_2 }) => playerSlug_2 === playerSlug_1
            )
    );

    return successfullyFinished;
}
function getCompletedPlayers(params) {
    const { scores, journey, player } = params;
    const zeroed = getZeroedScores({ scores, journey });
    const allPlayers = getAllPlayers(scores, journey);
    let completed = [];

    allPlayers.map((player) => {
        const zeroedScore = zeroed.filter(
            (score) => score.playerSlug === player
        );
        if (zeroedScore.length === 0) {
            completed.push(player);
            return player;
        }
        return;
    });

    return completed;
}

function getPlayerPercentage(params) {
    const { scores, journey, playerSlug } = params;

    const scoresByPlayer = scores.filter(
        (player) => player.playerSlug === playerSlug
    );
    const scoresByPlayerByJourney = journey
        ? scoresByPlayer.filter((score) => score.journeySlug === journey)
        : scoresByPlayer;

    const totalAmountOfScores = scoresByPlayerByJourney.length;

    const totalDone = scoresByPlayerByJourney.filter((score) => {
        return (
            (score.evidenceUrl.trim().length > 0 || score.selectedFiles.length > 0) &&
            score.note.trim().length > 0 &&
            score.scoreValue > 0
        );
    }).length;

    const division = isNaN(totalDone / totalAmountOfScores)
        ? 0
        : totalDone / totalAmountOfScores;
    const percentage = division * 100;
    // const scoresByPlayer = scores.find(
    //     (player) => player.playerSlug === playerSlug
    // );

    // console.log("scoresByPlayer percentage", {
    //     scoresByPlayerByJourney,
    //     total: totalAmountOfScores,
    //     done: totalDone,
    //     percentage,
    // });

    return {
        total: totalAmountOfScores,
        done: totalDone,
        percentage,
    };
}

/**
 * @typedef {Object} ParamObj
 * @property {array} scores - scores array
 * @property {string} journey - Indicates whether user has close the toast.
 */
/**
 * Function to get uncompleted Players
 * @param {ParamObj}} - {@link params} object
 * @returns [playerSlug]
 */
function getUncompletedPlayers(params) {
    const { scores, journey } = params;
    const zeroed = getZeroedScores({ scores, journey });
    let uncompleted = zeroed.map((score) => score.playerSlug);

    return getUnique(uncompleted);
}

function getBlockedPlayers(params) {
    const { findings, journey } = params;

    const allBlockers = findings.filter((finding) =>
        finding.findings.some((findingObj) => findingObj.theType === "blocker")
    );

    const playersWithBlockers = allBlockers.map((blocker) => {
        return {
            playerSlug: blocker.playerSlug,
            playerName: blocker.playerName,
        };
    });

    // return all unique players without any duplicates

    return [
        ...new Map(
            playersWithBlockers.map((player) => [player.playerSlug, player])
        ).values(),
    ];

    // return playersWithBlockers;
}

function hasBlocker(params) {
    const { findings, journey, player } = params;

    const blocked = getBlockedPlayers({ findings, journey });
    return blocked.some((bplayer) => bplayer.playerSlug === player.playerSlug);
}

function getUnique(arr, key = null, subkey = null) {
    if (key && subkey) {
        let unique = [];
        arr.forEach((obj) => {
            if (!unique.includes(obj[key][subkey])) {
                unique.push(obj[key][subkey]);
            }
        });
    } else if (key && !subkey) {
        let uniqueKey = [];
        let uniqueObj = [];
        arr.forEach((obj) => {
            if (!uniqueKey.includes(obj[key])) {
                uniqueKey.push(obj[key]);
                uniqueObj.push(obj);
            }
        });

        return uniqueObj;
    }

    return [...new Set(arr)];
}

/**
 *
 * ------------------------------------
 *
 * COMPONENT
 * -------------------------------------
 */

let _pagination;

function Dashboard({ auth, projectData }) {
    const [journey, setJourney] = useState();
    const [allScores, setAllScores] = useState([]);
    const [allFindings, setAllFindings] = useState([]);
    const [loadingDash, setLoadingDash] = useState(true);
    const router = useRouter();
    const isSticky = useIsSticky(128);

    /**
     *
     *
     * ------------------------------------
     * Getting the current collect data
     * ------------------------------------
     *
     *
     */
    const {
        allCollects,
        collectsByDate,
        people,
        collectsByPerson,
        amountByPerson,
        maxDateAmount,
        maxAmountForAPerson,
        totalHeuristics,
        dateArray,
        newestDate,
        yesterDay,
        burnDownDays,
        estimatedDaysToFinish,
    } = useCollect(router.query.slug, allScores.length, projectData);

    const todayString = timestampToDateString(Date.now());

    function getCollectsByDate(date = newestDate, person = people[0].name) {
        if (!collectsByDate || !collectsByDate[date]) {
            return null;
        }
        return {
            personsDayCollection: collectsByDate[date].filter(
                (collect) => collect.user.name === person
            ),
            peoplesDayCollection: collectsByDate[date],
        };
    }
    console.log("collect", maxDateAmount);
    // console.log("collect", getCollectsByDate(newestDate, "Marco Gross"));

    let newestTitle = "";
    let dayBeforeTitle = "";

    newestTitle =
        newestDate === todayString
            ? "Today's Collections:"
            : "Latest Collection:";

    dayBeforeTitle =
        newestDate === todayString
            ? "Yesterday's Collections:"
            : "Previous day's Collections:";

    const {
        data: allJourneysData,
        loading: allJourneysLoading,
        error: allJourneysError,
    } = useQuery(QUERY_ALL_JOURNEYS, {
        variables: {
            projectSlug: router.query.slug,
        },
    });

    useEffect(() => {
        setLoadingDash(true);

        fetch(`/api/all?project=${router.query.slug}`).then((data) => {
            data.json().then((result) => {
                // setApiResult(result);
                // console.log("allscoresapi", getAllScoresApi(result));
                // setTotalOfScores(getAllScoresApi(result).length);
                setAllScores(getAllScoresApi(result));
                setAllFindings(getAllFindingsApi(result));
                // console.log("allScores", result);
                setLoadingDash(false);
            });
        });
        // console.log("allFindings", allFindings);
    }, [router.query.slug]);

    // useEffect(() => {
    //     console.log("comecou");
    //     const timeout = setTimeout(() => {
    //         setLoadingDash(false);
    //     }, _pagination * 200);

    //     return () => {
    //         clearTimeout(timeout);
    //     };
    // });

    function onChangeJourney(journey) {
        let selectedJourney = journey !== "overall" ? journey : "";

        if (journey === "overall") {
            setJourney("");
            return;
        }
        setJourney(
            allJourneysData?.journeys.find(
                (journey) => journey.name === selectedJourney
            ).slug
        );
    }

    const allJourneysSlug = allJourneysData?.journeys.map(
        (journey) => journey.slug
    );
    const allJourneysName = allJourneysData?.journeys.map(
        (journey) => journey.name
    );

    // console.log("allJourneysSlug", allJourneysData);

    if (!allScores || allJourneysLoading || allJourneysError) {
        return null;
    }

    // console.log("ola", allScores);

    return (
        <>
            {/* <h1 className={`${loadingDash ? "opacity-100" : "opacity-0"}`}>
                LOADING...
            </h1> */}
            <div
                style={{ transition: ".5s", transitionDelay: ".5s" }}
                className={`${
                    loadingDash
                        ? "opacity-0 translate-y-6"
                        : "opacity-100 translate-y-0"
                }  gap-5 max-w-6xl w-full md:min-w-full mx-auto md:grid md:grid-cols-4`}
            >
                <div
                    className={`${
                        isSticky ? "pt-32" : ""
                    } md:col-span-4 flex flex-col gap-20`}
                >
                    <section className="mx-3 h-screen mb-96">
                        <header className="flex justify-between mb-6 items-center px-4 gap-3">
                            <h1 className="text-xl font-bold">
                                <div className="h-[5px] bg-primary w-10 mb-1"></div>
                                Analysis progress
                            </h1>
                            <div className="text-lg flex items-center gap-5">
                                <b className="whitespace-nowrap text-sm md:text-xl">
                                    {allScores.length -
                                        getUncompletedScores({
                                            scores: allScores,
                                        }).length}{" "}
                                    of {allScores.length}
                                </b>

                                <Donnut
                                    total={allScores.length}
                                    sum={
                                        allScores.length -
                                        getUncompletedScores({
                                            scores: allScores,
                                        }).length
                                    }
                                    radius={25}
                                    thick={3}
                                ></Donnut>
                            </div>
                        </header>
                        <ul className="bg-white dark:bg-slate-800 pt-8 pb-1 lg:px-4 lg:pr-8 rounded-lg shadow-lg">
                            <li className=" mx-auto">
                                <div>
                                    <SwitchMono
                                        options={[
                                            "overall",
                                            ...allJourneysName,
                                        ]}
                                        onChange={(journey) =>
                                            onChangeJourney(journey)
                                        }
                                        selected={"overall"}
                                    />
                                </div>

                                {/* 
                                    Big Numbers
                                    ------------------
                                */}

                                <div className="flex gap-10 flex-col items-center justify-center mt-20">
                                    <div className="flex flex-wrap gap-4 justify-between md:gap-10 text-center w-auto">
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px]">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getCompletedPlayers({
                                                        scores: allScores,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div className="text-xs md:text-md">
                                                Players Done
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px] text-green-600">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getCompletedPlayersSucessfully(
                                                        {
                                                            scores: allScores,
                                                            journey,
                                                            findings:
                                                                allFindings,
                                                        }
                                                    ).length
                                                }
                                            </div>
                                            <div className="text-xs md:text-md">
                                                Players Successfully <br />
                                                Completed
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px] text-red-500">
                                            <div className="text-4xl font-bold">
                                                {
                                                    getBlockedPlayers({
                                                        findings: allFindings,
                                                        journey,
                                                    }).length
                                                }
                                            </div>
                                            <div className="text-xs md:text-md">
                                                Players With Blockers
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 max-w-[80px] md:max-w-[200px] text-blue-600">
                                            <div className="text-4xl font-bold">
                                                {getUncompletedPlayers({
                                                    scores: allScores,
                                                    journey,
                                                }).length -
                                                    getBlockedPlayers({
                                                        findings: allFindings,
                                                        journey,
                                                    }).length}
                                            </div>
                                            <div className="text-xs md:text-md">
                                                Players In Progress
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-10">
                                        <div className="flex flex-col gap-5 text-center items-center">
                                            <Donnut
                                                total={
                                                    getAllScores({
                                                        scores: allScores,
                                                        journey: journey,
                                                    }).length
                                                }
                                                sum={
                                                    getAllScores({
                                                        scores: allScores,
                                                        journey: journey,
                                                    }).length -
                                                    getZeroedScores({
                                                        scores: allScores,
                                                        journey,
                                                    }).length
                                                }
                                                radius={58}
                                                thick={6}
                                            ></Donnut>

                                            <h3 className="font-bold text-xl">
                                                Collected heuristics
                                            </h3>
                                        </div>

                                        <div className="flex flex-col gap-5 text-center items-center">
                                            <Donnut
                                                total={
                                                    getAllPlayers(
                                                        allScores,
                                                        journey
                                                    ).length
                                                }
                                                sum={
                                                    getBlockedPlayers({
                                                        findings: allFindings,
                                                        journey,
                                                    }).length
                                                }
                                                radius={58}
                                                thick={6}
                                                color={{
                                                    base: "#ddd",
                                                    primary: "red",
                                                }}
                                            ></Donnut>
                                            <h3 className="font-bold text-xl">
                                                Blocked players
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                {/* 
                                
                                    Progress By Player 
                                    ----------------------------

                                 */}

                                <div className="grid grid-cols-3 mt-10 mb-10">
                                    <div className="col-span-3">
                                        <h3 className="font-bold text-2xl text-center mt-20">
                                            Progress by Player
                                        </h3>

                                        <ul className="mt-10 mb-10 md:grid md:grid-cols-4 md:max-w-4xl mx-auto gap-4 flex-wrap">
                                            {getAllPlayersObj({
                                                scores: allScores,
                                                journey,
                                            }).map((player) => {
                                                let playerColor;
                                                let playerHasBlocker = false;

                                                if (
                                                    hasBlocker({
                                                        findings: allFindings,
                                                        journey,
                                                        player,
                                                    })
                                                ) {
                                                    playerColor = "#ff0000";
                                                    playerHasBlocker = true;
                                                } else if (
                                                    getPlayerPercentage({
                                                        scores: allScores,
                                                        journey,
                                                        playerSlug:
                                                            player.playerSlug,
                                                    }).percentage === 100
                                                ) {
                                                    playerColor = "#1cab1c";
                                                } else {
                                                    playerColor = "dodgerblue";
                                                }

                                                return (
                                                    <Link
                                                        href={`/project/${
                                                            router.query.slug
                                                        }?player=${
                                                            player.playerSlug
                                                        }&journey=${
                                                            journey ||
                                                            allJourneysSlug[0]
                                                        }`}
                                                        key={player.playerSlug}
                                                    >
                                                        <a>
                                                            <li
                                                                className={`col-span-1 flex gap-1 items-center  py-3 px-2 border rounded-md ${
                                                                    playerHasBlocker
                                                                        ? "border-red-500 bg-red-100/30 hover:border-red-700 hover:bg-red-100/50"
                                                                        : "border-slate-300 hover:border-blue-300  hover:bg-blue-100/30"
                                                                }  `}
                                                            >
                                                                <div className="flex-1 mr-2">
                                                                    <Progress
                                                                        amount={
                                                                            getPlayerPercentage(
                                                                                {
                                                                                    scores: allScores,
                                                                                    journey,
                                                                                    playerSlug:
                                                                                        player.playerSlug,
                                                                                }
                                                                            )
                                                                                .done
                                                                        }
                                                                        total={
                                                                            getPlayerPercentage(
                                                                                {
                                                                                    scores: allScores,
                                                                                    journey,
                                                                                    playerSlug:
                                                                                        player.playerSlug,
                                                                                }
                                                                            )
                                                                                .total
                                                                        }
                                                                        legend={
                                                                            player.playerName
                                                                        }
                                                                        size="small"
                                                                        barColor={
                                                                            playerColor
                                                                        }
                                                                    />
                                                                </div>
                                                            </li>
                                                        </a>
                                                    </Link>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    {/* <div className="col-span-2">
                                        <h3>Player progress</h3>
                                    </div> */}
                                </div>
                            </li>
                        </ul>

                        {/*
                        *
                        *
                        * 
                        *  
                                
                        ----------------------------------------------------------------
                        Progress By Person 
                        ----------------------------
                        *
                        *
                        * 
                        * 
                        * 

                        */}

                        {collectsByDate && (
                            <div className="bg-white dark:bg-slate-800 pb-1 px-3 md:px-5 lg:px-8 rounded-lg shadow-lg">
                                <div className="grid grid-cols-3 mb-40">
                                    <div className="col-span-3">
                                        <h3 className="font-bold text-2xl text-center mb-10">
                                            Progress by Person{" "}
                                            <small className="text-xs text-slate-500">
                                                beta
                                            </small>
                                        </h3>
                                        {/* 
                                            *
                                            *
                                            * 
                                            ------------------------------------------------
                                            Today's Collections 
                                            ------------------------------------------------
                                            *
                                            *
                                            * 
    
                                        */}
                                        <div>
                                            <h4 className="font-bold text-lg mb-0">
                                                {newestTitle}{" "}
                                                {collectsByDate[newestDate]
                                                    ? collectsByDate[newestDate]
                                                          .length
                                                    : 0}
                                            </h4>
                                            <div className="mb-8 text-slate-500">
                                                <small>
                                                    At:{" "}
                                                    {dateStringToUTCDate(
                                                        newestDate
                                                    )}
                                                </small>
                                            </div>

                                            <ProgressChart
                                                people={people}
                                                currentDate={newestDate}
                                                getCollectsByDate={
                                                    getCollectsByDate
                                                }
                                                barColorClass="bg-blue-300"
                                            />

                                            {/* 
                                            *
                                            *
                                            * 
                                            ------------------------------------------------
                                            Yesterday's Collections 
                                            ------------------------------------------------
                                            *
                                            *
                                            * 
    
                                        */}

                                            <h4 className="font-bold text-lg mb-0 mt-10">
                                                {dayBeforeTitle}{" "}
                                                {collectsByDate[yesterDay]
                                                    ? collectsByDate[yesterDay]
                                                          .length
                                                    : 0}
                                            </h4>
                                            <div className="mb-8 text-slate-500">
                                                <small>
                                                    At:{" "}
                                                    {dateStringToUTCDate(
                                                        yesterDay
                                                    )}
                                                </small>
                                            </div>
                                            <ProgressChart
                                                people={people}
                                                currentDate={yesterDay}
                                                getCollectsByDate={
                                                    getCollectsByDate
                                                }
                                                barColorClass="bg-green-300"
                                            />

                                            {/* 
                                            *
                                            *
                                            * 
                                            ------------------------------------------------
                                            Collections so far
                                            ------------------------------------------------
                                            *
                                            *
                                            * 
    
                                        */}

                                            <h4 className="font-bold text-lg mb-5 mt-8">
                                                Collections So Far:{" "}
                                                {allCollects?.length}
                                            </h4>
                                            <ProgressChart
                                                people={people}
                                                amountByPerson={amountByPerson}
                                                allCollects={allCollects}
                                            />

                                            <h4 className="font-bold text-lg mb-5 mt-8">
                                                Collections History:{" "}
                                            </h4>
                                            <div className="flex flex-col w-full gap-3">
                                                {/* 
                                                ----------------------------------------------------------------
                                                Person's series
                                                ----------------------------------------------------------------
                                                */}
                                                {Object.keys(
                                                    collectsByPerson
                                                ).map((personName) => (
                                                    <div
                                                        key={personName}
                                                        className="flex gap-2  w-full border pr-4 relative"
                                                    >
                                                        <div className="w-28 text-xs p-3 border-r">
                                                            {personName.split(
                                                                " "
                                                            )[0] +
                                                                " " +
                                                                personName.split(
                                                                    " "
                                                                )[1][0]}
                                                            .
                                                        </div>
                                                        <div className="overflow-x-auto flex pr-3">
                                                            <div className="h-40 w-auto flex pt-10">
                                                                {/* 
                                                                ----------------------
                                                                Serie 
                                                                ----------------------
                                                                */}
                                                                {Object.keys(
                                                                    collectsByPerson[
                                                                        personName
                                                                    ]
                                                                ).map(
                                                                    (
                                                                        date,
                                                                        index
                                                                    ) =>
                                                                        index <
                                                                            30 && (
                                                                            <ProgressChartDaily
                                                                                collectsByPerson={
                                                                                    collectsByPerson
                                                                                }
                                                                                personName={
                                                                                    personName
                                                                                }
                                                                                date={
                                                                                    date
                                                                                }
                                                                                key={
                                                                                    date
                                                                                }
                                                                                maxAmount={
                                                                                    maxAmountForAPerson
                                                                                }
                                                                            />
                                                                        )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* 
                                            *
                                            *
                                            * 
                                            ------------------------------------------------
                                            Collections so far
                                            ------------------------------------------------
                                            *
                                            *
                                            * 
    
                                        */}

                                            <h4 className="font-bold text-lg mb-5 mt-8">
                                                Collections Burndown:{" "}
                                            </h4>
                                            <BurnDownChart
                                                maxAmount={totalHeuristics}
                                                series={
                                                    burnDownDays.pastAndRemainingDays
                                                }
                                                estimatedDaysToFinish={
                                                    estimatedDaysToFinish
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
            {/*             
            <h1>Percentage Done</h1>
            <Debugg
                data={getPlayerPercentage({
                    scores: allScores,
                    journey,
                    playerSlug: "extra",
                })}
            />
            <h1>Has blockers</h1>
            <Debugg
                data={hasBlocker({
                    findings: allFindings,
                    journey,
                    player: {
                        playerName: "Carrefour",
                        playerSlug: "magalu",
                    },
                })}
            />
            <h1>All players</h1>
            <Debugg
                data={getAllPlayersObj({
                    scores: allScores,
                    journey,
                })}
            />
            <h1>Scores by journey</h1>
            <Debugg
                data={
                    getAllScores({
                        scores: allScores,
                        journey: journey,
                    }).length
                }
            />
            <h1>Blocked</h1>
            <Debugg
                data={getBlockedPlayers({
                    findings: allFindings,
                    journey,
                })}
            />
            <h1>Completed</h1>
            <Debugg
                data={getCompletedPlayers({
                    scores: allScores,
                    journey,
                })}
            />
            <h1>Successfully Completed</h1>
            <Debugg
                data={getCompletedPlayersSucessfully({
                    scores: allScores,
                    journey,
                    findings: allFindings,
                })}
            />
            <Debugg data={allScores}></Debugg> */}
        </>
    );
}

export default Dashboard;
