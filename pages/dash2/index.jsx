import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";

import Sidenav from "../../components/Dash2/Sidenav";
import useAllProjectScores from "../../lib/dash2/useAllProjectScores";

import Header from "../../components/Dash2/Header";
import ChartSection from "../../components/ChartSection";
import Debugg from "../../lib/Debugg";
import getHeuristicAverage from "../../lib/dash2/getHeuristicAverage";
import BarChart from "../../components/BarChart";

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
    const chartRef = useRef(null);
    const router = useRouter();
    const { project } = router.query;

    const { currentProjectObj, heuristics, previousProjectObj } =
        useAllProjectScores(project);
    // console.log("allProjectScores", currentProjectObj, heuristics);

    useEffect(() => {
        if (router.query.heuristic && heuristics) {
            setSelectedHeuristic({
                heuristicNumber: router.query.heuristic,
                name: heuristics.find(
                    (heuristic) =>
                        heuristic.heuristicNumber === router.query.heuristic
                ).name,
            });
        }
    }, [router.query.heuristic, heuristics]);

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

    const heuristicDataset = getHeuristicAverage(
        currentProjectObj,
        selectedHeuristic.heuristicNumber,
        router.query.showPlayer
    );

    console.log("heuristicAverage", heuristicDataset);

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
                    <div className="w-[864px] mx-auto flex flex-col mt-10">
                        <ChartSection title="Heuristic Chart">
                            <BarChart
                                refDom={chartRef}
                                dataSet={heuristicDataset.dataset}
                                valueKey={"value"}
                                averageLine={heuristicDataset.allPlayersAverage}
                                height={251}
                                width={915}
                                radius={4}
                                gap={12}
                                barWidth={13}
                                separatorWidth={50}
                                barColors="#a5a5a5, #4285F4, #174EA6, #333"
                                averageLineColor="#a5a5a5"
                                averageLineDash="8,7"
                                averageLineWidth={1.8}
                                hOffset={0}
                                vOffset={0}
                            />
                            <Debugg data={selectedHeuristic}></Debugg>
                            <Debugg data={heuristics}></Debugg>
                            {/* <Debugg data={currentProjectObj.players}></Debugg> */}
                        </ChartSection>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default dash2;
