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
    const { project } = req.query;
    const allJourneys = await getData(QUERY_JOURNEYS, { projectSlug: project });
    const allPlayers = await getData(QUERY_ALL, { projectSlug: project });

    console.log(project);
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
        }) => {
            const playerOb = {};
            playerOb.id = id;
            playerOb.name = name;
            playerOb.slug = slug;
            playerOb.department = department;
            playerOb.scores = {};
            playerOb.ignored_journeys = [];

            if (scoresObject === null) {
                return;
            }

            ignored_journeys.map((journey) => {
                playerOb.ignored_journeys.push(journey.slug);
            });

            // const journeys = {};

            // const scores = JSON.parse(scoresObject);

            allJourneys.data.journeys.map((jou) => {
                playerOb.scores[jou.slug] = {};
                scoresObject[jou.slug]?.map((score) => {
                    playerOb.scores[jou.slug][
                        "h_" + score.heuristic.heuristicNumber
                    ] = {
                        scoreValue: score.scoreValue,
                        note: score.note,
                        evidenceUrl: score.evidenceUrl,
                    };
                });
            });

            // allJourneys.data.journeys.map((jou) => {
            //     journeys[jou.slug] = {};

            //     // const scoresByJourney = scores
            //     //     .filter((score) => {
            //     //         return score.journey.slug === jou.slug;
            //     //     })
            //     //     .map((score) => {
            //     //         return {
            //     //             journey: score.journey.slug,
            //     //             heuristic: "h_" + score.heuristic.heuristicNumber,
            //     //             scoreValue: score.scoreValue,
            //     //             note: score.note,
            //     //             evidenceUrl: score.evidenceUrl,
            //     //         };
            //     //     });

            //     // scoresByJourney.sort((a, b) => {
            //     //     const nameA = a.heuristic.toUpperCase(); // ignore upper and lowercase
            //     //     const nameB = b.heuristic.toUpperCase(); // ignore upper and lowercase
            //     //     if (nameA < nameB) {
            //     //         return -1;
            //     //     }
            //     //     if (nameA > nameB) {
            //     //         return 1;
            //     //     }

            //     //     // names must be equal
            //     //     return 0;
            //     // });

            //     // scoresByJourney.map((score) => {
            //     //     journeys[jou.slug][score.heuristic] = {};
            //     //     journeys[jou.slug][score.heuristic].scoreValue =
            //     //         score.scoreValue;
            //     //     journeys[jou.slug][score.heuristic].note = score.note;
            //     //     journeys[jou.slug][score.heuristic].evidenceUrl =
            //     //         score.evidenceUrl;
            //     // });

            //     playerOb.scores = JSON.parse(scoresObject);
            // });
            // playerOb.scores = scoresObject;

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
    serve(newPlayerArr);
    // serve(allPlayers);

    function serve(data) {
        res.status(200).json(data);
    }
}
