import { useState, useEffect } from "react";

import { timestampToDateString, getUniqueItem, sortCollection } from "./utils";

export default function useCollect(projectSlug, allCollectionsAmount) {
    const [data, setData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/api/scores?project=${projectSlug}`);
            const allScores = await response.json();

            const dateObj = {};
            allScores.map((player) => {
                const journeys = Object.keys(player.scoresObject);

                journeys.map((journey) => {
                    return player.scoresObject[journey].map((scoreObj) => {
                        if (scoreObj.updates) {
                            const colect = scoreObj.updates?.pop();
                            colect.id = scoreObj.id;
                            const dateKey = timestampToDateString(
                                colect.dateTime
                            );

                            colect.date = dateKey;

                            if (!dateObj[dateKey]) {
                                dateObj[dateKey] = [];
                            }

                            dateObj[dateKey].push(colect);
                        }
                        return null;
                    });
                });
            });

            const dateArray = Object.keys(dateObj);
            const fakeDateArray = [...dateArray];
            fakeDateArray.length = 10;

            // const newestDate = String(Math.max(...dateArray));
            const newestDate = String(Math.max(...fakeDateArray)); // fake
            const secondMax = Math.max(
                ...fakeDateArray.filter(
                    (num) => Number(num) !== Number(newestDate)
                )
            );

            // const newestDate = "20240404";
            const yesterDay = String(secondMax);
            // const yesterDay = getPreviousDate(newestDate);
            const peopleDuplicated = [];
            for (let date in dateObj) {
                dateObj[date].map((score) => {
                    peopleDuplicated.push(score.user);
                });
            }
            // const people_unsorted = getUniqueItem(peopleDuplicated, "name");
            const people = sortCollection(
                getUniqueItem(peopleDuplicated, "name"),
                "name"
            );
            const collectsByPerson = {};

            people.map((person) => {
                collectsByPerson[person.name] = {};
                dateArray.map((date) => {
                    collectsByPerson[person.name][date] = [];
                    const collects = dateObj[date].filter((score) =>
                        score.user.name.startsWith(person.name)
                    );
                    if (collects.length > 0) {
                        collectsByPerson[person.name][date] = collects;
                    }
                });
            });

            const amountByPerson = {};
            Object.keys(collectsByPerson).map((name) => {
                amountByPerson[name] = 0;

                for (let date in collectsByPerson[name]) {
                    amountByPerson[name] += collectsByPerson[name][date].length;
                }
            });

            const allCollects = dateArray
                .map((date) => {
                    return dateObj[date];
                })
                .flat();

            const collectsByDate = dateObj;

            const amountByDate = Object.keys(collectsByDate).map(
                (date) => collectsByDate[date].length
            );
            const maxDateAmount = Math.max(...amountByDate);

            const amountForPerson = [];
            Object.keys(collectsByPerson).map((name) => {
                Object.keys(collectsByPerson[name]).map((date) => {
                    amountForPerson.push(collectsByPerson[name][date].length);
                });
            });

            const maxAmountForAPerson = Math.max(...amountForPerson);

            /**
             *
             * ----------------------------------------------------------------
             * Calculating the remaing days for finish the collect
             * ----------------------------------------------------------------
             *
             */

            // const startDate = "20240815";
            const startDate = "0";
            const estimatedDaysToFinish = 24;

            // const totalHeuristics = allCollectionsAmount + allCollects.length; // Fake. It should be just allCollectionsAmount
            const totalHeuristics = allCollectionsAmount;
            const collectionsSoFar = allCollects.length;
            const workedDays = Object.keys(collectsByDate).length;
            const averageCollectionsADay = Math.round(
                collectionsSoFar / workedDays
            );

            const pastDays = [];
            const daysRemaining = [];

            let pastCollectionsRemaining = totalHeuristics;

            for (const date in collectsByDate) {
                if (date >= startDate) {
                    pastCollectionsRemaining -= collectsByDate[date].length;

                    pastDays.push({
                        color: 1,
                        amount: pastCollectionsRemaining,
                    });
                }
            }

            let futureCollectionsRemaining =
                pastDays[pastDays.length - 1].amount;

            for (
                let index = averageCollectionsADay;
                index <= futureCollectionsRemaining;
                index += averageCollectionsADay
            ) {
                // futureCollectionsRemaining -= averageCollectionsADay;
                daysRemaining.push({
                    color: 2,
                    amount: futureCollectionsRemaining - index,
                });
            }

            // for (
            //     let index = collectionsSoFar;
            //     index < totalHeuristics;
            //     index += averageCollectionsADay
            // ) {
            //     if (index > pastDays[pastDays.length - 1].amount) {
            //         futureCollectionsRemaining -= averageCollectionsADay;
            //         daysRemaining.push({
            //             color: 2,
            //             amount: futureCollectionsRemaining,
            //         });
            //     }
            //     // console.log("collectsByDate", index, totalHeuristics - index);
            // }

            const pastAndRemainingDays = [...pastDays, ...daysRemaining];

            const burnDownDays = {
                pastDays,
                daysRemaining,
                pastAndRemainingDays,
            };

            console.log("collectsByDate", burnDownDays);

            setData({
                allCollects,
                collectsByDate,
                people,
                collectsByPerson,
                amountByPerson,
                maxDateAmount,
                maxAmountForAPerson,
                totalHeuristics,
                dateArray,
                newestDate,
                yesterDay,
                burnDownDays,
                estimatedDaysToFinish,
            });
        };

        fetchData();
    }, [projectSlug, allCollectionsAmount]);

    return data;
}
