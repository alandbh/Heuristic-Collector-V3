import { dateStringToUTCDate } from "../../lib/utils";

function ProgressChartDaily({
    collectsByPerson,
    personName,
    date,
    maxAmount = 80,
}) {
    return (
        <div className="w-5 h-full flex flex-col justify-end items-center relative pb-10">
            <div
                style={{
                    position: "absolute",
                    bottom: 24,
                }}
                className="pb-1 text-[8px] -ml-[0px] rotate-[60deg] text-slate-500"
            >
                {dateStringToUTCDate(date, false)}
            </div>
            <div
                className="bg-primary/80 w-1 flex flex-col rounded-full mb-3"
                style={{
                    height: `${
                        (collectsByPerson[personName][date].length /
                            maxAmount) *
                        100
                    }%`,
                }}
            >
                <div
                    style={{
                        marginTop: "-14px",
                    }}
                    className="pb-1 text-[8px] -ml-[2px] text-slate-500"
                >
                    {collectsByPerson[personName][date].length}
                </div>
            </div>
        </div>
    );
}

export default ProgressChartDaily;
