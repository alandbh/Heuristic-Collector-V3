import React, { useEffect, useRef } from "react";
import HeuristicItem from "../HeuristicItem";
import { useScoresContext } from "../../context/scores";
import { useScoresObjContext } from "../../context/scoresObj";
import Donnut from "../Donnut";
import { useRouter } from "next/router";

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
 * HEURISTIC GROUP
 *
 */

function HeuristicGroup({ group, allScoresJson, allScoresObj, index }) {
    // const { allScores } = useScoresContext();
    // const { allScoresObj } = useScoresObjContext();
    const router = useRouter();
    const containerRef = useRef(null);

    useEffect(() => {
        if (group.heuristic.length > 0) {
            containerRef.current?.classList.add("opacity-0", "translate-y-10");
            setTimeout(() => {
                containerRef.current?.classList.remove(
                    "opacity-0",
                    "translate-y-10"
                );
            }, 500);
        }
    }, [group.heuristic, router.query.player, router.query.journey]);

    const heuristicsToMap = group.heuristic
        .filter(
            (heuristic) =>
                !isANotApplicableHeuristic(heuristic, router.query.player) &&
                isPresentInThisJourney(heuristic, router.query.journey)
        )
        .sort(
            (a, b) =>
                String(a.heuristicNumber).split(".")[1] -
                String(b.heuristicNumber).split(".")[1]
        );

    if (!allScoresObj) {
        return null;
    }

    const groupSores = allScoresObj?.filter(
        (score) => score.group.name === group.name
    );
    const groupTotalSore = groupSores.reduce(
        (acc, current) => acc + current.scoreValue,
        0
    );

    function getRoundedClass(collection, index) {
        if (index === 0) {
            return " rounded-tr-lg rounded-tl-lg ";
        }

        if (collection.length === index + 1) {
            return " rounded-br-lg rounded-bl-lg ";
        }

        return "";
    }

    return (
        <section
            ref={containerRef}
            className="transition opacity-0 translate-y-10 mx-3"
            id={group.id}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            <header className="flex justify-between mb-6 items-center px-4 gap-3">
                <h1 className="text-xl font-bold">
                    <div className="h-[5px] bg-primary w-10 mb-1"></div>
                    {`${group.groupNumber}. ${group.name}`}
                </h1>
                <div className="text-lg flex items-center gap-5">
                    <b className="whitespace-nowrap text-sm md:text-xl">
                        {groupTotalSore} of {5 * heuristicsToMap.length}
                    </b>

                    <Donnut
                        total={5 * heuristicsToMap.length}
                        sum={groupTotalSore}
                        radius={25}
                        thick={3}
                    ></Donnut>
                </div>
            </header>
            <ul className="bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                {heuristicsToMap.map((heuristicItem, index) => {
                    return (
                        <HeuristicItem
                            key={heuristicItem.id}
                            id={heuristicItem.id}
                            heuristic={heuristicItem}
                            allScoresJson={allScoresJson}
                            allScoresObj={allScoresObj}
                            className={getRoundedClass(heuristicsToMap, index)}
                        />
                    );
                })}
            </ul>
        </section>
    );
}

export default React.memo(HeuristicGroup);
