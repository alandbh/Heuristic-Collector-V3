// const allScores = JSON.parse(localStorage.allScores)
// const allJourneys = JSON.parse(localStorage.allJourneys)

import { sortCollection } from "./utils";

// console.log(allJourneysSlugs)

export default function useFinalScoresDataset(
    allScores,
    allJourneys,
    currentPlayer
) {
    if (!allScores || !allJourneys) {
        return null;
    }

    const allJourneysSlugs = allJourneys.map((journey) => journey.slug);

    const finalScores = allScores
        .filter(
            (player) =>
                player.showInChart === true || player.showInChart === null
        )
        .map((player) => {
            const playerScore = {
                playerSlug: player.slug,
                label: player.name,
                department: player.departmentObj?.departmentSlug,
                departmentOrder: player.departmentObj?.departmentOrder,
                total: 0,
                max: 0,
                value: 0,
                barColor: currentPlayer === player.slug ? "color_1" : "color_0",
            };
            allJourneysSlugs.map((journey) => {
                for (let heuristic in player.scores[journey]) {
                    if (heuristic.startsWith("h_")) {
                        playerScore.total =
                            playerScore.total +
                            player.scores[journey][heuristic].scoreValue;
                        playerScore.max = playerScore.max + 5;
                    }
                }
            });

            playerScore.value = Number(
                (playerScore.total / playerScore.max).toFixed(4)
            );

            return playerScore;
        });

    const sortedScores = sortCollection(finalScores, "value", false);
    const datasetWithSeparator = sortCollection(
        sortedScores,
        "departmentOrder"
    );
    // console.log("allScores", datasetWithSeparator);

    return datasetWithSeparator;
}
