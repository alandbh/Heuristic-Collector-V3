import { useEffect, useState } from "react";
import { createPath } from "../../lib/utils";

export default function BarChart({
    dataSet,
    averageLine,
    isPercentage,
    refDom,
    width = 1048,
    height = 387,
    radius = 0,
    barWidth = 16,
    gap = 14,
    barColors = "#a5a5a5, red, blue, green",
    highlightColor = "#5383EB",
    averageLineWidth = 2,
    averageLineDash = "0,0",
    averageLineColor = "red",
    valueKey = "value",
    hOffset = 10,
    vOffset = 2,
}) {
    const [chartData, setChartData] = useState([]);

    const manyBarColors = {
        color_0: barColors.split(",")[0],
        color_1: barColors.split(",")[1],
        color_2: barColors.split(",")[2],
        color_3: barColors.split(",")[3],
    };

    // console.log({ dataSet });

    useEffect(() => {
        setChartData(dataSet);
    }, [dataSet]);

    if (!chartData || !dataSet) {
        return <div>Loading...</div>;
    }
    function getHeight(score, maxHeight) {
        return isPercentage
            ? (maxHeight / 5) * score * 5
            : (maxHeight / 5) * score;
    }
    function getAveragePosition(score, maxHeight) {
        let amount = score !== 0 ? 1 : -vOffset;

        return isPercentage
            ? maxHeight - (maxHeight / 5) * (score * 5) + amount
            : maxHeight - (maxHeight / 5) * score + amount;
    }

    // function getColor(showPlayer) {
    //     return showPlayer ? highlightColor : barColor;
    // }

    return (
        <div>
            <>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={width}
                    height={height}
                    fill="none"
                    viewBox={`0 0 ${width} ${height}`}
                    ref={refDom}
                    className="max-w-[800px] object-contain h-auto"
                    style={{ width: 800, transition: "0.4s" }}
                >
                    {chartData.map((score, index) => {
                        if (score.playerSlug === "separator") {
                            return (
                                <path
                                    key={index}
                                    d={createPath({
                                        w: barWidth,
                                        h: getHeight(
                                            score[valueKey],
                                            height - vOffset
                                        ),
                                        tlr: radius,
                                        trr: radius,
                                        brr: 0,
                                        blr: 0,
                                        x:
                                            hOffset +
                                            index * barWidth +
                                            index * gap,
                                        maxHeight: height - vOffset,
                                        vOffset,
                                    })}
                                    fill={manyBarColors[score.barColor]}
                                />
                            );
                        }
                        return (
                            <path
                                style={{ transition: "0.4s" }}
                                key={index}
                                d={createPath({
                                    w: barWidth,
                                    h: getHeight(
                                        score[valueKey],
                                        height - vOffset
                                    ),
                                    tlr: radius,
                                    trr: radius,
                                    brr: 0,
                                    blr: 0,
                                    x: hOffset + index * barWidth + index * gap,
                                    maxHeight: height - vOffset,
                                    vOffset,
                                })}
                                fill={manyBarColors[score.barColor]}
                            />
                        );
                    })}

                    <line
                        x1="0"
                        y1={
                            getAveragePosition(averageLine, height - vOffset) +
                            vOffset
                        }
                        x2={width}
                        y2={
                            getAveragePosition(averageLine, height - vOffset) +
                            vOffset
                        }
                        strokeWidth={averageLineWidth}
                        strokeDasharray={averageLineDash}
                        stroke={averageLineColor}
                        style={{ transition: "0.4s" }}
                    />
                </svg>
            </>
        </div>
    );
}
