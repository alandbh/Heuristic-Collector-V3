import { useState, useEffect } from "react";

import { getUniqueItem } from "./utils";

// Função para formatar a data no formato yyyymmdd
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // +1 porque os meses em JavaScript vão de 0 a 11
    const year = date.getFullYear();
    return `${year}${month}${day}`;
};

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
                        const colect = scoreObj.updates.pop();
                        colect.id = scoreObj.id;
                        const dateKey = formatDate(colect.dateTime);

                        colect.date = dateKey;

                        if (!dateObj[dateKey]) {
                            dateObj[dateKey] = [];
                        }

                        dateObj[dateKey].push(colect);
                    });
                });
            });

            const dateArray = Object.keys(dateObj);
            const newestDate = Math.max(...dateArray);
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
                dateArray,
                newestDate,
            });
        };

        fetchData();
    }, [projectSlug]);

    return data;
}
