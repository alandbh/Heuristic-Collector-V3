import React, { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useRouter } from "next/router";
import { useCredentialsContext } from "../../context/credentials";
import { Link as Scroll } from "react-scroll";

import HeuristicGroup from "../HeuristicGroup";
import { useScoresContext } from "../../context/scores";
import { useScoresObjContext } from "../../context/scoresObj";
import { useProjectContext } from "../../context/project";
import { useScroll, processChange } from "../../lib/utils";
import { MUTATION_SCORE_OBJ } from "../../lib/mutations";
import Findings from "../Findings";
import client from "../../lib/apollo";
import clientFast from "../../lib/apollo-fast";
import SearchBox from "../SearchBox";
import Debugg from "../../lib/Debugg";
import Donnut from "../Donnut";

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
    const { allScoresJson, allScoresObj: allScoresObjContext } =
        useScoresObjContext();
    const { userType } = useCredentialsContext();

    function getFindings() {
        clientFast
            .query({
                query: QUERY_FINDINGS,
                variables: {
                    playerSlug: router.query.player,
                    projectSlug: router.query.slug,
                    journeySlug: router.query.journey,
                },
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                setFindingsList(data);
            });
    }
    useEffect(() => {
        getFindings();
    });

    /**
     *
     * Setting empty scores
     * ------------------------------
     */

    const { currentProject, currentPlayer, currentJourney } =
        useProjectContext();

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

    const [scrollY] = useScroll(0);

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

    return (
        <>
            <div className="gap-5 max-w-5xl mx-auto flex flex-col-reverse md:grid md:grid-cols-3 ">
                <div className="md:col-span-2 flex flex-col gap-20">
                    {data.groups.map((group) => (
                        <HeuristicGroup
                            allScoresJson={allScoresJson}
                            group={group}
                            key={group.id}
                        />
                    ))}

                    <Findings
                        data={findingsList}
                        router={router}
                        getFindings={getFindings}
                        currentJourney={currentJourney}
                        currentPlayer={currentPlayer}
                        currentProject={currentProject}
                        disable={userType !== "tester"}
                    />
                </div>
                <div className="relative mr-4">
                    <div
                        className={
                            scrollY > 150 ? "md:sticky top-20" : "relative"
                        }
                    >
                        <aside className="mb-10 mx-4 md:mx-0">
                            <div>
                                <SearchBox data={allHeuristics} />
                            </div>
                        </aside>
                        <aside className="hidden md:block">
                            <h1 className="text-slate-400 text-sm uppercase mb-5 border-b-2 pb-3">
                                Heuristic Groups
                            </h1>
                            <ul>
                                {data.groups.map((group) => (
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
                                    total={getTotals(allScoresObjContext).total}
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
