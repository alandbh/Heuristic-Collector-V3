import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Sidenav from "../../components/Dash2/Sidenav";
import useAllProjectScores from "../../lib/dash2/useAllProjectScores";

import Header from "../../components/Dash2/Header";

/**
 *
 * ----------------------------------
 * The beggining of the dashboard v2
 * ----------------------------------
 *
 * This is the dashboard v2.
 */
function dash2() {
    const [selectedHeuristic, setSelectedHeuristic] = useState({
        heuristicNumber: "",
        name: "",
    });
    const router = useRouter();
    const { project } = router.query;

    const { currentProjectObj, heuristics, previousProjectObj } =
        useAllProjectScores(project);
    console.log("allProjectScores", currentProjectObj, heuristics);

    function handleClickHeuristic(item) {
        setSelectedHeuristic({
            heuristicNumber: item.item.heuristicNumber,
            name: item.item.name,
        });

        router.replace({
            query: {
                ...router.query,
                heuristic: item.item.heuristicNumber,
            },
        });
    }

    function handleSelectPlayer(ev) {
        router.replace({
            query: {
                ...router.query,
                showPlayer: ev.target.value,
            },
        });
    }

    if (!heuristics || !currentProjectObj) {
        return null;
    }

    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50 h-screen">
            <div className="flex">
                <Sidenav />

                <main className="pt-5 px-8 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                    <Header
                        currentProjectObj={currentProjectObj}
                        heuristics={heuristics}
                        handleClickHeuristic={handleClickHeuristic}
                        handleSelectPlayer={handleSelectPlayer}
                        router={router}
                    />
                </main>
            </div>
        </div>
    );
}

export default dash2;
