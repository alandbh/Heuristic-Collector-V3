function getHeuristicAverage(
    currentProjectObj,
    selectedJourney,
    heuristicNumber,
    showPlayer
) {
    if (!currentProjectObj) {
        return;
    }

    const isRetail =
        currentProjectObj.slug.includes("retail") ||
        currentProjectObj.slug.includes("latam");
    // debugger;
    /**
     *
     * For RETAIL projects, we need to get the average score for each player, for each journey
     *
     *
     */

    const { players } = currentProjectObj;
    const playersWithScores = [];
    const departmentScores = {};
    const departmentAverage = {};
    players.forEach((player) => {
        if (player.showInChart !== true && player.showInChart !== null) {
            return;
        }

        if (player.departmentObj === null) {
            return;
        }

        // console.log("player.departmentObj", {
        //     player: player.name,
        //     dept: player.departmentObj,
        // });
        // debugger;
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

        if (
            !departmentScores.hasOwnProperty(
                player.departmentObj.departmentSlug
            )
        ) {
            departmentScores[player.departmentObj.departmentSlug] = [];
        }
        if (
            !departmentAverage.hasOwnProperty(
                player.departmentObj.departmentSlug
            )
        ) {
            departmentAverage[player.departmentObj.departmentSlug] = null;
        }

        if (isRetail) {
            const scoresArray = [];

            Object.keys(player.scoresObject).forEach((journey) => {
                const heuristicScore = player.scoresObject[journey].find(
                    (score) =>
                        score.heuristic.heuristicNumber === heuristicNumber
                );
                scoreObj["score_" + journey] =
                    heuristicScore?.scoreValue || null;
                scoresArray.push(heuristicScore?.scoreValue || null);
            });

            const averageScoreValue = scoresArray.includes(null)
                ? scoresArray.find((score) => score !== null)
                : scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;

            scoreObj.value = averageScoreValue;
            departmentScores[player.departmentObj.departmentSlug].push(
                averageScoreValue
            );
            scoreObj.departmentScores = departmentScores;
            // scoreObj.allJourneysScoreAverage = averageScoreValue;
        } else {
            scoreObj.value =
                player.scoresObject[selectedJourney]?.find(
                    (score) =>
                        score.heuristic.heuristicNumber === heuristicNumber
                )?.scoreValue || null;

            departmentScores[player.departmentObj.departmentSlug].push(
                scoreObj.value
            );

            scoreObj.departmentScores = departmentScores;
        }

        playersWithScores.push(scoreObj);
    });

    const nonZeroedPlayersWithScores = playersWithScores.filter(
        (player) => player.value !== null && player.value !== 0
    );

    console.log("nonZeroedPlayersWithScores", nonZeroedPlayersWithScores);

    const allPlayersAverage = Number(
        (
            nonZeroedPlayersWithScores.reduce((a, b) => a + b.value, 0) /
            nonZeroedPlayersWithScores.length
        ).toFixed(2)
    );

    const sortedPlayers = organizePlayers(playersWithScores);

    sortedPlayers.forEach((player) => {
        const departmentScores = player.departmentScores[
            player.departmentSlug
        ].filter((score) => score !== null && score !== 0);

        const departmentAverageValue =
            departmentScores.reduce((a, b) => a + b, 0) /
            departmentScores.length;
        departmentAverage[player.departmentSlug] = Number(
            departmentAverageValue.toFixed(2)
        );
    });

    sortedPlayers.forEach((player) => {
        player.departmentAverage = departmentAverage[player.departmentSlug];
    });

    return {
        allPlayersAverage,
        dataset: sortedPlayers,
        departmentAverage,
        // currentProjectObj,
    };

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
