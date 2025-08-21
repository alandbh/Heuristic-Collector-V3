export default async function handler(req, res) {
    const { project: projectSlug } = req.query;

    if (!projectSlug) {
        return res.status(400).json({ error: "Project slug is required." });
    }
    const journeyWeb = projectSlug === "retail-emea-1" ? "web-site" : "desktop";
    const journeyApp =
        projectSlug === "retail-emea-1" ? "mobile-app" : "mobile";

    const headers =
        projectSlug === "retail-emea-1"
            ? { api_key: "20rga25" }
            : { api_key: "20rga24" };

    const apiUrl = `https://heuristic-v4.vercel.app/api/all?project=${projectSlug}`;

    // ✅ Hardcoded sibling players
    const siblingMap = {
        "galaxus-switzerland": ["migros-switzerland"],
        "interdiscount-switzerland": ["jumbo-switzerland", "coop-switzerland"],
        "gucci-france": ["ysl-france"],
        "dior-france": ["louisvuitton-france", "sephora-france"],
        "auchan-france": ["chronodrive-france"],
    };

    try {
        const response = await fetch(apiUrl, { headers });
        const rawData = await response.json();

        const allHeuristics = new Set();
        const playersByDepartment = {};

        // Mapear heurísticas e players por departamento
        rawData.forEach((player) => {
            const dept = player.departmentObj?.departmentSlug;
            if (!playersByDepartment[dept]) playersByDepartment[dept] = [];
            playersByDepartment[dept].push(player);

            for (const journey of [journeyWeb, journeyApp]) {
                const scores = player.scores?.[journey] || {};
                for (const h of Object.keys(scores)) {
                    if (h.startsWith("h_")) allHeuristics.add(h);
                }
            }
        });

        const getScore = (player, journey, heuristic) => {
            return player.scores?.[journey]?.[heuristic]?.scoreValue ?? null;
        };

        const calculateAverages = (players, journey, heuristic) => {
            const values = players
                .map((p) => getScore(p, journey, heuristic))
                .filter((v) => typeof v === "number" && v > 0);
            if (values.length === 0) return null;
            return parseFloat(
                (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
            );
        };

        const calculateGeneralAverage = (players, heuristic) => {
            const values = players
                .map((p) => {
                    const web = getScore(p, journeyWeb, heuristic);
                    const app = getScore(p, journeyApp, heuristic);
                    const valid = [web, app].filter(
                        (v) => typeof v === "number" && v > 0
                    );
                    if (valid.length === 0) return null;
                    return valid.reduce((a, b) => a + b, 0) / valid.length;
                })
                .filter((v) => v !== null);

            if (values.length === 0) return null;
            return parseFloat(
                (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
            );
        };

        const result = {
            players: rawData.map((player) => {
                const dept = player.departmentObj?.departmentSlug;
                const siblings = siblingMap[player.slug] || null;

                const slides = [...allHeuristics].map((h) => {
                    const web = getScore(player, journeyWeb, h);
                    const app = getScore(player, journeyApp, h);

                    const validScores = [web, app].filter(
                        (v) => typeof v === "number" && v > 0
                    );
                    const playerAvg = validScores.length
                        ? validScores.reduce((a, b) => a + b, 0) /
                          validScores.length
                        : null;

                    const webAvg = calculateAverages(
                        playersByDepartment[dept],
                        journeyWeb,
                        h
                    );
                    const appAvg = calculateAverages(
                        playersByDepartment[dept],
                        journeyApp,
                        h
                    );
                    const generalAvg = calculateGeneralAverage(rawData, h);

                    return {
                        slideId: h,
                        heuristicBarChart: `https://us-central1-get-chart-api.cloudfunctions.net/generateChartImage?project=${projectSlug}&heuristic=${h.replace(
                            "h_",
                            ""
                        )}&showManyPlayers=${[
                            player.slug,
                            ...(siblings || []),
                        ].join("|")}`,
                        slideValues: {
                            "web-siteValue":
                                web > 0
                                    ? web.toFixed(1).replace(".", ",")
                                    : null,
                            "mobile-appValue":
                                app > 0
                                    ? app.toFixed(1).replace(".", ",")
                                    : null,
                            playerAverage:
                                playerAvg !== null
                                    ? parseFloat(playerAvg)
                                          .toFixed(1)
                                          .replace(".", ",")
                                    : null,
                            "web-siteAverage":
                                webAvg !== null
                                    ? webAvg.toFixed(1).replace(".", ",")
                                    : null,
                            "mobile-appAverage":
                                appAvg !== null
                                    ? appAvg.toFixed(1).replace(".", ",")
                                    : null,
                            generalAverage:
                                generalAvg !== null
                                    ? generalAvg.toFixed(1).replace(".", ",")
                                    : null,
                        },
                    };
                });

                return {
                    playerSlug: player.slug,
                    playerName: player.name,
                    siblingPlayers: siblings,
                    slides,
                };
            }),
        };

        res.status(200).json(result);
    } catch (err) {
        console.error("Erro na API:", err);
        res.status(500).json({ error: "Erro ao processar dados." });
    }
}
