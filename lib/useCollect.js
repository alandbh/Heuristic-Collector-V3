import { useState, useEffect } from "react";

import { getPreviousDate, timestampToDateString, getUniqueItem } from "./utils";

export default function useCollect(projectSlug) {
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
            const people = getUniqueItem(peopleDuplicated, "name");
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

            setData({
                allCollects,
                collectsByDate,
                people,
                collectsByPerson,
                amountByPerson,
                dateArray,
                newestDate,
                yesterDay,
            });
        };

        fetchData();
    }, [projectSlug]);

    return data;
}