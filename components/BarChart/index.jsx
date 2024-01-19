import { useEffect, useState } from "react";
import Debugg from "../../lib/Debugg";

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
    barColor = "#D9D9D9",
    highlightColor = "#5383EB",
    averageLineWidth = 2,
    averageLineDash = "0,0",
    averageLineColor = "red",
}) {
    const [chartData, setChartData] = useState([]);

    // console.log({ dataSet });

    useEffect(() => {
        // const initialChartData = dataSet?.map((data) => {
        //     return {
        //         value: 1,
        //     };
        // });
        // setChartData(initialChartData);
        setChartData(dataSet);
        // setTimeout(() => {
        //     setChartData(dataSet);
        // }, 200);
        console.log("dataSet", dataSet[0].departmentName);
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
        let amount = score !== 0 ? 1 : -2;

        return isPercentage
            ? maxHeight - (maxHeight / 5) * (score * 5) + amount
            : maxHeight - (maxHeight / 5) * score + amount;
    }

    function getColor(showPlayer) {
        return showPlayer ? highlightColor : barColor;
    }

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
                                // <rect
                                //     key={index}
                                //     x={10 + index * 14 + index * 15}
                                //     y={385 - getHeight(1) + 2}
                                //     height={getHeight(1)}
                                //     width="20"
                                //     // fill={getColor(score.show_player)}
                                //     fill="red"
                                //     style={{ transition: "0.4s" }}
                                // />
                                <path
                                    key={index}
                                    d={createPath({
                                        w: 16,
                                        h: getHeight(score.value),
                                        tlr: radius,
                                        trr: radius,
                                        brr: 0,
                                        blr: 0,
                                        x: 10 + index * barWidth + index * gap,
                                        maxHeight: height - 2,
                                    })}
                                    fill={getColor(score.show_player)}
                                />
                            );
                        }
                        return (
                            // <rect
                            //     key={index}
                            //     x={10 + index * 14 + index * 15}
                            //     y={385 - getHeight(score.value) + 2}
                            //     height={getHeight(score.value)}
                            //     width="20"
                            //     fill={getColor(score.show_player)}
                            //     style={{ transition: "0.4s" }}
                            // />
                            <path
                                style={{ transition: "0.4s" }}
                                key={index}
                                d={createPath({
                                    w: 16,
                                    h: getHeight(score.value, height - 2),
                                    tlr: radius,
                                    trr: radius,
                                    brr: 0,
                                    blr: 0,
                                    x: 10 + index * barWidth + index * gap,
                                    maxHeight: height - 2,
                                })}
                                fill={getColor(score.show_player)}
                            />
                        );
                    })}

                    <line
                        x1="0"
                        y1={getAveragePosition(averageLine, height - 2) + 2}
                        x2={width}
                        y2={getAveragePosition(averageLine, height - 2) + 2}
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

function createPath(pathParams) {
    const { w, h, tlr, trr, brr, blr, x = 0, maxHeight = 512 } = pathParams;
    const y = maxHeight - h;
    return `
        M ${x} ${tlr + y} 
        A ${tlr} ${tlr} 0 0 1 ${tlr + x} ${y} 
        L ${w - trr + x} ${y} 
        A ${trr} ${trr} 0 0 1 ${w + x} ${trr + y} 
        L ${w + x} ${h - brr}
        A ${brr} ${brr} 0 0 1 ${w - brr + x} ${h + y} 
        L ${blr + x} ${h + y} 
        A ${blr} ${blr} 0 0 1 ${x} ${h - blr} 
        Z`;
}
