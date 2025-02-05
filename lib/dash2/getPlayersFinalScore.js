function getPlayersFinalScore(currentProjectObj, showPlayer) {
    if (!currentProjectObj) {
        return;
    }

    const { players } = currentProjectObj;
    const playersWithScores = [];
    console.log("players", players);
    players.forEach((player) => {
        if (player.showInChart !== true && player.showInChart !== null) {
            return;
        }
        // {
        //     "playerSlug": "mercado-livre",
        //     "label": "Mercado Livre",
        //     "department": "marketplace",
        //     "departmentOrder": 1,
        //     "total": 330,
        //     "max": 450,
        //     "value": 0.7333,
        //     "barColor": "color_0"
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
            max: 0,
            total: 0,
        };

        let max = 0;
        let total = 0;

        const scoresArray = [];

        Object.keys(player.scoresObject).forEach((journey) => {
            // Remove this condition if you want to show all journeys
            if (journey !== "desktop") {
                return;
            }
            const journeyScores = player.scoresObject[journey].filter(
                (score) => score.scoreValue > 0
            );

            console.log("journeyScores", journeyScores);

            const sumOfJourneyScores = journeyScores.reduce(
                (acc, score) => acc + score.scoreValue,
                0
            );

            max += journeyScores.length * 5;
            total += sumOfJourneyScores;
        });

        scoreObj.max = max;
        scoreObj.total = total;
        scoreObj.percentage = (total / max).toFixed(4);

        playersWithScores.push(scoreObj);
    });

    // Lets calculate the average percentage for all players
    const allPlayersTotal = playersWithScores.reduce(
        (acc, player) => acc + player.total,
        0
    );

    const allPlayersMax = playersWithScores.reduce(
        (acc, player) => acc + player.max,
        0
    );

    const allPlayersPercentage = Number(
        (allPlayersTotal / allPlayersMax).toFixed(4)
    );

    const sortedPlayers = organizePlayers(playersWithScores);

    return {
        allPlayersTotal,
        allPlayersMax,
        allPlayersPercentage,
        dataset: sortedPlayers,
    };

    /**
     *
     * For all other projects, we need to get the actual score for each heuristic individually.
     */
}

export default getPlayersFinalScore;

function organizePlayers(data) {
    // Sort by departmentOrder first, then by percentage
    return data.sort((a, b) => {
        // First compare departmentOrder
        if (a.departmentOrder !== b.departmentOrder) {
            return a.departmentOrder - b.departmentOrder;
        }
        // If same department, sort by percentage
        return b.percentage.localeCompare(a.percentage);
    });
}
