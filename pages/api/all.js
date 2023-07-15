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
            department
            scoresObject
            finding {
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

export default async function handler(req, res) {
    const { project, journey, heuristic, showPlayer } = req.query;
    const allJourneys = await getData(QUERY_JOURNEYS, { projectSlug: project });
    const allPlayers = await getData(QUERY_ALL, { projectSlug: project });

    // console.log({ journey, heuristic });
    // console.log(allPlayers.data.players[0].finding);

    const newPlayerArr = allPlayers.data.players.map(
        ({
            id,
            name,
            slug,
            department,
            scoresObject,
            finding,
            ignored_journeys,
            zeroed_journeys,
        }) => {
            const playerOb = {};
            playerOb.id = id;
            playerOb.name = name;
            playerOb.slug = slug;
            playerOb.department = department;
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

    if (journey && heuristic) {
        let scores_by_heuristic = [];

        newPlayerArr.map((player) => {
            const scoreChartObj = {};
            scoreChartObj.label = player.name;
            scoreChartObj.playerSlug = player.slug;
            scoreChartObj.show_player = showPlayer === player.slug;

            if (!player.scores[journey]) {
                serve("Invalid Journey");
                return;
            }
            if (!player.scores[journey]["h_" + heuristic]) {
                serve("Invalid Heuristic");
                return;
            }

            let shouldConsiderThisPlayer = true;

            if (
                player.scores[journey].ignore_journey ||
                player.scores[journey].zeroed_journey
            ) {
                shouldConsiderThisPlayer = false;
                // return;
            }

            scoreChartObj.value = shouldConsiderThisPlayer
                ? player.scores[journey]["h_" + heuristic]["scoreValue"]
                : 0;

            scoreChartObj.valuePrev =
                player.scores[journey]["h_" + heuristic]["scoreValuePrev"] ||
                null;

            scoreChartObj.averageScoreValuePrev =
                player.scores[journey]["h_" + heuristic][
                    "averageScoreValuePrev"
                ] || null;

            scoreChartObj.ignore_journey =
                player.scores[journey].ignore_journey;
            scoreChartObj.zeroed_journey =
                player.scores[journey].zeroed_journey;

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
