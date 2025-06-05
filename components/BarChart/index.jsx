import { useEffect, useState } from "react";
import { createPath } from "../../lib/utils";

export default function BarChart({
    dataSet,
    averageLine,
    isPercentage = false,
    plotValues = false,
    refDom,
    width = 1048,
    height = 387,
    radius = 0,
    barWidth = 16,
    separatorWidth = 16,
    gap = 14,
    barColors = "#a5a5a5, red, blue, green",
    averageLineWidth = 2,
    averageLineDash = "0,0",
    averageLineColor = "red",
    baseLineColor,
    valueKey = "value",
    hOffset = 10,
    vOffset = 2,
    labelSize = 9,
    id = "chart-" + String(Math.random()).split(".")[1],
}) {
    const [chartData, setChartData] = useState([]);

    const customVOffset = plotValues ? vOffset + 20 : vOffset;
    const customBaseLineColor = baseLineColor
        ? baseLineColor
        : barColors.split(", ")[0].trim();

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
        let amount = score !== 0 ? 1 : -customVOffset;

        return isPercentage
            ? maxHeight - (maxHeight / 5) * (score * 5) + amount
            : maxHeight - (maxHeight / 5) * score + amount;
    }

    // function getColor(showPlayer) {
    //     return showPlayer ? highlightColor : barColor;
    // }

    function getX(score, index) {
        return (
            hOffset +
            index * barWidth +
            index * gap +
            (score.departmentOrder - 1) * (separatorWidth - gap)
        );
    }

    const fontStyle = {
        percentage: {
            fontFamily: "Product Sans Regular",
            fontSize: 8.8,
        },
    };

    return (
        <div className="flex flex-col items-center justify-center pt-8" id={id}>
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
                    if (score.departmentOrder) {
                        return (
                            <path
                                style={{ transition: "0.4s" }}
                                key={index}
                                d={createPath({
                                    w: barWidth,
                                    h: getHeight(
                                        score[valueKey],
                                        height - customVOffset
                                    ),
                                    tlr: radius,
                                    trr: radius,
                                    brr: 0,
                                    blr: 0,
                                    x: getX(score, index),
                                    maxHeight: height - customVOffset,
                                    customVOffset,
                                })}
                                fill={
                                    score.barColor
                                        ? manyBarColors[score.barColor]
                                        : "#dddddd"
                                }
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
                                    height - customVOffset
                                ),
                                tlr: radius,
                                trr: radius,
                                brr: 0,
                                blr: 0,
                                x: hOffset + index * barWidth + index * gap,
                                maxHeight: height - customVOffset,
                                customVOffset,
                            })}
                            fill={manyBarColors[score.barColor]}
                        />
                    );
                })}

                <line
                    x1="0"
                    y1={getAveragePosition(averageLine, height - customVOffset)}
                    x2={width}
                    y2={getAveragePosition(averageLine, height - customVOffset)}
                    strokeWidth={averageLineWidth}
                    strokeDasharray={averageLineDash}
                    stroke={averageLineColor}
                    style={{ transition: "0.4s" }}
                />

                <line
                    x1={hOffset}
                    y1={height - customVOffset}
                    x2={width - hOffset}
                    y2={height - customVOffset}
                    strokeWidth={1}
                    stroke={customBaseLineColor}
                    style={{ transition: "0.4s" }}
                />
                {}

                {plotValues &&
                    chartData.map((score, index) => {
                        if (score.departmentOrder) {
                            return (
                                <text
                                    key={"group_" + index}
                                    fill={manyBarColors[score.barColor]}
                                    // x={getX(score, index) - 4}
                                    x={getX(score, index) - 0}
                                    y={height - 7}
                                    fontSize={labelSize}
                                    fontFamily="Product Sans Bold"
                                    width={barWidth}
                                >
                                    {/* {
                                        isPercentage
                                        ? (Number(score[valueKey]) * 100)
                                              .toFixed(1)
                                              .toString()
                                              .replace(".", ",") + "%"
                                        : score[valueKey]
                                              .toString()
                                              .replace(".", ",")
                                              
                                    } */}
                                    {isPercentage
                                        ? (Number(score[valueKey]) * 100)
                                              .toFixed(1)
                                              .toString()
                                              .replace(".", ",")
                                        : score[valueKey]
                                              .toString()
                                              .replace(".", ",")}
                                </text>
                            );
                        }
                    })}
            </svg>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={150}
                fill="red"
                viewBox={`0 0 ${width} ${150}`}
                className="max-w-[800px] object-contain h-auto mt-1"
                style={{ width: 800, transition: "0.4s" }}
            >
                {chartData.map((score, index) => {
                    if (score.departmentOrder) {
                        return (
                            <g
                                key={"group_" + index}
                                transform={`translate(${getX(
                                    score,
                                    index
                                )}, 0)`}
                            >
                                {!plotValues && (
                                    <text
                                        fill={manyBarColors[score.barColor]}
                                        y={0}
                                        x={0}
                                        fontSize={8.8}
                                        width={barWidth}
                                        style={
                                            isPercentage
                                                ? {
                                                      rotate: "0deg",
                                                      translate: "-5px 10px",
                                                      display: "block",
                                                      fontFamily:
                                                          "Product Sans Bold",
                                                      fontSize: 8.8,
                                                  }
                                                : {
                                                      translate: "0px 12px",
                                                      display: "block",
                                                  }
                                        }
                                    >
                                        {isPercentage
                                            ? (
                                                  Number(score[valueKey]) * 100
                                              ).toFixed(1) + "%"
                                            : score[valueKey]}
                                    </text>
                                )}

                                <text
                                    style={
                                        isPercentage
                                            ? {
                                                  rotate: "80deg",
                                                  translate: "3px 28px",
                                              }
                                            : {
                                                  rotate: "80deg",
                                                  translate: "0px 20px",
                                              }
                                    }
                                    fill={manyBarColors[score.barColor]}
                                    y={0}
                                    x={0}
                                    fontSize={10}
                                >
                                    {score.label}
                                </text>
                            </g>
                        );
                    }

                    return (
                        <g
                            key={"group_" + index}
                            transform={`translate(${
                                hOffset + index * barWidth + index * gap
                            }, 0)`}
                        >
                            <text
                                fill={manyBarColors[score.barColor]}
                                style={
                                    isPercentage
                                        ? {
                                              rotate: "60deg",
                                              translate: "0px 12px",
                                          }
                                        : ""
                                }
                                y={0}
                                x={0}
                                fontSize={12}
                            >
                                {isPercentage
                                    ? (Number(score[valueKey]) * 100).toFixed(
                                          2
                                      ) + "%"
                                    : score[valueKey]}
                            </text>
                            <text
                                style={{
                                    rotate: "60deg",
                                    translate: "0px 12px",
                                }}
                                fill={manyBarColors[score.barColor]}
                                y={0}
                                x={0}
                                fontSize={13}
                            >
                                {score.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
