import React, { useEffect, useState, useMemo } from "react";
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

let projectObj = {};

function useProject(projectSlug, playerSlug, heuristicNumber) {
    // const [projectObj, setProjectObj] = useState({});

    const emptyProject = {
        projectName: null,
        projectSlug: null,
        projectCurrentYear: null,
        previousPlayerScoreAverage: null,
        previousDepartmentScoreAverage: null,
        previousAllPlayersScoreAverage: null,
        previousAllPlayersScoresFromHeuristic: null,
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
                    // setProjectObj(data.project);
                    projectObj = data.project;
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

    const departmentScores = projectObj?.previousScores.filter(
        (score) => score.department === playerScoresObj.department
    );

    if (!playerScoresObj) {
        return emptyProject;
    }

    const heuristicKeys = Object.keys(playerScoresObj)?.filter((key) => {
        // "scores.desktop.h_2.1.scoreValue": 2,

        if (
            key.includes("scores.") &&
            key.includes("h_" + heuristicNumber + ".scoreValue")
        ) {
            return true;
        }
    });

    const playerScoresFromHeuristic = heuristicKeys.map(
        (key) => playerScoresObj[key]
    );

    // const _departmentScoresFromHeuristic = departmentScores .map((key) =>
    //         projectObj?.previousScores.map((player) => {
    //             // Treating the scores with an empty string
    //             return Number(player[key]);
    //         })
    //     )
    //     .flatMap((score) => {
    //         return score;
    //     });

    // const allPlayersScoresObjFromHeuristic = heuristicKeys.map();

    const departmentScoresFromHeuristic = heuristicKeys
        .map((key) =>
            departmentScores.map((player) => {
                // Treating the scores with an empty string
                return Number(player[key]);
            })
        )
        .flatMap((score) => {
            return score;
        });

    const previousAllPlayersScoresFromHeuristic = heuristicKeys
        .map((key) =>
            projectObj?.previousScores.map((player) => {
                // Treating the scores with an empty string
                return {
                    playerScore: Number(player[key]),
                    playerSlug: player.slug,
                };
            })
        )
        .flatMap((score) => {
            return score;
        });

    // console.log("departmentScoresFromHeuristic", allPlayersScoresFromHeuristic);
    const previousPlayerScoreAverage =
        playerScoresFromHeuristic.reduce((acc, n) => {
            return acc + n;
        }, 0) / playerScoresFromHeuristic.length;

    const previousDepartmentScoreAverage = Number(
        (
            departmentScoresFromHeuristic.reduce((acc, n) => {
                return acc + n;
            }, 0) / departmentScoresFromHeuristic.length
        ).toFixed(2)
    );

    return {
        projectName: projectObj?.name,
        projectSlug: projectObj?.slug,
        projectCurrentYear: projectObj?.year,
        previousPlayerScoreAverage,
        previousDepartmentScoreAverage,
        previousAllPlayersScoresFromHeuristic,
    };
}
export default useProject;
