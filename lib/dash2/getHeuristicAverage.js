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

    const { players } = currentProjectObj;
    const playersWithScores = [];
    const departmentScores = {};
    const departmentAverage = {};
    const journeys = [];
    const departmentAverageByJourney = {};
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
            departmentAverageByJourney: {},
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
        if (
            !departmentAverageByJourney.hasOwnProperty(
                player.departmentObj.departmentSlug
            )
        ) {
            departmentAverageByJourney[player.departmentObj.departmentSlug] =
                null;
        }

        // if (isRetail) {
        if (isOverlapJourneys) {
            const scoresArray = [];

            Object.keys(player.scoresObject).forEach((journey) => {
                const heuristicScore = player.scoresObject[journey].find(
                    (score) =>
                        score.heuristic.heuristicNumber === heuristicNumber
                );
                scoreObj["score_" + journey] =
                    heuristicScore?.scoreValue || null;

                scoresArray.push(heuristicScore?.scoreValue || null);

                journeys.push({ journeySlug: journey });
            });

            // if (player.slug === "lego-denmark") {
            //     console.log("scoresArray", scoresArray);
            // }

            let averageScoreValue;

            if (scoresArray.some((i) => i !== null)) {
                averageScoreValue = scoresArray.includes(null)
                    ? scoresArray.find((score) => score !== null)
                    : Number(
                          (
                              scoresArray.reduce((a, b) => a + b, 0) /
                              scoresArray.length
                          ).toFixed(1)
                      );
            } else {
                averageScoreValue = 0;
            }

            // const averageScoreValue = scoresArray.includes(null)
            //     ? scoresArray.find((score) => score !== null)
            //     : Number(
            //           (
            //               scoresArray.reduce((a, b) => a + b, 0) /
            //               scoresArray.length
            //           ).toFixed(1)
            //       );

            scoreObj.value = Number(averageScoreValue);
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
        (player) =>
            player.value !== null &&
            player.value !== 0 &&
            player.value !== undefined
    );

    console.log("playersWithScores", playersWithScores);

    // const allPlayersAverage = Number(
    //     (
    //         nonZeroedPlayersWithScores.reduce((a, b) => a + b.value, 0) /
    //         nonZeroedPlayersWithScores.length
    //     ).toFixed(2)
    // );

    const sortedPlayers = organizePlayers(playersWithScores);

    console.log("sortedPlayers", sortedPlayers);

    const nonZeroedPlayers = sortedPlayers.filter((player) => player.value > 0);

    const allPlayersAverage = Number(
        Number(
            nonZeroedPlayers
                .filter((player) => player.value > 0)
                .reduce((a, b) => a + b.value, 0) / nonZeroedPlayers.length
        ).toFixed(2)
    );

    sortedPlayers.forEach((player) => {
        const departmentScores = player.departmentScores[
            player.departmentSlug
        ].filter((score) => score !== null && score !== 0);

        const departmentAverageValue =
            departmentScores.reduce((a, b) => a + b, 0) /
            departmentScores.length;
        departmentAverage[player.departmentSlug] = Number(
            Number(departmentAverageValue.toFixed(2))
        );
    });

    // console.log("sortedPlayers", sortedPlayers[0].departmentScores.department);

    sortedPlayers.forEach((player) => {
        player.departmentAverage = departmentAverage[player.departmentSlug];
    });

    // Calculating the average score by department and journey.
    // Check if it's Retail
    // Loop through journeys
    // if (isRetail) {
    if (isOverlapJourneys) {
        // Initialize department journey scores structure
        const departmentJourneyScores = {};
        const uniqueJourneys = [...new Set(journeys.map((j) => j.journeySlug))];

        // Initialize the structure for each department and journey
        Object.keys(departmentScores).forEach((deptSlug) => {
            departmentJourneyScores[deptSlug] = {};
            uniqueJourneys.forEach((journeySlug) => {
                departmentJourneyScores[deptSlug][journeySlug] = [];
            });
        });

        // Collect scores by department and journey
        nonZeroedPlayersWithScores.forEach((player) => {
            uniqueJourneys.forEach((journeySlug) => {
                const journeyScore = player[`score_${journeySlug}`];
                if (
                    journeyScore !== null &&
                    journeyScore !== undefined &&
                    journeyScore !== 0
                ) {
                    departmentJourneyScores[player.departmentSlug][
                        journeySlug
                    ].push(journeyScore);
                }
            });
        });

        // Calculate averages for each department and journey
        Object.keys(departmentJourneyScores).forEach((deptSlug) => {
            departmentAverageByJourney[deptSlug] = {};

            uniqueJourneys.forEach((journeySlug) => {
                const scores = departmentJourneyScores[deptSlug][journeySlug];
                if (scores.length > 0) {
                    const avg =
                        scores.reduce((a, b) => a + b, 0) / scores.length;
                    departmentAverageByJourney[deptSlug][journeySlug] = Number(
                        avg.toFixed(2)
                    );
                } else {
                    departmentAverageByJourney[deptSlug][journeySlug] = null;
                }
            });
        });

        // Add department journey averages to each player
        sortedPlayers.forEach((player) => {
            if (departmentAverageByJourney[player.departmentSlug]) {
                player.departmentAverageByJourney =
                    departmentAverageByJourney[player.departmentSlug];
            }
        });
    }

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
