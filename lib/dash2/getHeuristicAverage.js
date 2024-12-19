function getHeuristicAverage(currentProjectObj, journey, heuristicNumber) {
    if (!currentProjectObj) {
        return;
    }

    /**
     *
     * For RETAIL projects, we need to get the average score for each player, for each journey
     *
     *
     */

    if (!journey) {
        const { players } = currentProjectObj;
        const playersWithScores = [];
        players.forEach((player) => {
            if (player.showInChart !== true && player.showInChart !== null) {
                return;
            }
            const scoreObj = {
                playerName: player.name,
                playerSlug: player.slug,
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

            scoreObj.average =
                scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;
            playersWithScores.push(scoreObj);
        });

        const allPlayersAverage = (
            playersWithScores.reduce((a, b) => a + b.average, 0) /
            playersWithScores.length
        ).toFixed(2);

        return { allPlayersAverage, dataset: playersWithScores };
    }

    /**
     *
     * For all other projects, we need to get the actual score for each heuristic individually.
     */
}

export default getHeuristicAverage;
