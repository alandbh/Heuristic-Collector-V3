function BurnDownChart({ maxAmount, amountByDay, index, color = 1 }) {
    const barColor = color === 1 ? "bg-primary" : "bg-primary/30";
    return (
        <div className="h-80 w-auto flex pt-10">
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
                    className={`${barColor} w-1 flex flex-col rounded-full mb-3`}
                    style={{
                        height: `${(amountByDay / maxAmount) * 100}%`,
                    }}
                >
                    <div
                        style={{
                            marginTop: "-14px",
                        }}
                        className="w-5 pb-1 text-[8px] -ml-[8px] text-center text-slate-500"
                    >
                        {amountByDay}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BurnDownChart;
