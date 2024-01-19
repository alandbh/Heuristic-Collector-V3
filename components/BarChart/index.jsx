import { useEffect, useState } from "react";
import Debugg from "../../lib/Debugg";

export default function BarChart({
    dataSet,
    averageLine,
    isPercentage,
    refDom,
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
    function getHeight(score) {
        return isPercentage ? (385 / 5) * score * 5 : (385 / 5) * score;
    }
    function getAveragePosition(score) {
        let amount = score !== 0 ? 1 : -2;

        return isPercentage
            ? 385 - (385 / 5) * (score * 5) + amount
            : 385 - (385 / 5) * score + amount;
    }

    function getColor(showPlayer) {
        return showPlayer ? "#5383EB" : "#D9D9D9";
    }

    const isThereDepartments = chartData.some((score) => {
        return score.departmentSlug !== null;
    });

    const sectionList = Array.from(
        new Set(
            chartData.map((score) => {
                return score.departmentSlug;
            })
        )
    );

    console.log({ isThereDepartments });

    return (
        <div>
            <>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1048"
                    height="387"
                    fill="none"
                    viewBox="0 0 1048 387"
                    ref={refDom}
                    className="max-w-[800px] object-contain h-auto"
                    style={{ width: 800, transition: "0.4s" }}
                >
                    {chartData.map((score, index) => {
                        if (score.playerSlug === "separator") {
                            return (
                                <rect
                                    key={index}
                                    x={10 + index * 14 + index * 15}
                                    y={385 - getHeight(1) + 2}
                                    height={getHeight(1)}
                                    width="20"
                                    // fill={getColor(score.show_player)}
                                    fill="red"
                                    style={{ transition: "0.4s" }}
                                />
                            );
                        }
                        return (
                            <rect
                                key={index}
                                x={10 + index * 14 + index * 15}
                                y={385 - getHeight(score.value) + 2}
                                height={getHeight(score.value)}
                                width="20"
                                fill={getColor(score.show_player)}
                                style={{ transition: "0.4s" }}
                            />
                        );
                    })}

                    <rect
                        x="0"
                        y={getAveragePosition(averageLine) + 2}
                        width="1048"
                        height="1"
                        fill="#ff0000"
                        style={{ transition: "0.4s" }}
                    />
                </svg>
            </>
        </div>
    );
}
