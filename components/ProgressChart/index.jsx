import { useCallback, useEffect, useState } from "react";
import { sortCollection } from "../../lib/utils";

function ProgressChart({
    people,
    currentDate,
    getCollectsByDate,
    barColorClass = "bg-green-500",
    amountByPerson,
    allCollects,
}) {
    const [collection, setCollection] = useState([]);

    const getPercent = useCallback((personName, maximum) => {
        if (allCollects) {
            const amountArr = Object.keys(amountByPerson).map(
                (person) => amountByPerson[person]
            );

            return (amountByPerson[personName] / Math.max(...amountArr)) * 100;
        }
        return (getAmount(personName) / maximum) * 100;
    }, []);

    const getAmount = useCallback((personName) => {
        if (allCollects) {
            return amountByPerson[personName];
        }
        if (getCollectsByDate(currentDate, personName)) {
            return getCollectsByDate(currentDate, personName)[
                "personsDayCollection"
            ].length;
        }

        return 0;
    }, []);

    const totalByPersonInDay = people.map((person) => {
        return getAmount(person.name);
    });

    const maxBySomeoneInDay = Math.max(...totalByPersonInDay);

    useEffect(() => {
        const collectionUnsorted = [];
        if (people) {
            people?.map((person) => {
                if (maxBySomeoneInDay) {
                    const collectObj = {};

                    collectObj.name =
                        person.name.split(" ")[0] +
                        " " +
                        person.name.split(" ")[1][0];
                    collectObj.percent = getPercent(
                        person.name,
                        maxBySomeoneInDay
                    );
                    collectObj.amount = getAmount(person.name);

                    collectionUnsorted.push(collectObj);
                }
            });
            const collectionSorted = sortCollection(
                collectionUnsorted,
                "percent",
                false
            );

            setCollection(collectionSorted);
        }
    }, [people, getCollectsByDate, amountByPerson, maxBySomeoneInDay]);

    // console.log("amountArr", amountArr);

    return (
        <div className="flex flex-col w-full gap-3">
            {collection?.map((person) => (
                <div
                    key={person.name}
                    className="flex gap-2 items-center w-full"
                >
                    <div className="w-20 text-xs text-slate-500">
                        {person.name}.
                    </div>
                    <div className="flex flex-1 items-center pr-10">
                        <div className="h-2 w-full md:w-[50%]">
                            <div
                                className={`${barColorClass} h-2 text-right flex items-center rounded-full`}
                                style={{
                                    width: `${person.percent}%`,
                                }}
                            >
                                <div className="ml-[100%] pl-1 text-[9px] text-slate-500">
                                    {person.amount}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProgressChart;
