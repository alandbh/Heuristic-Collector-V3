function ProgressChart({
    people,
    currentDate,
    getCollectsByDate,
    barColorClass = "bg-green-500",
    amountByPerson,
    allCollects,
}) {
    return (
        <div className="flex flex-col w-full gap-3">
            {people?.map((person) => (
                <div
                    key={person.name}
                    className="flex gap-2 items-center w-full"
                >
                    <div className="w-20 text-xs text-slate-500">
                        {person.name.split(" ")[0] +
                            " " +
                            person.name.split(" ")[1][0]}
                        .
                    </div>
                    <div className="flex flex-1 items-center pr-10">
                        {allCollects ? (
                            <div className="h-2 w-full">
                                <div
                                    className={`${barColorClass} h-2 text-right flex items-center rounded-full`}
                                    style={{
                                        width: `${
                                            (amountByPerson[person.name] /
                                                allCollects?.length) *
                                            100
                                        }%`,
                                    }}
                                >
                                    <div className="ml-[100%] pl-1 text-[9px] text-slate-500">
                                        {amountByPerson[person.name]}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-2 w-full">
                                {getCollectsByDate(
                                    currentDate,
                                    person.name
                                ) && (
                                    <div
                                        className={`${barColorClass} h-2 text-right flex items-center rounded-full`}
                                        style={{
                                            width: `${
                                                (getCollectsByDate(
                                                    currentDate,
                                                    person.name
                                                )["personsDayCollection"]
                                                    .length /
                                                    getCollectsByDate(
                                                        currentDate,
                                                        person.name
                                                    )["peoplesDayCollection"]
                                                        .length) *
                                                100
                                            }%`,
                                        }}
                                    >
                                        <div className="ml-[100%] pl-1 text-[9px] text-slate-500">
                                            {
                                                getCollectsByDate(
                                                    currentDate,
                                                    person.name
                                                )["personsDayCollection"].length
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProgressChart;
