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
    barMaxHeight = 169,
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
    hideBaseLine = false,
    hideBaseText = false,
    hideYears = false,
    refDom,
    id = "chart-" + String(Math.random()).split(".")[1],
}) {
    const style = {
        year: {
            // fontFamily: "Helvetica, Arial, sans-serif",
            fontFamily: "Product Sans Regular",
            fontSize: 16,
        },
        label: {
            // fontFamily: "Helvetica, Arial, sans-serif",
            fontFamily: "Product Sans Bold",
            fontWeight: "normal",
            fontSize: 18,
        },
    };

    const setWidth = barWidth * 2 + gap;
    const subchartWidth = (width - gapBetweenCharts) / 2;
    const chartOneStart = 0;
    const chartTwoStart = width / 2 + gapBetweenCharts / 2;
    const subchartPadding = (subchartWidth - setWidth) / 2;

    return (
        <div id={id}>
            <svg
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                ref={refDom}
            >
                {dataSet.previousYearScores.playerScore ? (
                    <path
                        className="barra anterior player"
                        d={createPath({
                            w: barWidth,
                            h: getHeight(
                                dataSet.previousYearScores.playerScore,
                                barMaxHeight,
                                false
                            ),
                            tlr: radius,
                            trr: radius,
                            brr: 0,
                            blr: 0,
                            // x: hOffset,
                            x: (subchartWidth - setWidth) / 2,
                            maxHeight: barMaxHeight,
                            vOffset: bottomOffset + xAxisWidth + 2,
                        })}
                        fill={barColor}
                    />
                ) : (
                    <path
                        className="barra anterior player"
                        d={createPath({
                            w: barWidth,
                            h: getHeight(0.5, barMaxHeight, false),
                            tlr: radius,
                            trr: radius,
                            brr: 0,
                            blr: 0,
                            // x: hOffset,
                            x: (subchartWidth - setWidth) / 2,
                            maxHeight: barMaxHeight,
                            vOffset: bottomOffset + xAxisWidth + 2,
                        })}
                        fill="#dddddd"
                    />
                )}

                {dataSet.previousYearScores.averageScore ? (
                    <path
                        className="barra anterior media"
                        style={{ transition: "0.4s" }}
                        d={createPath({
                            w: barWidth,
                            h: getHeight(
                                dataSet.previousYearScores.averageScore,
                                barMaxHeight,
                                false
                            ),
                            tlr: radius,
                            trr: radius,
                            brr: 0,
                            blr: 0,
                            // x: hOffset + barWidth + gap,

                            x: (subchartWidth - setWidth) / 2 + gap + barWidth,
                            maxHeight: barMaxHeight,
                            vOffset: bottomOffset + xAxisWidth + 2,
                        })}
                        fill="transparent"
                        stroke={barStrokeColor}
                    />
                ) : (
                    <path
                        className="barra anterior media"
                        style={{ transition: "0.4s" }}
                        d={createPath({
                            w: barWidth,
                            h: getHeight(0.5, barMaxHeight, false),
                            tlr: radius,
                            trr: radius,
                            brr: 0,
                            blr: 0,
                            // x: hOffset + barWidth + gap,

                            x: (subchartWidth - setWidth) / 2 + gap + barWidth,
                            maxHeight: barMaxHeight,
                            vOffset: bottomOffset + xAxisWidth + 2,
                        })}
                        fill="#dddddd"
                    />
                )}

                {!hideBaseLine && (
                    <>
                        {dataSet.previousYearScores.averageScore ? (
                            <line
                                className="linha inferior ano anterior"
                                x1="0"
                                y1={height - bottomOffset}
                                x2={(width - gapBetweenCharts) / 2}
                                y2={height - bottomOffset}
                                stroke={xAxisColor}
                                strokeWidth={xAxisWidth}
                            />
                        ) : (
                            <line
                                className="linha inferior ano anterior"
                                x1="0"
                                y1={height - bottomOffset}
                                x2={(width - gapBetweenCharts) / 2}
                                y2={height - bottomOffset}
                                stroke="#dddddd"
                                strokeWidth={xAxisWidth}
                            />
                        )}
                    </>
                )}

                {!hideBaseText && (
                    <g>
                        {dataSet.previousYearScores.averageScore ? (
                            <>
                                <text
                                    // x={hOffset + barWidth / 2}
                                    x={
                                        ((width - gapBetweenCharts) / 2 -
                                            (gap + barWidth * 2)) /
                                            2 +
                                        barWidth / 2
                                    }
                                    y={
                                        height -
                                        bottomOffset +
                                        style.label.fontSize +
                                        2 +
                                        xAxisWidth
                                    }
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
                                    // x={hOffset + barWidth + gap + barWidth / 2}

                                    x={
                                        (subchartWidth - setWidth) / 2 +
                                        gap +
                                        barWidth +
                                        barWidth / 2
                                    }
                                    y={
                                        height -
                                        bottomOffset +
                                        style.label.fontSize +
                                        2 +
                                        xAxisWidth
                                    }
                                    textAnchor="middle"
                                    style={style.label}
                                    fill="#9AA0A6"
                                >
                                    {dataSet.previousYearScores.averageScore
                                        ?.toFixed(1)
                                        .toString()
                                        .replace(".", ",")}
                                </text>
                            </>
                        ) : (
                            <text
                                // x={hOffset + barWidth / 2}
                                x={(width - gapBetweenCharts) / 4}
                                y={
                                    height -
                                    bottomOffset +
                                    style.label.fontSize +
                                    2 +
                                    xAxisWidth
                                }
                                textAnchor="middle"
                                style={style.label}
                                fill="#dddddd"
                            >
                                Sem dados
                            </text>
                        )}
                    </g>
                )}

                {!hideYears && (
                    <text
                        // x={(width - gapBetweenCharts) / 4}
                        // x={width / 4 - gapBetweenCharts / 2}
                        // x={
                        //     ((width - gapBetweenCharts) / 2 -
                        //         (gap + barWidth * 2)) /
                        //         2 +
                        //     barWidth / 2 +
                        //     gap
                        // }
                        x={chartOneStart + subchartWidth / 2}
                        y={style.year.fontSize}
                        textAnchor="middle"
                        style={style.year}
                        fill="#9AA0A6"
                        className="anoA-anterior"
                    >
                        {dataSet.previousYearScores.year}
                    </text>
                )}

                {/*
                    *
                    *
                    chart separation
                    *
                    *
                */}
                {/* <rect
                    x={chartTwoStart + subchartPadding}
                    y={200}
                    fill="#ff000066"
                    width={barWidth * 2 + gap}
                    height={100}
                ></rect> */}
                <path
                    d={createPath({
                        w: barWidth,
                        h: getHeight(
                            dataSet.currentYearScores.playerScore,
                            barMaxHeight
                        ),
                        tlr: radius,
                        trr: radius,
                        brr: 0,
                        blr: 0,
                        // x: hOffset * 3 + barWidth * 2 + gap + gapBetweenCharts,
                        // x:
                        //     (width - gapBetweenCharts) / 2 +
                        //     gapBetweenCharts +
                        //     hOffset,
                        x: chartTwoStart + subchartPadding,
                        //+ (width / 2 + gapBetweenCharts / 2)
                        maxHeight: barMaxHeight,
                        vOffset: bottomOffset + xAxisWidth + 2,
                    })}
                    fill={barColor}
                />

                <path
                    style={{ transition: "0.4s" }}
                    d={createPath({
                        w: barWidth,
                        h: getHeight(
                            dataSet.currentYearScores.averageScore,
                            barMaxHeight
                        ),
                        tlr: radius,
                        trr: radius,
                        brr: 0,
                        blr: 0,
                        // x:
                        //     hOffset * 3 +
                        //     barWidth * 3 +
                        //     gap * 2 +
                        //     gapBetweenCharts,
                        x: chartTwoStart + subchartPadding + barWidth + gap,
                        maxHeight: barMaxHeight,
                        vOffset: bottomOffset + xAxisWidth + 2,
                    })}
                    fill="transparent"
                    stroke={barStrokeColor}
                />

                {!hideBaseLine && (
                    <line
                        className="linha inferior ano atual"
                        x1={width / 2 + gapBetweenCharts / 2}
                        y1={height - bottomOffset}
                        x2={width}
                        y2={height - bottomOffset}
                        stroke={xAxisColor}
                        strokeWidth={xAxisWidth}
                    />
                )}

                {!hideBaseText && (
                    <g>
                        <text
                            // x={width / 2 + gapBetweenCharts / 2 + hOffset}
                            // x={
                            //     hOffset * 3 +
                            //     barWidth * 2 +
                            //     gap +
                            //     gapBetweenCharts +
                            //     barWidth / 2
                            // }
                            x={chartTwoStart + subchartPadding + barWidth / 2}
                            y={
                                height -
                                bottomOffset +
                                style.label.fontSize +
                                2 +
                                xAxisWidth
                            }
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
                                chartTwoStart +
                                subchartPadding +
                                barWidth +
                                gap +
                                barWidth / 2
                            }
                            y={
                                height -
                                bottomOffset +
                                style.label.fontSize +
                                2 +
                                xAxisWidth
                            }
                            textAnchor="middle"
                            style={style.label}
                            fill="#9AA0A6"
                        >
                            {dataSet.currentYearScores.averageScore
                                ?.toFixed(1)
                                .toString()
                                .replace(".", ",")}
                        </text>
                    </g>
                )}

                {!hideYears && (
                    <text
                        // x={
                        //     hOffset * 3 +
                        //     barWidth * 3 +
                        //     gap +
                        //     gapBetweenCharts +
                        //     gap / 2
                        // }
                        // x={(width / 4) * 3 + gapBetweenCharts / 2}
                        x={chartTwoStart + subchartWidth / 2}
                        y={style.year.fontSize}
                        textAnchor="middle"
                        style={style.year}
                        fill="#333"
                        className="anoA-anterior ano atual"
                    >
                        {dataSet.currentYearScores.year}
                    </text>
                )}
            </svg>
            {/* <Debugg data={dataSet} /> */}
        </div>
    );
}
