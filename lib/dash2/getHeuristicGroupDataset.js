import { getUniqueItem } from "../utils";

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

function getPlayerAverageScore(scoresObject, heuristicNumber) {
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

/**
 *
 *
 * Begining of the getHeuristicGroupDataset function
 *
 */

function getHeuristicGroupDataset(currentProjectObj, heuristics, showPlayer) {
    if (!currentProjectObj || !showPlayer) {
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

    const currentPlayerOfCurrentYear = currentYearPlayers.find(
        (player) => player.slug === showPlayer
    );

    const currentDepartmentSlug =
        currentPlayerOfCurrentYear.departmentObj.departmentSlug;

    // Finding the players with the current department slug

    const currentPlayerScoresObject = currentPlayerOfCurrentYear.scoresObject;

    const allGroupsDuplicated = heuristics.map((heuristic) => heuristic.group);
    // Let's get the unique groups
    const groups = getUniqueItem(allGroupsDuplicated, "name");

    // CONTINUAR AQUI
    const groupScoresArray = [];
    groups.forEach((group) => {
        const groupScoresObj = {
            groupName: "",
            journeys: {},
        };

        groupScoresObj.groupName = group.name;

        const groupScores = Object.keys(currentPlayerScoresObject).map(
            (journey) => {
                groupScoresObj.journeys[journey] = currentPlayerScoresObject[
                    journey
                ].filter((score) => score.group.name === group.name);
            }
        );

        groupScoresArray.push(groupScoresObj);
    });

    console.log("groupDataset", groupScoresArray);

    // Para Retail, temos que calcular a média do setor.
    // Para os demais, é a média  de todos os players.

    // if (isRetail) {
    if (isOverlapJourneys) {
        const playersWithCurrentDepartmentInCurrentYear =
            currentYearPlayers.filter((player) => {
                if (player.departmentObj === null) {
                    // console.log("currentYearPlayers", player);
                    return;
                }
                return (
                    player.departmentObj.departmentSlug ===
                    currentDepartmentSlug
                );
            });

        // return comparisonObject;
    }

    // return comparisonObject;
}

export default getHeuristicGroupDataset;
