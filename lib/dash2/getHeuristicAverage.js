function getHeuristicAverage(currentProjectObj, heuristicNumber, showPlayer) {
    if (!currentProjectObj) {
        return;
    }

    /**
     *
     * For RETAIL projects, we need to get the average score for each player, for each journey
     *
     *
     */

    if (currentProjectObj.slug.includes("retail")) {
        const { players } = currentProjectObj;
        const playersWithScores = [];
        players.forEach((player) => {
            if (player.showInChart !== true && player.showInChart !== null) {
                return;
            }
            // {
            //     "label": "Amazon",
            //     "departmentName": "Marketplace",
            //     "departmentSlug": "marketplace",
            //     "departmentOrder": 1,
            //     "playerSlug": "amazon",
            //     "showInChart": true,
            //     "show_player": true,
            //     "barColor": "color_1",
            //     "value": 5,
            //     "valuePrev": null,
            //     "averageScoreValuePrev": null,
            //     "ignore_journey": false,
            //     "zeroed_journey": false,
            //     "allJourneysScoreAverage": 5
            //   }
            const scoreObj = {
                playerName: player.name,
                playerSlug: player.slug,
                label: player.name,
                departmentName: player.departmentObj.departmentName,
                departmentSlug: player.departmentObj.departmentSlug,
                departmentOrder: player.departmentObj.departmentOrder,
                showInChart: true,
                show_player: player.slug === showPlayer,
                barColor: player.slug === showPlayer ? "color_1" : "color_0",
            };

            const scoresArray = [];

            Object.keys(player.scoresObject).forEach((journey) => {
                const heuristicScore = player.scoresObject[journey].find(
                    (score) =>
                        score.heuristic.heuristicNumber === heuristicNumber
                );
                scoreObj["score_" + journey] = heuristicScore?.scoreValue;
                scoresArray.push(heuristicScore?.scoreValue);
            });

            const averageScoreValue =
                scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;
            playersWithScores.push(scoreObj);

            scoreObj.value = averageScoreValue;
            // scoreObj.allJourneysScoreAverage = averageScoreValue;
        });

        const allPlayersAverage = (
            playersWithScores.reduce((a, b) => a + b.value, 0) /
            playersWithScores.length
        ).toFixed(2);

        const sortedPlayers = organizePlayers(playersWithScores);

        return {
            allPlayersAverage,
            dataset: sortedPlayers,
            currentProjectObj,
        };
    }

    /**
     *
     * For all other projects, we need to get the actual score for each heuristic individually.
     */
}

export default getHeuristicAverage;

function organizePlayers(data) {
    // Sort by departmentOrder first, then by playerName
    return data.sort((a, b) => {
        // First compare departmentOrder
        if (a.departmentOrder !== b.departmentOrder) {
            return a.departmentOrder - b.departmentOrder;
        }
        // If same department, sort by playerName
        return a.playerName.localeCompare(b.playerName);
    });
}
