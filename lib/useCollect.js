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

function getPreviousDate(dateString) {
    // Extrai o ano, mês e dia da string
    const year = parseInt(dateString.substring(0, 4), 10);
    const month = parseInt(dateString.substring(4, 6), 10) - 1; // Mês começa em 0 no objeto Date
    const day = parseInt(dateString.substring(6, 8), 10);

    // Cria o objeto Date
    const date = new Date(year, month, day);

    // Subtrai um dia
    date.setDate(date.getDate() - 1);

    // Formata de volta para yyyymmdd
    const previousYear = date.getFullYear();
    const previousMonth = String(date.getMonth() + 1).padStart(2, "0"); // Adiciona 1 porque o mês começa em 0
    const previousDay = String(date.getDate()).padStart(2, "0");

    return String(`${previousYear}${previousMonth}${previousDay}`);
}

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
                            const dateKey = formatDate(colect.dateTime);

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

            // const newestDate = "20240404";
            const yesterDay = getPreviousDate(newestDate);
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
