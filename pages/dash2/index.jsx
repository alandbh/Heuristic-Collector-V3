import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { saveSvgAsPng } from "save-svg-as-png";

import Sidenav from "../../components/Dash2/Sidenav";
import useAllProjectScores from "../../lib/dash2/useAllProjectScores";

import Header from "../../components/Dash2/Header";
import ChartSection from "../../components/ChartSection";
import Debugg from "../../lib/Debugg";
import getHeuristicAverage from "../../lib/dash2/getHeuristicAverage";
import BarChart from "../../components/BarChart";
import getPlayersFinalScore from "../../lib/dash2/getPlayersFinalScore";

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
    const [svgCopied, setSVGCopied] = useState(null);
    const chartRef = useRef(null);
    const finalChartRef = useRef(null);
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

    /**
     *
     * Here is where we get the data for the heuristic chart
     *
     * --------------------------
     */

    const heuristicDataset = getHeuristicAverage(
        currentProjectObj,
        router.query.journey,
        selectedHeuristic.heuristicNumber,
        router.query.showPlayer
    );

    /**
     *
     * Here is where we get the data for the overall chart
     *
     * --------------------------
     *
     */

    const overallDataset = getPlayersFinalScore(
        currentProjectObj,
        router.query.showPlayer
    );

    console.log("overallDataset", overallDataset);

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
            `chart-${router.query.journey}${
                heuristicNumber && "-h_" + heuristicNumber
            }${playerSlug && "-" + playerSlug}.png`,
            { scale }
        );
    }

    console.log("heuristicAverage", heuristicDataset);

    const isRetail = () =>
        currentProjectObj.slug.includes("retail") ||
        !currentProjectObj.slug.includes("latam");

    if (!heuristics || !currentProjectObj) {
        return null;
    }

    return (
        <div className="bg-slate-700 dark:bg-slate-800/50  text-slate-200">
            <div className="flex">
                <Sidenav />

                <main className="pt-5 px-8 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                    <Header
                        currentProjectObj={currentProjectObj}
                        currentJourney={router.query.journey}
                        heuristics={heuristics}
                        handleClickHeuristic={handleClickHeuristic}
                        handleSelectPlayer={handleSelectPlayer}
                        handleSelectJourney={handleSelectJourney}
                        router={router}
                        isRetail={isRetail()}
                    />
                    <div className="w-[864px] mx-auto flex flex-col mt-10">
                        <ChartSection
                            title="Heuristic Chart"
                            average={heuristicDataset.allPlayersAverage}
                            dark={true}
                        >
                            <div className="flex border-b px-4 min-h-[50px]  text-slate-500">
                                <div className="flex gap-1 pr-4 border-r mr-4  text-sm pt-4">
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
                                <div>
                                    {/* <BarChart
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
                                    /> */}

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
                                        barWidth={16}
                                        separatorWidth={69}
                                        barColors="#a5a5a5, #4285F4, #174EA6, #333"
                                        averageLineColor="#a5a5a5"
                                        averageLineDash="8,7"
                                        averageLineWidth={1.8}
                                        hOffset={0}
                                        vOffset={0}
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
                                                handleClickCopyPng(chartRef, {
                                                    heuristicNumber:
                                                        selectedHeuristic?.heuristicNumber,
                                                    playerSlug:
                                                        router.query.showPlayer,
                                                })
                                            }
                                        >
                                            Export as a PNG file
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* <Debugg data={router.query.journey}></Debugg>
                            <Debugg data={heuristics}></Debugg>
                            <Debugg data={heuristicDataset}></Debugg> */}
                            {/* <Debugg data={currentProjectObj.players}></Debugg> */}
                        </ChartSection>

                        <ChartSection
                            title="Overall Chart"
                            average={overallDataset.allPlayersPercentage * 100}
                            dark={true}
                        >
                            <div>
                                <BarChart
                                    refDom={finalChartRef}
                                    isPercentage={true}
                                    dataSet={overallDataset.dataset}
                                    averageLine={
                                        overallDataset.allPlayersPercentage *
                                        100
                                    }
                                    valueKey={"percentage"}
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
                                />
                            </div>
                        </ChartSection>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dash2;
