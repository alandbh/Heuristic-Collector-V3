import React, { useCallback, useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useRouter } from "next/router";
import { useCredentialsContext } from "../../context/credentials";
import { Link as Scroll } from "react-scroll";

import HeuristicGroup from "../HeuristicGroup";
import { useScoresObjContext } from "../../context/scoresObj";
import { useProjectContext } from "../../context/project";
import { useIsSticky, processChange, getUserLevel } from "../../lib/utils";
import { MUTATION_SCORE_OBJ } from "../../lib/mutations";
import Findings from "../Findings";
import client from "../../lib/apollo";
import SearchBox from "../SearchBox";
import Donnut from "../Donnut";
import Ignore from "../Ignore";

const QUERY_FINDINGS = gql`
    query GetAllFindings(
        $projectSlug: String
        $playerSlug: String
        $journeySlug: String
    ) {
        findings(
            where: {
                player: { slug: $playerSlug }
                journey: { slug: $journeySlug }
                project: { slug: $projectSlug }
            }
        ) {
            id
            findingObject
        }
    }
`;

const MUTATION_IGNORE = gql`
    mutation MutateIgnoreJourney($playerId: ID, $journeyId: ID) {
        updatePlayer(
            where: { id: $playerId }
            data: {
                ignored_journeys: { connect: { where: { id: $journeyId } } }
            }
        ) {
            name
            id
        }
    }
`;
const MUTATION_REMOVE_IGNORE = gql`
    mutation MutateRemoveIgnoreJourney($playerId: ID, $journeyId: ID) {
        updatePlayer(
            where: { id: $playerId }
            data: { ignored_journeys: { disconnect: { id: $journeyId } } }
        ) {
            name
            id
        }
    }
`;
const MUTATION_ZERO = gql`
    mutation MutateZeroJourney($playerId: ID, $journeyId: ID) {
        updatePlayer(
            where: { id: $playerId }
            data: {
                zeroed_journeys: { connect: { where: { id: $journeyId } } }
            }
        ) {
            name
            id
        }
    }
`;
const MUTATION_REMOVE_ZERO = gql`
    mutation MutateRemoveZeroJourney($playerId: ID, $journeyId: ID) {
        updatePlayer(
            where: { id: $playerId }
            data: { zeroed_journeys: { disconnect: { id: $journeyId } } }
        ) {
            name
            id
        }
    }
`;

const MUTATION_PUBLISH_PLAYER = gql`
    mutation PublishPlayer($playerId: ID) {
        publishPlayer(where: { id: $playerId }) {
            id
            name
            slug
        }
    }
`;

// let selectedJourney;

function isANotApplicableHeuristic(heuristic, playerSlug) {
    return heuristic.not_applicaple_players
        .map((player) => player.slug)
        .includes(playerSlug);
}

function isPresentInThisJourney(heuristic, journeySlug) {
    if (heuristic.journeys.length === 0) {
        return true;
    } else {
        return heuristic.journeys
            .map((journey) => journey.slug)
            .includes(journeySlug);
    }
}

function publishPlayer(variables, message = "Journey has changed") {
    client
        .mutate({
            mutation: MUTATION_PUBLISH_PLAYER,
            variables,
        })
        .then(({ data }) => {
            alert(message);
        });
}

/**
 *
 *
 *
 * ---------------------------------
 * GroupContainer COMPONENT
 * ---------------------------------
 *
 *
 */

function GroupContainer({ data }) {
    const router = useRouter();
    const [findingsList, setFindingsList] = useState(null);
    const [validJourney, setValidJourney] = useState(true);
    const [journeyIgnored, setJourneyIgnored] = useState(false);
    const [journeyZeroed, setJourneyZeroed] = useState(false);
    const {
        allScoresJson,
        allScoresObj: allScoresObjContext,
        scoresLoading,
    } = useScoresObjContext();
    const { userType } = useCredentialsContext();
    const { currentProject, currentPlayer, currentJourney } =
        useProjectContext();

    const isSticky = useIsSticky(150);
    const isSticky128 = useIsSticky(128);

    const getFindings = useCallback(() => {
        const variables = {
            playerSlug: router.query.player,
            projectSlug: router.query.slug,
            journeySlug: router.query.journey,
        };

        // Not using clientFast in order to not cache results
        client
            .query({
                query: QUERY_FINDINGS,
                variables,
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                setFindingsList(data);
            });
    }, [router]);

    const ignoreJourney = useCallback(
        (ignore) => {
            const mutation = ignore ? MUTATION_IGNORE : MUTATION_REMOVE_IGNORE;

            const variables = {
                playerId: currentPlayer.id,
                journeyId: currentJourney.id,
            };
            client
                .mutate({
                    mutation,
                    variables,
                })
                .then(({ data }) => {
                    publishPlayer({
                        playerId: currentPlayer.id,
                    });
                });
        },
        [currentJourney, currentPlayer]
    );
    const zeroJourney = useCallback(
        (zero) => {
            const mutation = zero ? MUTATION_ZERO : MUTATION_REMOVE_ZERO;

            const variables = {
                playerId: currentPlayer.id,
                journeyId: currentJourney.id,
            };
            client
                .mutate({
                    mutation,
                    variables,
                })
                .then(({ data }) => {
                    publishPlayer({
                        playerId: currentPlayer.id,
                    });
                });
        },
        [currentJourney, currentPlayer]
    );

    useEffect(() => {
        getFindings();
    });

    /**
     *
     * Setting empty scores
     * ------------------------------
     */

    useEffect(() => {
        console.log("singleScore allScoresObjContext", allScoresObjContext);
        console.log("singleScore allScoresJson", allScoresJson);

        // se não tiver scores registrados, cria novos scores zerados.
        if (allScoresObjContext?.length === 0 && allScoresJson !== null) {
            createNewScores();
            console.log("singleScore contect", allScoresObjContext);
        }

        function createNewScores() {
            let allScoresObjJson = JSON.stringify(allScoresJson);
            let allScoresObjJsonClone = JSON.parse(allScoresObjJson);

            console.log("singleScore clone zero", allScoresObjJsonClone);
            // return;

            data.groups.forEach((group) => {
                group.heuristic.forEach((heuristic) => {
                    let singleScore = {};
                    if (
                        isANotApplicableHeuristic(heuristic, currentPlayer.slug)
                    ) {
                        return;
                    }

                    if (
                        !isPresentInThisJourney(heuristic, currentJourney.slug)
                    ) {
                        return;
                    }

                    singleScore.id = `${router.query.player}-${router.query.journey}-h${heuristic.heuristicNumber}`;
                    singleScore.note = "";
                    singleScore.group = { name: group.name };
                    singleScore.heuristic = {
                        heuristicNumber: heuristic.heuristicNumber,
                    };
                    singleScore.scoreValue = 0;
                    singleScore.evidenceUrl = "";

                    // console.log("singleScore", singleScore);

                    allScoresObjJsonClone[router.query.journey]?.push(
                        singleScore
                    );

                    // return;
                });
            });
            console.log(
                "singleScore allScoresObjJsonClone",
                allScoresObjJsonClone
            );
            // console.log("singleScore OBJ", scoresObjModel);

            processChange(
                client,
                {
                    playerId: currentPlayer.id,
                    scoresObj: allScoresObjJsonClone,
                },
                MUTATION_SCORE_OBJ,
                true
            );
        }
    }, [
        data,
        router,
        currentPlayer,
        currentJourney,
        allScoresJson,
        allScoresObjContext,
    ]);

    const [allHeuristics, setAllHeuristics] = useState([]);

    useEffect(() => {
        let heuristicsArr = [];
        data.groups.map((group) => {
            group.heuristic.map((heuristic) => {
                heuristicsArr.push(heuristic);
            });
        });

        // console.log("allHeuristics", heuristicsArr);
        setAllHeuristics(heuristicsArr);
    }, [data.groups]);

    useEffect(() => {
        const isThisJourneyIgnored = currentPlayer?.ignored_journeys.some(
            (journey) => journey.slug === currentJourney.slug
        );
        const isThisJourneyZeroed = currentPlayer?.zeroed_journeys.some(
            (journey) => journey.slug === currentJourney.slug
        );
        console.log("ignore initial", isThisJourneyIgnored);
        setJourneyIgnored(isThisJourneyIgnored);
        setJourneyZeroed(isThisJourneyZeroed);
    }, [currentPlayer, currentJourney]);

    if (!currentJourney) {
        return null;
    }

    if (!validJourney) {
        return (
            <div className="flex p-20 items-center text-center">
                This player does not have this journey. <br />
                Please select another journey or player.
            </div>
        );
    }

    let groupsToMap = [...data.groups];

    groupsToMap.sort(function (a, b) {
        return a.groupNumber - b.groupNumber;
    });

    console.log("groupsToMap", groupsToMap);

    function handleOnChangeIgnore(value) {
        console.log("ignore", "aaaaa", value);

        ignoreJourney(value === "Yes");
        setJourneyIgnored(value === "Yes");
    }
    function handleOnChangeZero(value) {
        console.log("zero", "aaaaa", value);

        zeroJourney(value === "Yes");
        setJourneyZeroed(value === "Yes");
    }

    if (scoresLoading) {
        return <div className="text-center">Loading</div>;
    }

    return (
        <>
            <div className={isSticky128 ? "pt-32" : ""}>
                <div className="gap-5 max-w-5xl mx-auto flex flex-col-reverse md:grid md:grid-cols-3  ">
                    <div
                        className={`md:col-span-2 flex flex-col gap-20 ${
                            journeyIgnored &&
                            "bg-red-100 border-red-300 border-4 border-dashed rounded-lg"
                        }
                    ${
                        journeyZeroed &&
                        "bg-purple-100 border-purple-300 border-4 border-dashed rounded-lg"
                    }`}
                    >
                        {journeyIgnored && (
                            <p className="text-center -mb-10 mt-4 uppercase text-red-600 font-mono">
                                This journey is ignored
                            </p>
                        )}
                        {journeyZeroed && (
                            <p className="text-center -mb-10 mt-4 uppercase text-purple-600 font-mono">
                                This journey is zeroed
                            </p>
                        )}
                        {groupsToMap.map((group) => (
                            <HeuristicGroup
                                allScoresJson={allScoresJson}
                                group={group}
                                key={group.id}
                                allScoresObj={allScoresObjContext}
                            />
                        ))}
                        <Findings
                            data={findingsList}
                            router={router}
                            getFindings={getFindings}
                            currentJourney={currentJourney}
                            currentPlayer={currentPlayer}
                            currentProject={currentProject}
                            disable={getUserLevel(userType) > 2}
                        />
                        {getUserLevel(userType) === 1 && (
                            <Ignore
                                onChange={handleOnChangeIgnore}
                                onChangeZero={handleOnChangeZero}
                                isDisable={getUserLevel(userType) !== 1}
                                ignored={journeyIgnored}
                                zeroed={journeyZeroed}
                            />
                        )}
                    </div>
                    <div className="relative mr-4">
                        <div
                            className={
                                isSticky ? "md:sticky top-20" : "relative"
                            }
                        >
                            <aside className="mb-10 ml-4 md:mx-0">
                                <div>
                                    <SearchBox data={allHeuristics} />
                                </div>
                            </aside>
                            <aside className="hidden md:block">
                                <h1 className="text-slate-400 text-sm uppercase mb-5 border-b-2 pb-3">
                                    Heuristic Groups
                                </h1>
                                <ul>
                                    {groupsToMap.map((group) => (
                                        <li
                                            key={group.id}
                                            className="cursor-pointer"
                                        >
                                            <Scroll
                                                activeClass="underline underline-offset-4 hover:text-blue-700"
                                                className="py-1 block text-primary font-bold hover:text-primary/70"
                                                to={group.id}
                                                spy={true}
                                                smooth={true}
                                                offset={-200}
                                            >
                                                {group.groupNumber}.{" "}
                                                {group.name}
                                            </Scroll>
                                        </li>
                                    ))}

                                    <li className="mt-5">
                                        <hr />
                                    </li>

                                    <li className="cursor-pointer mt-5">
                                        <Scroll
                                            activeClass="underline underline-offset-4 hover:text-blue-700"
                                            className="py-1 block text-primary font-bold hover:text-primary/70"
                                            to="findings_section"
                                            spy={true}
                                            smooth={true}
                                            offset={-50}
                                        >
                                            General Findings
                                        </Scroll>
                                    </li>
                                </ul>

                                <h1 className="text-lg font-bold mt-10 text-center mb-5">
                                    Total Scored by {currentPlayer.name}
                                </h1>

                                <div className="flex justify-center items-center flex-col">
                                    <Donnut
                                        total={
                                            getTotals(allScoresObjContext).total
                                        }
                                        sum={getTotals(allScoresObjContext).sum}
                                        radius={60}
                                    />

                                    <p className="font-bold">
                                        {getTotals(allScoresObjContext).sum} of{" "}
                                        {getTotals(allScoresObjContext).total}
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default React.memo(GroupContainer);

function getTotals(allScores) {
    let total = allScores?.length * 5;
    let sum = 0;
    allScores?.map((score) => {
        sum += score.scoreValue;
    });

    return {
        total,
        sum,
    };
}
