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
function Dash2() {
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

    function handleSelectJourney(ev) {
        router.replace({
            query: {
                ...router.query,
                journey: ev.target.value,
            },
        });
    }

    const heuristicDataset = getHeuristicAverage(
        currentProjectObj,
        router.query.journey,
        selectedHeuristic.heuristicNumber,
        router.query.showPlayer
    );

    console.log("heuristicAverage", heuristicDataset);

    const isRetail = () => currentProjectObj.slug.includes("retail");

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
                        handleSelectJourney={handleSelectJourney}
                        router={router}
                        isRetail={isRetail()}
                    />
                    <div className="w-[864px] mx-auto flex flex-col mt-10">
                        <ChartSection title="Heuristic Chart" average={13}>
                            <div className="flex border-b px-4 min-h-[50px]">
                                <div className="flex gap-1 pr-4 border-r mr-4 text-slate-500 text-sm pt-4">
                                    <p>Selected Heuristic:</p>
                                </div>
                                <div className="flex gap-2 text-sm pt-4 pb-4">
                                    <b>{selectedHeuristic?.heuristicNumber}</b>
                                    <span className="max-w-lg text-slate-700">
                                        {selectedHeuristic?.name}
                                    </span>
                                </div>
                            </div>
                            {/* <Debugg data={heuristicDataset}></Debugg> */}
                            {heuristicDataset && (
                                <BarChart
                                    refDom={chartRef}
                                    dataSet={heuristicDataset.dataset}
                                    valueKey={"value"}
                                    averageLine={
                                        heuristicDataset.allPlayersAverage
                                    }
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
                            )}

                            <Debugg data={router.query.journey}></Debugg>
                            <Debugg data={heuristics}></Debugg>
                            <Debugg data={heuristicDataset}></Debugg>
                            {/* <Debugg data={currentProjectObj.players}></Debugg> */}
                        </ChartSection>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dash2;
