import { useEffect, useState } from "react";

export default function BarChart({
    dataSet,
    averageLine,
    isPercentage,
    refDom,
}) {
    const [chartData, setChartData] = useState([]);

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
        console.log("dataSet", dataSet);
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

    return (
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
                return (
                    <rect
                        key={index}
                        x={22 + index * 24 + index * 25}
                        y={385 - getHeight(score.value) + 2}
                        height={getHeight(score.value)}
                        width="24"
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
    );
}
