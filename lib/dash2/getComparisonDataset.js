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
        )?.scoreValue;
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
    let playerAverage;

    Object.keys(scoresObject).forEach((journey) => {
        const heuristicScore = scoresObject[journey].find(
            (score) => score.heuristic.heuristicNumber === heuristicNumber
        );
        scoresArray.push(heuristicScore?.scoreValue || null);
    });

    if (scoresArray.some((score) => score === null)) {
        playerAverage = scoresArray.find((score) => score !== null);
    } else {
        playerAverage =
            scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;
    }

    return playerAverage;
}

function getPlayerScoreValue(scoresObject, journey, heuristicNumber) {
    if (!scoresObject) {
        return null;
    }
    const playerScoreValue = scoresObject[journey].find(
        (score) => score.heuristic.heuristicNumber === heuristicNumber
    )?.scoreValue;

    return playerScoreValue;
}

/**
 *
 *
 * Begining of the getComparisonDataset function
 *
 */

function getComparisonDataset(
    currentProjectObj,
    previousProjectObj,
    selectedJourney,
    heuristicNumber,
    showPlayer
) {
    if (!currentProjectObj || !previousProjectObj || !showPlayer) {
        return;
    }

    const isRetail =
        currentProjectObj.slug.includes("retail") ||
        currentProjectObj.slug.includes("latam");

    const isOverlapJourneys =
        currentProjectObj.isOverlapJourneys !== null
            ? currentProjectObj.isOverlapJourneys
            : isRetail;
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

    const currentPlayerOfCurrentYear = currentYearPlayersFiltered.find(
        (player) => player.slug === showPlayer
    );

    const currentPlayerOfPreviousYear = previousYearPlayersFiltered.find(
        (player) => player.slug === showPlayer
    );

    let hasPreviousData = true;

    if (currentPlayerOfPreviousYear === undefined) {
        // return null;
        hasPreviousData = false;
    }

    const currentDepartmentSlug =
        currentPlayerOfCurrentYear.departmentObj.departmentSlug;

    // Finding the players with the current department slug

    const currentPlayerScoresObject = currentPlayerOfCurrentYear.scoresObject;
    const previousPlayerScoresObject = currentPlayerOfPreviousYear
        ? currentPlayerOfPreviousYear.scoresObject
        : null;

    // Para Retail, temos que calcular a média do setor.
    // Para os demais, é a média  de todos os players.

    // if (isRetail) {
    if (isOverlapJourneys) {
        const playersWithCurrentDepartmentInCurrentYear =
            currentYearPlayersFiltered.filter(
                (player) =>
                    player.departmentObj.departmentSlug ===
                    currentDepartmentSlug
            );

        const playersWithCurrentDepartmentInPreviousYear =
            previousYearPlayersFiltered.filter(
                (player) =>
                    player.departmentObj?.departmentSlug ===
                    currentDepartmentSlug
            );
        const comparisonObject = {
            currentYearScores: {
                year: currentProjectObj.year,
                playerScore: getPlayerAverageScore(
                    currentPlayerScoresObject,
                    false,
                    heuristicNumber
                ),
                averageScore: getAllPlayersAverageScore(
                    playersWithCurrentDepartmentInCurrentYear,
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
                    playersWithCurrentDepartmentInPreviousYear,
                    false,
                    heuristicNumber
                ),
            },
        };

        const previousAveradeScore = getAllPlayersAverageScore(
            previousYearPlayersFiltered,
            selectedJourney,
            heuristicNumber
        );

        if (isNaN(previousAveradeScore)) {
            return null;
        }
        // console.log(
        //     "currentProjectObj",
        //     getAllPlayersAverageScore(
        //         previousYearPlayersFiltered,
        //         selectedJourney,
        //         heuristicNumber
        //     )
        // );

        return comparisonObject;
    }

    if (!selectedJourney) {
        return;
    }

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
            playerScore:
                getPlayerScoreValue(
                    previousPlayerScoresObject,
                    selectedJourney,
                    heuristicNumber
                ) || 0,
            averageScore: hasPreviousData
                ? getAllPlayersAverageScore(
                      previousYearPlayersFiltered,
                      selectedJourney,
                      heuristicNumber
                  )
                : 0,
        },
    };

    console.log("currentProjectObj", comparisonObject);

    return comparisonObject;
}

export default getComparisonDataset;
