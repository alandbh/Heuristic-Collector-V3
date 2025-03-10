function getAllPlayersAverageScore(players, journey, heuristicNumber) {
    if (!journey) {
        const allPlayersAverage = [];
        players.forEach((player) => {
            const playerAverage = getPlayerAverageScore(
                player.scoresObject,
                false,
                heuristicNumber
            );

            if (playerAverage) {
                allPlayersAverage.push(playerAverage);
            }
        });

        const overallAverage =
            allPlayersAverage.reduce((a, b) => a + b, 0) /
            allPlayersAverage.length;

        return overallAverage;
    }

    const scoresArray = [];

    players.forEach((player) => {
        const playerScore = player.scoresObject[journey].find(
            (score) => score.heuristic.heuristicNumber === heuristicNumber
        ).scoreValue;
        if (playerScore > 0) {
            scoresArray.push(playerScore);
        }
    });

    const overallAverage =
        scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;

    return overallAverage;
}

function getPlayerAverageScore(scoresObject, journey, heuristicNumber) {
    const scoresArray = [];
    Object.keys(scoresObject).forEach((journey) => {
        const heuristicScore = scoresObject[journey].find(
            (score) => score.heuristic.heuristicNumber === heuristicNumber
        );
        scoresArray.push(heuristicScore?.scoreValue || null);
    });

    const playerAverage =
        scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;

    return playerAverage;
}

function getPlayerScoreValue(scoresObject, journey, heuristicNumber) {
    const playerScoreValue = scoresObject[journey].find(
        (score) => score.heuristic.heuristicNumber === heuristicNumber
    )?.scoreValue;

    return playerScoreValue;
}

function getComparisonDataset(
    currentProjectObj,
    previousProjectObj,
    selectedJourney,
    heuristicNumber,
    showPlayer,
    departmentAverage
) {
    if (
        !currentProjectObj ||
        !previousProjectObj ||
        !showPlayer ||
        !departmentAverage
    ) {
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

    const { players: currentYearPlayers } = currentProjectObj;
    const { players: previousYearPlayers } = previousProjectObj;

    const currentYearPlayersFiltered = currentYearPlayers.filter(
        (player) => player.showInChart || player.showInChart === null
    );

    const previousYearPlayersFiltered = previousYearPlayers.filter(
        (player) => player.showInChart || player.showInChart === null
    );

    const currentPlayerScoresObject = currentYearPlayersFiltered.find(
        (player) => player.slug === showPlayer
    ).scoresObject;
    const previousPlayerScoresObject = previousYearPlayersFiltered.find(
        (player) => player.slug === showPlayer
    ).scoresObject;

    // console.log(
    //     "currentProjectObj",
    //     getAllPlayersAverageScore(previousYearPlayersFiltered, heuristicNumber)
    // );

    // Para Retail, temos que calcular a média do setor.
    // Para os demais, é a média  de todos os jogadores.

    if (isRetail) {
        const comparisonObject = {
            currentYearScores: {
                year: currentProjectObj.year,
                playerScore: getPlayerAverageScore(
                    currentPlayerScoresObject,
                    false,
                    heuristicNumber
                ),
                averageScore: getAllPlayersAverageScore(
                    currentYearPlayersFiltered,
                    false,
                    heuristicNumber
                ),
            },
            previousYearScores: {
                year: previousProjectObj.year,
                playerScore: getPlayerAverageScore(
                    previousPlayerScoresObject,
                    false,
                    heuristicNumber
                ),
                averageScore: getAllPlayersAverageScore(
                    previousYearPlayersFiltered,
                    false,
                    heuristicNumber
                ),
            },
        };
        console.log("currentProjectObj", currentYearPlayers);

        return comparisonObject;
    }

    // {
    //     "currentYearScores": {
    //       "year": 2023,
    //       "playerScore": 3.5,
    //       "averageScore": 3.28
    //     },
    //     "previousYearScores": {
    //       "year": 2022,
    //       "playerScore": 3,
    //       "averageScore": 2.63
    //     }
    //   }

    const comparisonObject = {
        currentYearScores: {
            year: currentProjectObj.year,
            playerScore: getPlayerScoreValue(
                currentPlayerScoresObject,
                selectedJourney,
                heuristicNumber
            ),
            averageScore: getAllPlayersAverageScore(
                currentYearPlayersFiltered,
                selectedJourney,
                heuristicNumber
            ),
        },
        previousYearScores: {
            year: previousProjectObj.year,
            playerScore: getPlayerScoreValue(
                previousPlayerScoresObject,
                selectedJourney,
                heuristicNumber
            ),
            averageScore: getAllPlayersAverageScore(
                previousYearPlayersFiltered,
                selectedJourney,
                heuristicNumber
            ),
        },
    };

    return comparisonObject;
}

export default getComparisonDataset;
