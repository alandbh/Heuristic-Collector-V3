import { createPath } from "../../lib/utils";

function getHeight(score, maxHeight, isPercentage = false) {
    return isPercentage ? (maxHeight / 5) * score * 5 : (maxHeight / 5) * score;
}

const _dataSet = {
    currentYearScores: {
        year: 2023,
        playerScore: 4,
        averageScore: 2,
    },
    previousYearScores: {
        year: 2022,
        playerScore: 5,
        averageScore: 2,
    },
};

export default function BarChartCompare({
    dataSet = _dataSet,
    width = 356,
    height = 246,
    radius = 6,
    barWidth = 28,
    gap = 50,
    gapBetweenCharts = 30,
    barColor = "#174EA6",
    barStrokeColor = "#9AA0A6",
    barStrokeWidth = 1,
    xAxisColor = "#9AA0A6",
    xAxisWidth = 2,
    hOffset = 28,
    vOffset = 32,
    bottomOffset = 26,
    refDom,
}) {
    const style = {
        year: {
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: 14,
        },
        label: {
            fontFamily: "Helvetica, Arial, sans-serif",
            fontWeight: "normal",
            fontSize: 16,
        },
    };

    return (
        <div>
            <svg
                width={width}
                height={height + bottomOffset}
                viewBox={`0 0 ${width} ${height + bottomOffset}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ref={refDom}
            >
                <path
                    className="barra anterior player"
                    d={createPath({
                        w: barWidth,
                        h: getHeight(
                            dataSet.previousYearScores.playerScore,
                            height - vOffset,
                            false
                        ),
                        tlr: radius,
                        trr: radius,
                        brr: 0,
                        blr: 0,
                        x: hOffset,
                        maxHeight: height - vOffset,
                        vOffset,
                    })}
                    fill={barColor}
                />

                <path
                    style={{ transition: "0.4s" }}
                    d={createPath({
                        w: barWidth,
                        h: getHeight(
                            dataSet.previousYearScores.averageScore,
                            height - vOffset - barStrokeWidth * 2,
                            false
                        ),
                        tlr: radius,
                        trr: radius,
                        brr: 0,
                        blr: 0,
                        x: hOffset + barWidth + gap,
                        maxHeight: height - vOffset,
                        vOffset,
                    })}
                    fill="transparent"
                    stroke={barStrokeColor}
                />

                <line
                    className="linha inferior ano anterior"
                    x1="0"
                    y1={height}
                    x2={(width - gapBetweenCharts) / 2}
                    y2={height}
                    stroke={xAxisColor}
                    strokeWidth={xAxisWidth}
                />
                <text
                    x={hOffset + barWidth / 2}
                    y={height + bottomOffset - 2}
                    textAnchor="middle"
                    style={style.label}
                    fill="#9AA0A6"
                >
                    {dataSet.previousYearScores.playerScore
                        ?.toFixed(1)
                        .toString()
                        .replace(".", ",")}
                </text>

                <text
                    x={hOffset + barWidth + gap + barWidth / 2}
                    y={height + bottomOffset - 2}
                    textAnchor="middle"
                    style={style.label}
                    fill="#9AA0A6"
                >
                    {dataSet.previousYearScores.averageScore
                        ?.toFixed(1)
                        .toString()
                        .replace(".", ",")}
                </text>

                <text
                    x={(width - gapBetweenCharts) / 4}
                    y={style.year.fontSize}
                    textAnchor="middle"
                    style={style.year}
                    fill="#9AA0A6"
                    className="anoA-anterior"
                >
                    {dataSet.previousYearScores.year}
                </text>

                {/*
                    *
                    *
                    chart separation
                    *
                    *
                */}
                <path
                    d={createPath({
                        w: barWidth,
                        h: getHeight(
                            dataSet.currentYearScores.playerScore,
                            height - vOffset
                        ),
                        tlr: radius,
                        trr: radius,
                        brr: 0,
                        blr: 0,
                        x: hOffset * 3 + barWidth * 2 + gap + gapBetweenCharts,
                        maxHeight: height - vOffset,
                        vOffset,
                    })}
                    fill={barColor}
                />

                <path
                    style={{ transition: "0.4s" }}
                    d={createPath({
                        w: barWidth,
                        h: getHeight(
                            dataSet.currentYearScores.averageScore,
                            height - vOffset - barStrokeWidth * 2
                        ),
                        tlr: radius,
                        trr: radius,
                        brr: 0,
                        blr: 0,
                        x:
                            hOffset * 3 +
                            barWidth * 3 +
                            gap * 2 +
                            gapBetweenCharts,
                        maxHeight: height - vOffset,
                        vOffset,
                    })}
                    fill="transparent"
                    stroke={barStrokeColor}
                />

                <line
                    className="linha inferior ano atual"
                    x1={width / 2 + gapBetweenCharts / 2}
                    y1={height}
                    x2={width}
                    y2={height}
                    stroke={xAxisColor}
                    strokeWidth={xAxisWidth}
                />
                <text
                    // x={width / 2 + gapBetweenCharts / 2 + hOffset}
                    x={
                        hOffset * 3 +
                        barWidth * 2 +
                        gap +
                        gapBetweenCharts +
                        barWidth / 2
                    }
                    y={height + bottomOffset - 2}
                    textAnchor="middle"
                    style={style.label}
                    fill="#9AA0A6"
                >
                    {dataSet.currentYearScores.playerScore
                        ?.toFixed(1)
                        .toString()
                        .replace(".", ",")}
                </text>

                <text
                    x={
                        hOffset * 3 +
                        barWidth * 3 +
                        gap * 2 +
                        gapBetweenCharts +
                        barWidth / 2
                    }
                    y={height + bottomOffset - 2}
                    textAnchor="middle"
                    style={style.label}
                    fill="#9AA0A6"
                >
                    {dataSet.currentYearScores.averageScore
                        ?.toFixed(1)
                        .toString()
                        .replace(".", ",")}
                </text>

                <text
                    x={
                        hOffset * 3 +
                        barWidth * 3 +
                        gap +
                        gapBetweenCharts +
                        gap / 2
                    }
                    y={style.year.fontSize}
                    textAnchor="middle"
                    style={style.year}
                    fill="#333"
                    className="anoA-anterior ano atual"
                >
                    {dataSet.currentYearScores.year}
                </text>
            </svg>
            {/* <Debugg data={dataSet} /> */}
        </div>
    );
}
