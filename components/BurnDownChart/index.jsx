function BurnDownChart({ series, maxAmount, estimatedDaysToFinish }) {
    const barColor = { 1: "bg-primary", 2: "bg-primary/30" };
    const gapObj = {
        0: {
            class: "gap-0",
            pixels: 20,
        },
        1: {
            class: "gap-1",
            pixels: 24,
        },
    };

    const gap = series.length > 31 ? gapObj[0] : gapObj[1]; // Set the gap between series

    return (
        <div
            className={`flex w-full ${gap.class} overflow-auto relative -mt-3`}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={estimatedDaysToFinish * gap.pixels}
                height={228}
                fill="none"
                viewBox={`0 0 ${estimatedDaysToFinish * gap.pixels} 228`}
                className="max-w-[800px] object-contain h-auto absolute"
                style={{
                    translate: "10px 40px",
                }}
            >
                <line
                    x1="0"
                    y1={0}
                    x2={estimatedDaysToFinish * gap.pixels}
                    y2={228}
                    strokeWidth={1}
                    stroke="red"
                    style={{
                        transition: "0.4s",
                    }}
                />
            </svg>
            {series.map((day, index) => (
                <div
                    key={"burndown_" + index + "_" + day.amount}
                    className="h-80 w-auto flex pt-10"
                >
                    <div className="w-5 h-full flex flex-col justify-end items-center relative pb-10">
                        <div
                            style={{
                                position: "absolute",
                                bottom: 24,
                            }}
                            className="pb-1 w-10 text-[8px] -ml-[0px] rotate-[60deg] text-slate-500"
                        >
                            Day {index}
                        </div>
                        <div
                            className={`${
                                barColor[day.color]
                            } w-1 flex flex-col rounded-full mb-3`}
                            style={{
                                height: `${(day.amount / maxAmount) * 100}%`,
                            }}
                        >
                            <div
                                style={{
                                    marginTop: "-20px",
                                }}
                                className="w-5 pb-1 text-[8px] -ml-[8px] text-center text-slate-500 rotate-[-60deg]"
                            >
                                {day.amount}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default BurnDownChart;
