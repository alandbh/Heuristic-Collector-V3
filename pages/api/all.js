// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, useMutation } from "@apollo/client";
import client from "../../lib/apollo";
import clientFast from "../../lib/apollo-fast";

async function getData(query, variables) {
    let queryString = variables
        ? {
              query: query,
              variables,
              fetchPolicy: "network-only",
          }
        : {
              query: query,
              fetchPolicy: "network-only",
          };

    let result = await clientFast.query(queryString);

    return result;
}

const QUERY_ALL = gql`
    query getAllPlayers($projectSlug: String) {
        players(where: { project: { slug: $projectSlug } }, first: 10000) {
            id
            name
            slug
            departmentObj {
                departmentName
                departmentSlug
                departmentOrder
            }
            scoresObject
            finding(first: 10000) {
                journey {
                    slug
                }
                findingObject
            }
            ignored_journeys {
                slug
                name
            }
            zeroed_journeys {
                slug
                name
            }
        }
    }
`;

const QUERY_JOURNEYS = gql`
    query getAllJourneys($projectSlug: String) {
        journeys(where: { project: { slug: $projectSlug } }) {
            name
            slug
        }
    }
`;
const QUERY_PROJECTS = gql`
    query GetProjectBySlug($projectSlug: String) {
        project(where: { slug: $projectSlug }) {
            id
            name
            slug
            year
            public
            collectorsApiKey
        }
    }
`;

// scores": {
//     "mobile": {
//       "h_1_1": {
//         "score": 5,
//         "note": "Easy navigation"
//       },
//       "h_1_2": {
//         "score": "5",
//         "note": "n/a"
//       },

function average(array) {
    return array.reduce((x, y) => x + y) / array.length;
}

export default async function handler(req, res) {
    const { project, journey, heuristic, showPlayer, showManyPlayers } =
        req.query;
    const projectObj = await getData(QUERY_PROJECTS, { projectSlug: project });
    const projectApiKey = projectObj.data.project.collectorsApiKey;
    if (req.headers["sec-fetch-site"] !== "same-origin") {
        if (req.headers.api_key !== projectApiKey) {
            res.status(401).send("Send a valid API key");
        }
    }
    const allJourneys = await getData(QUERY_JOURNEYS, { projectSlug: project });
    const allPlayers = await getData(QUERY_ALL, { projectSlug: project });

    //console.log("REQUISICAO", req.headers["sec-fetch-site"]);
    // console.log(allPlayers.data.players[0].finding);

    const newPlayerArr = allPlayers.data.players.map(
        ({
            id,
            name,
            slug,
            departmentObj,
            scoresObject,
            finding,
            ignored_journeys,
            zeroed_journeys,
        }) => {
            const playerOb = {};
            playerOb.id = id;
            playerOb.name = name;
            playerOb.slug = slug;
            playerOb.departmentObj = departmentObj;
            playerOb.scores = {};
            playerOb.ignored_journeys = [];
            playerOb.zeroed_journeys = [];

            if (scoresObject === null) {
                return;
            }

            const ignoredJourneysSlugs = ignored_journeys.map(
                (journey) => journey.slug
            );

            ignored_journeys.map((journey) => {
                playerOb.ignored_journeys.push({
                    name: journey.name,
                    slug: journey.slug,
                });
            });
            const zeroedJourneysSlugs = zeroed_journeys.map(
                (journey) => journey.slug
            );

            zeroed_journeys.map((journey) => {
                playerOb.zeroed_journeys.push({
                    name: journey.name,
                    slug: journey.slug,
                });
            });

            // const journeys = {};

            // const scores = JSON.parse(scoresObject);

            allJourneys.data.journeys.map((jou) => {
                playerOb.scores[jou.slug] = {};
                scoresObject[jou.slug]?.map((score) => {
                    playerOb.scores[jou.slug].ignore_journey =
                        ignoredJourneysSlugs.includes(jou.slug);
                    playerOb.scores[jou.slug].zeroed_journey =
                        zeroedJourneysSlugs.includes(jou.slug);
                    playerOb.scores[jou.slug][
                        "h_" + score.heuristic.heuristicNumber
                    ] = {
                        scoreValue: score.scoreValue,
                        scoreValuePrev: score.scoreValuePrev,
                        averageScoreValuePrev: score.averageScoreValuePrev,
                        note: score.note,
                        evidenceUrl: score.evidenceUrl,
                    };
                });
            });

            playerOb.findings = {};

            const allFindings = finding.map((item) => {
                let findingObj = {};
                // findingObj = item.findingObject
                findingObj = {
                    ...item.findingObject,
                    journey: item.journey.slug,
                };

                return findingObj;
            });

            allJourneys.data.journeys.map((journey) => {
                const findingsArr = allFindings.filter(
                    (finding) => finding.journey === journey.slug
                );

                playerOb.findings[journey.slug] = {};

                findingsArr.map((finding, index) => {
                    playerOb.findings[journey.slug][`f_${index + 1}`] = {
                        text: finding.text,
                        theType: finding.theType,
                    };
                });
            });

            return playerOb;
        }
    );

    if (journey && heuristic && allJourneys) {
        let scores_by_heuristic = [];

        const selectedJourney = journey;
        const selectedHeuristic = heuristic;

        newPlayerArr.map((player) => {
            const scoreChartObj = {};
            scoreChartObj.label = player.name;
            if (player.departmentObj) {
                scoreChartObj.departmentName =
                    player.departmentObj.departmentName;
                scoreChartObj.departmentSlug =
                    player.departmentObj.departmentSlug;
                scoreChartObj.departmentOrder =
                    player.departmentObj.departmentOrder;
            } else {
                scoreChartObj.departmentName = null;
                scoreChartObj.departmentSlug = null;
                scoreChartObj.departmentOrder = null;
            }
            scoreChartObj.playerSlug = player.slug;
            scoreChartObj.show_player = showPlayer === player.slug;

            const manyPlayersArr = showManyPlayers.split(",");

            if (showManyPlayers && showManyPlayers.includes(player.slug)) {
                scoreChartObj.show_player = true;
                scoreChartObj.barColor =
                    "color_" + Number(manyPlayersArr.indexOf(player.slug) + 1);
            } else {
                scoreChartObj.barColor =
                    showPlayer === player.slug ? "color_1" : "color_0";
            }

            // scoreChartObj.barColor =
            //     showPlayer === player.slug ? "color_1" : "color_0";

            if (!player.scores[selectedJourney]) {
                // serve({ error: "Invalid Journey" });
                return;
            }
            if (!player.scores[selectedJourney]["h_" + selectedHeuristic]) {
                // serve({ error: "Invalid Heuristic" });
                return;
            }

            let shouldConsiderThisPlayer = true;

            if (
                player.scores[selectedJourney].ignore_journey ||
                player.scores[selectedJourney].zeroed_journey
            ) {
                shouldConsiderThisPlayer = false;
                // return;
            }

            scoreChartObj.value = shouldConsiderThisPlayer
                ? player.scores[selectedJourney]["h_" + selectedHeuristic][
                      "scoreValue"
                  ]
                : 0;

            scoreChartObj.valuePrev =
                player.scores[selectedJourney]["h_" + selectedHeuristic][
                    "scoreValuePrev"
                ] || null;

            scoreChartObj.averageScoreValuePrev =
                player.scores[selectedJourney]["h_" + selectedHeuristic][
                    "averageScoreValuePrev"
                ] || null;

            scoreChartObj.ignore_journey =
                player.scores[selectedJourney].ignore_journey;
            scoreChartObj.zeroed_journey =
                player.scores[selectedJourney].zeroed_journey;

            const scoresArray =
                allJourneys.data.journeys.length > 0
                    ? allJourneys.data.journeys.map((journey) => {
                          if (shouldConsiderThisPlayer) {
                              return player.scores[journey.slug][
                                  "h_" + selectedHeuristic
                              ]?.scoreValue;
                          }
                      })
                    : null;
            // removing the null from the array
            const cleanScoresArray = scoresArray.filter((x) => x != null);
            scoreChartObj.allJourneysScoreAverage =
                cleanScoresArray.length > 0 ? average(cleanScoresArray) : null;

            scores_by_heuristic.push(scoreChartObj);
        });

        const nonZeroedScores = scores_by_heuristic.filter((score) => {
            return score.value > 0 && score.ignore_journey !== true;
        });
        const validScoresPrev = scores_by_heuristic.filter((score) => {
            return score.valuePrev !== null;
        });
        const average_score = Number(
            (
                nonZeroedScores
                    .map((score) => score.value)
                    .reduce((acc, n) => {
                        return acc + n;
                    }, 0) / nonZeroedScores.length
            ).toFixed(2)
        );
        const average_score_prev = Number(
            (
                validScoresPrev
                    .map((score) => score.valuePrev)
                    .reduce((acc, n) => {
                        return acc + n;
                    }, 0) / validScoresPrev.length
            ).toFixed(2)
        );

        scores_by_heuristic.sort((a, b) => {
            if (a.playerSlug < b.playerSlug) {
                return -1;
            }
            if (a.playerSlug > b.playerSlug) {
                return 1;
            }

            return 0;
        });

        scores_by_heuristic.sort((a, b) => {
            if (a.departmentOrder < b.departmentOrder) {
                return -1;
            }
            if (a.departmentOrder > b.departmentOrder) {
                return 1;
            }

            return 0;
        });

        serve({
            journey,
            heuristic,
            average_score,
            average_score_prev,
            scores_by_heuristic,
        });
    } else {
        serve(newPlayerArr);
    }
    // serve(allPlayers);

    function serve(data) {
        res.status(200).json(data);
    }
}
