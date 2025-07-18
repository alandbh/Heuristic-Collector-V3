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
import getComparisonDataset from "../../lib/dash2/getComparisonDataset";
import BarChartCompare from "../../components/BarChartCompare";
import getHeuristicGroupDataset from "../../lib/dash2/getHeuristicGroupDataset";
import Spinner from "../../components/Spinner";

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
    const chartCompareRef = useRef(null);
    const finalChartRef = useRef(null);
    const router = useRouter();
    const { project } = router.query;

    const isDark = false;

    const { currentProjectObj, heuristics, previousProjectObj } =
        useAllProjectScores(project);
    // console.log("currentProjectObj", currentProjectObj);

    const isRetail =
        currentProjectObj?.slug.includes("retail") ||
        currentProjectObj?.slug.includes("latam");

    const isOverlapJourneys =
        currentProjectObj?.isOverlapJourneys !== null
            ? currentProjectObj?.isOverlapJourneys
            : isRetail;

    const {
        height,
        width,
        radius,
        gap,
        barWidth,
        separatorWidth,
        barColors,
        averageLineColor,
        averageLineDash,
        averageLineWidth,
        hOffset,
        vOffset,
        labelSize,
        compareHeight,
        compareWidth,
        compareRadius,
        compareBarMaxHeight,
        compareGap,
        compareBarColor,
        compareBarWidth,
        compareGapBetweenCharts,
        compareBottomOffset,
        compareBarStrokeColor,
        compareXAxisColor,
        compareXAxisWidth,
        compareHOffset,
        compareVOffset,
        compareHideBaseLine,
        compareHideBaseText,
        compareHideYears,
    } = currentProjectObj?.chartStyle ? currentProjectObj?.chartStyle : {};

    useEffect(() => {
        if (
            router.query.heuristic &&
            router.query.project &&
            heuristics &&
            currentProjectObj
        ) {
            let heuristicToselect = {
                heuristicNumber: router.query.heuristic,
            };

            // if (router.query.project.includes("retail") || router.query.project.includes("latam")) {
            if (isOverlapJourneys) {
                heuristicToselect.name = heuristics.find(
                    (heuristic) =>
                        heuristic.heuristicNumber === router.query.heuristic
                ).name;
            } else {
                heuristicToselect.name = heuristics.find(
                    (heuristic) =>
                        heuristic.heuristicNumber === router.query.heuristic &&
                        heuristic.journeys.some(
                            (journey) => journey.slug === router.query.journey
                        )
                ).name;

                // console.log({ heuri });
            }
            setSelectedHeuristic(heuristicToselect);
        }
    }, [router.query.heuristic, heuristics, isOverlapJourneys]);

    const showManyPlayers = router.query.showManyPlayers || null;

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
        router.query.showPlayer,
        router.query.showCross,
        showManyPlayers
    );

    // console.log("heuristicDataset", heuristicDataset);

    /**
     *
     * Here is where we get the data for the overall chart
     *
     * --------------------------
     *
     */

    const overallDataset = getPlayersFinalScore(
        currentProjectObj,
        router.query.showPlayer,
        router.query.showCross
    );

    // console.log("overallDataset", overallDataset);

    /**
     *
     * Here is where we get the data for the comparison chart
     *
     * --------------------------
     *
     */

    const comparisonDataset = getComparisonDataset(
        currentProjectObj,
        previousProjectObj,
        router.query.journey,
        selectedHeuristic.heuristicNumber,
        router.query.showPlayer
    );

    /**
     *
     * Here is where we get the data for the Heuristic Group chart
     *
     * --------------------------
     *
     */

    // const heuristicGroupDataset = getHeuristicGroupDataset(
    //     currentProjectObj,
    //     heuristics,
    //     router.query.showPlayer
    // );

    // console.log("comparisonDataset", currentProjectObj);

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

        setSelectedHeuristic({
            heuristicNumber: "",
            name: "",
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
            `chart-${router.query.journey || ""}${
                heuristicNumber && "-h_" + heuristicNumber
            }${playerSlug && "-" + playerSlug}.png`,
            { scale }
        );
    }

    if (!heuristics || !currentProjectObj) {
        return null;
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50  text-slate-200">
            <div className="flex">
                <Sidenav />

                <main className="pt-5 px-8 min-h-[calc(100vh_-_126px)] w-full flex flex-col items-center">
                    <Header
                        currentProjectObj={currentProjectObj}
                        currentJourney={router.query.journey}
                        heuristics={heuristics}
                        handleClickHeuristic={handleClickHeuristic}
                        handleSelectPlayer={handleSelectPlayer}
                        handleSelectJourney={handleSelectJourney}
                        router={router}
                        // isRetail={isRetail}
                        isOverlapJourneys={isOverlapJourneys}
                        dark={isDark}
                    />
                    <div className="w-[864px] mx-auto flex flex-col mt-10">
                        <ChartSection
                            title="Heuristic Chart"
                            average={heuristicDataset.allPlayersAverage}
                            dark={isDark}
                        >
                            {/* <Debugg data={showManyPlayers}></Debugg> */}
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
                            {heuristicDataset && (
                                <div>
                                    <BarChart
                                        refDom={chartRef}
                                        dataSet={heuristicDataset.dataset}
                                        valueKey={"value"}
                                        averageLine={
                                            heuristicDataset.allPlayersAverage
                                        }
                                        height={height}
                                        width={width}
                                        radius={radius}
                                        gap={gap}
                                        barWidth={barWidth}
                                        separatorWidth={separatorWidth}
                                        barColors={barColors}
                                        averageLineColor={averageLineColor}
                                        averageLineDash={averageLineDash}
                                        averageLineWidth={
                                            router.query.showCross
                                                ? 0
                                                : averageLineWidth
                                        }
                                        hOffset={hOffset}
                                        vOffset={vOffset}
                                        id="heuristic-chart"
                                    />

                                    <div className="mt-4 flex gap-10 ml-8 mb-5">
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
                                    {
                                        //isRetail && router.query.showPlayer && (
                                        isOverlapJourneys &&
                                            router.query.showPlayer &&
                                            heuristicDataset.dataset.find(
                                                (player) =>
                                                    player.playerSlug ===
                                                    router.query.showPlayer
                                            ) && (
                                                <>
                                                    <dir className="flex flex-col pl-5 text-slate-500 border-t border-slate-200 pt-3">
                                                        <div className="font-bold mb-2">
                                                            {
                                                                heuristicDataset.dataset.find(
                                                                    (player) =>
                                                                        player.playerSlug ===
                                                                        router
                                                                            .query
                                                                            .showPlayer
                                                                )["label"]
                                                            }
                                                            {"'s "}
                                                            Score By Journey
                                                        </div>
                                                        {currentProjectObj?.journeys.map(
                                                            (journey) => (
                                                                <div
                                                                    key={
                                                                        journey.slug
                                                                    }
                                                                    className="pl-3"
                                                                >
                                                                    {journey.name +
                                                                        ": "}
                                                                    <b>
                                                                        {
                                                                            heuristicDataset.dataset.find(
                                                                                (
                                                                                    player
                                                                                ) =>
                                                                                    player.playerSlug ===
                                                                                    router
                                                                                        .query
                                                                                        .showPlayer
                                                                            )[
                                                                                "score_" +
                                                                                    journey.slug
                                                                            ]
                                                                        }
                                                                    </b>
                                                                </div>
                                                            )
                                                        )}
                                                    </dir>

                                                    <dir className="flex flex-col pl-5 text-slate-500 border-t border-slate-200 pt-3">
                                                        <div className="mb-2 font-bold">
                                                            Department Average
                                                            by Journey (
                                                            {
                                                                heuristicDataset.dataset.find(
                                                                    (player) =>
                                                                        player.playerSlug ===
                                                                        router
                                                                            .query
                                                                            .showPlayer
                                                                )[
                                                                    "departmentName"
                                                                ]
                                                            }
                                                            )
                                                        </div>
                                                        {currentProjectObj?.journeys.map(
                                                            (journey) => (
                                                                <div
                                                                    key={
                                                                        journey.slug
                                                                    }
                                                                    className="pl-3"
                                                                >
                                                                    {journey.name +
                                                                        ": "}
                                                                    <b>
                                                                        {
                                                                            heuristicDataset.dataset.find(
                                                                                (
                                                                                    player
                                                                                ) =>
                                                                                    player.playerSlug ===
                                                                                    router
                                                                                        .query
                                                                                        .showPlayer
                                                                            )
                                                                                .departmentAverageByJourney[
                                                                                journey
                                                                                    .slug
                                                                            ]
                                                                        }
                                                                    </b>
                                                                </div>
                                                            )
                                                        )}
                                                    </dir>
                                                    <dir className="flex flex-col pl-5 text-slate-500 border-t border-slate-200 pt-3">
                                                        <div className="font-bold mb-2">
                                                            Department Average
                                                            for all journeys (
                                                            {
                                                                heuristicDataset.dataset.find(
                                                                    (player) =>
                                                                        player.playerSlug ===
                                                                        router
                                                                            .query
                                                                            .showPlayer
                                                                )[
                                                                    "departmentName"
                                                                ]
                                                            }
                                                            )
                                                        </div>
                                                        <div className="pl-3">
                                                            {currentProjectObj?.journeys
                                                                .map(
                                                                    (journey) =>
                                                                        journey.name
                                                                )
                                                                .join(" and ") +
                                                                ": "}
                                                            <b>
                                                                {
                                                                    heuristicDataset.dataset.find(
                                                                        (
                                                                            player
                                                                        ) =>
                                                                            player.playerSlug ===
                                                                            router
                                                                                .query
                                                                                .showPlayer
                                                                    )
                                                                        ?.departmentAverage
                                                                }
                                                            </b>
                                                        </div>
                                                    </dir>
                                                </>
                                            )
                                    }

                                    {
                                        //!isRetail && (
                                        !isOverlapJourneys && (
                                            <dir className="flex pl-5 text-slate-500 border-t border-slate-200 pt-3">
                                                <div className="">
                                                    Department Average:
                                                </div>
                                                <div className="pl-3">
                                                    <b>
                                                        {
                                                            heuristicDataset.dataset.find(
                                                                (player) =>
                                                                    player.playerSlug ===
                                                                    router.query
                                                                        .showPlayer
                                                            )?.departmentAverage
                                                        }
                                                    </b>
                                                </div>
                                            </dir>
                                        )
                                    }
                                </div>
                            )}

                            {/* <Debugg data={heuristicDataset.dataset} /> */}

                            {/* <Debugg data={router.query.journey}></Debugg>
                            <Debugg data={heuristics}></Debugg>
                            <Debugg data={heuristicDataset}></Debugg> */}
                            {/* <Debugg data={currentProjectObj.players}></Debugg> */}
                        </ChartSection>

                        <ChartSection title="Comparison Chart" dark={isDark}>
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
                            <div className=" px-8 pt-8 pb-4">
                                <div className="flex flex-col items-center">
                                    {currentProjectObj.previousProjectSlug ? (
                                        <>
                                            {comparisonDataset ? (
                                                <BarChartCompare
                                                    refDom={chartCompareRef}
                                                    dataSet={comparisonDataset}
                                                    hOffset={compareHOffset}
                                                    barWidth={compareBarWidth}
                                                    gap={compareGap}
                                                    gapBetweenCharts={
                                                        compareGapBetweenCharts
                                                    }
                                                    height={compareHeight}
                                                    barMaxHeight={
                                                        compareBarMaxHeight
                                                    }
                                                    width={compareWidth}
                                                    barColor={compareBarColor}
                                                    bottomOffset={
                                                        compareBottomOffset
                                                    }
                                                    radius={compareRadius}
                                                    barStrokeColor={
                                                        compareBarStrokeColor
                                                    }
                                                    xAxisColor={
                                                        compareXAxisColor
                                                    }
                                                    xAxisWidth={
                                                        compareXAxisWidth
                                                    }
                                                    vOffset={compareVOffset}
                                                    hideBaseLine={
                                                        compareHideBaseLine
                                                    }
                                                    hideBaseText={
                                                        compareHideBaseText
                                                    }
                                                    hideYears={compareHideYears}
                                                    id="comparison-chart"
                                                />
                                            ) : (
                                                <div className="pb-6 flex gap-4">
                                                    <Spinner colorClass="blue-500" />{" "}
                                                    Loading...
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="pb-6">
                                                🙄 There&apos;s no comparison
                                                data for this project.
                                            </div>
                                        </>
                                    )}
                                </div>

                                {comparisonDataset && (
                                    <div className="mt-4 flex gap-10">
                                        <button
                                            className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 text-sm"
                                            onClick={() =>
                                                handleClickCopySvg(
                                                    chartCompareRef,
                                                    "id2"
                                                )
                                            }
                                        >
                                            {svgCopied?.id2
                                                ? "✅ SVG Copied"
                                                : "Copy as SVG"}
                                        </button>
                                        <button
                                            className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 text-sm"
                                            onClick={() =>
                                                handleClickCopyPng(
                                                    chartCompareRef,
                                                    {
                                                        heuristicNumber:
                                                            "comparative_" +
                                                            selectedHeuristic?.heuristicNumber,
                                                        playerSlug:
                                                            router.query
                                                                .showPlayer,
                                                    }
                                                )
                                            }
                                        >
                                            Export as a PNG file
                                        </button>
                                    </div>
                                )}
                            </div>
                        </ChartSection>

                        <ChartSection
                            title="Overall Chart"
                            average={
                                (
                                    overallDataset.allPlayersPercentage * 100
                                ).toFixed(2) + "%"
                            }
                            dark={isDark}
                        >
                            <div>
                                <BarChart
                                    refDom={finalChartRef}
                                    isPercentage={true}
                                    dataSet={overallDataset.dataset}
                                    averageLine={
                                        overallDataset.allPlayersPercentage
                                    }
                                    valueKey={"percentage"}
                                    plotValues={true}
                                    height={height}
                                    width={width}
                                    radius={radius}
                                    gap={gap}
                                    barWidth={barWidth}
                                    separatorWidth={separatorWidth}
                                    barColors={barColors}
                                    averageLineColor={averageLineColor}
                                    averageLineDash={averageLineDash}
                                    averageLineWidth={
                                        router.query.showCross
                                            ? 0
                                            : averageLineWidth
                                    }
                                    hOffset={hOffset}
                                    vOffset={vOffset}
                                    labelSize={labelSize}
                                    id="overall-chart"
                                />
                            </div>
                            <div className="mt-4 flex gap-10 ml-8 mb-5">
                                <button
                                    className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400 whitespace-nowrap text-sm"
                                    onClick={() =>
                                        handleClickCopySvg(finalChartRef, "id4")
                                    }
                                >
                                    {svgCopied?.id4
                                        ? "✅ SVG Copied"
                                        : "Copy as SVG"}
                                </button>
                                <button
                                    className="border border-blue-300 h-8 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400  whitespace-nowrap text-sm"
                                    onClick={() =>
                                        handleClickCopyPng(
                                            finalChartRef,
                                            {
                                                heuristicNumber: "overall",
                                                playerSlug:
                                                    router.query.showPlayer,
                                            },
                                            4
                                        )
                                    }
                                >
                                    Export as a PNG file
                                </button>
                            </div>
                        </ChartSection>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Dash2;
