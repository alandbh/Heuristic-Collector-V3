import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "./apollo";

const QUERY_PROJECT_DATA = gql`
    query GetProjectData($projectSlug: String) {
        project(where: { slug: $projectSlug }) {
            name
            slug
            year
            previousScores
        }
    }
`;

export function useProject(projectSlug, playerSlug, heuristicNumber) {
    const [projectObj, setProjectObj] = useState({});

    const emptyProject = {
        projectName: null,
        projectSlug: null,
        projectCurrentYear: null,
        previousPlayerScoreAverage: null,
        previousAllPlayersScoreAverage: null,
    };

    /**
     *
     * Getting the Project data, including the previous scores
     *
     */

    useEffect(() => {
        if (projectSlug) {
            const variables = {
                projectSlug,
            };
            client
                .query({
                    query: QUERY_PROJECT_DATA,
                    variables,
                    fetchPolicy: "network-only",
                })
                .then(({ data }) => {
                    setProjectObj(data.project);
                });
        }
    }, [projectSlug]);

    if (
        !projectSlug ||
        !playerSlug ||
        !heuristicNumber ||
        !projectObj?.previousScores
    ) {
        return emptyProject;
    }

    const playerScoresObj = projectObj?.previousScores?.find(
        (scores) => scores.slug === playerSlug
    );

    console.log("bbb", projectObj);

    const heuristicKeys = Object.keys(playerScoresObj)?.filter((key) => {
        if (
            key.includes("scores.") &&
            key.includes(heuristicNumber) &&
            key.includes(".scoreValue")
        ) {
            return true;
        }
    });

    const playerScoresFromHeuristic = heuristicKeys.map(
        (key) => playerScoresObj[key]
    );

    const allPlayersScoresFromHeuristic = heuristicKeys
        .map((key) =>
            projectObj?.previousScores.map((player) => {
                // Treating the scores with an empty string
                return Number(player[key]);
            })
        )
        .flatMap((score) => {
            return score;
        });

    const previousPlayerScoreAverage =
        playerScoresFromHeuristic.reduce((acc, n) => {
            return acc + n;
        }, 0) / playerScoresFromHeuristic.length;

    const previousAllPlayersScoreAverage = Number(
        (
            allPlayersScoresFromHeuristic.reduce((acc, n) => {
                return acc + n;
            }, 0) / allPlayersScoresFromHeuristic.length
        ).toFixed(2)
    );

    // console.log("aaap", previousAllPlayersScoreAverage);

    return {
        projectName: projectObj?.name,
        projectSlug: projectObj?.slug,
        projectCurrentYear: projectObj?.year,
        previousPlayerScoreAverage,
        previousAllPlayersScoreAverage,
    };
}
