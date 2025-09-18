import { useState, useEffect } from "react";

import {
    timestampToDateString,
    getUniqueItem,
    sortCollection,
    getPreviousDate,
    calculateDateDifferenceInDays,
    calculateBusinessDays,
} from "./utils";

export default function useCollect(
    projectSlug,
    allCollectionsAmount,
    projectData
) {
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
                        // console.log("scoreObj", scoreObj);
                        if (!scoreObj.selectedFiles) {
                            return;
                        }
                        if (
                            scoreObj.updates &&
                            (scoreObj.evidenceUrl || scoreObj.selectedFiles.length > 0) &&
                            scoreObj.note &&
                            scoreObj.scoreValue
                        ) {
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

            const newestDate = String(Math.max(...dateArray));
            // const newestDate = String(Math.max(...fakeDateArray)); // fake
            const secondMax = Math.max(
                ...fakeDateArray.filter(
                    (num) => Number(num) !== Number(newestDate)
                )
            );

            // const newestDate = "20240404";
            // const yesterDay = String(secondMax); //Fake

            const yesterDay = getPreviousDate(newestDate);
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

            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Adiciona 1 ao mês (começa de 0) e padStart para garantir 2 dígitos
            const day = today.getDate().toString().padStart(2, "0"); // padStart para garantir 2 dígitos

            const currentDate = `${year}${month}${day}`;

            // console.log("projectData", projectData);

            // const startDate = "20240815";
            const startDate =
                String(projectData?.startDate) || String(20231114);
            const passedDays = calculateDateDifferenceInDays(
                String(currentDate),
                String(startDate)
            );
            const businessDaysCount = calculateBusinessDays(
                String(currentDate),
                String(startDate)
            );
            const daysOff = passedDays - businessDaysCount;
            const estimatedDaysToFinish =
                projectData?.estimatedDaysToFinish || 24;
            // const daysOff = 6; // Póa carnaval

            // const totalHeuristics = allCollectionsAmount + allCollects.length; // Fake. It should be just allCollectionsAmount
            const totalHeuristics = allCollectionsAmount;
            const collectionsSoFar = allCollects.length;
            const workedDays = Object.keys(collectsByDate).length - daysOff;
            const allCollectsUntilYesterday = allCollects.filter(
                (collect) => collect.date <= yesterDay
            ).length;
            const averageCollectionsADay = Math.round(
                allCollectsUntilYesterday / Math.max(1, workedDays - 1) // Worked days until yesterday
            );
            console.log("collectionsSoFar", workedDays);

            const pastDays = [];
            const daysRemaining = [];

            let pastCollectionsRemaining = totalHeuristics;

            for (const date in collectsByDate) {
                if (date >= startDate) {
                    pastDays.push({
                        color: 1,
                        amount: pastCollectionsRemaining,
                    });
                    pastCollectionsRemaining -= collectsByDate[date].length;
                }
            }

            let futureCollectionsRemaining;

            if (collectionsSoFar === 0) {
                futureCollectionsRemaining = totalHeuristics;
            } else {
                futureCollectionsRemaining =
                    pastDays[pastDays.length - 1]?.amount || 0;
            }
            
            // Ensure futureCollectionsRemaining is a valid positive number
            futureCollectionsRemaining = Math.max(0, futureCollectionsRemaining || 0);
            // O trecho abaixo corrige o out-of-memory
            // Add safety check to prevent division by zero and infinite loops
            const safeAverageCollectionsADay = Math.max(1, averageCollectionsADay);
            const maxIterations = Math.min(
                Math.ceil(futureCollectionsRemaining / safeAverageCollectionsADay),
                1000 // Cap at 1000 iterations to prevent memory issues
            );
            
            for (let i = 0; i < maxIterations; i++) {
                const remainingAmount =
                    futureCollectionsRemaining -
                    safeAverageCollectionsADay * (i + 1);
                
                // Only push if remaining amount is positive to avoid unnecessary iterations
                if (remainingAmount <= 0) {
                    break;
                }
                
                daysRemaining.push({
                    color: 2,
                    amount: Math.max(0, remainingAmount),
                });
            }

            // O trecho abaixo dá out-of-memory
            // for (
            //     let index = averageCollectionsADay;
            //     index <= futureCollectionsRemaining;
            //     index += averageCollectionsADay
            // ) {
            //     // futureCollectionsRemaining -= averageCollectionsADay;
            //     daysRemaining.push({
            //         color: 2,
            //         amount: futureCollectionsRemaining - index,
            //     });
            // }

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
            // console.log("collectsByDate yesterDay", yesterDay);
            // console.log("collectsByDate ", collectsByDate);

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
    }, [projectSlug, allCollectionsAmount, projectData]);

    return data;
}
