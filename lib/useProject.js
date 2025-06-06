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

    if (!playerScoresObj) {
        return emptyProject;
    }

    const currentPlayerDepartment = playerScoresObj.department
        ? playerScoresObj.department.toLowerCase().trim()
        : playerScoresObj["departmentObj.departmentSlug"];

    const currentDepartmentScores = playerScoresObj.department
        ? projectObj?.previousScores.filter(
              (score) =>
                  score.department.toLowerCase() === currentPlayerDepartment
          )
        : projectObj?.previousScores.filter(
              (score) =>
                  score["departmentObj.departmentSlug"] ===
                  currentPlayerDepartment
          );

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

    const departmentPlayersScoresFromHeuristic = heuristicKeys
        .map((key) =>
            currentDepartmentScores.map((player) => {
                // Treating the scores with an empty string
                return Number(player[key]);
            })
        )
        .flatMap((score) => {
            return score;
        });

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

    const previousDepartmentPlayersScoreAverage = Number(
        (
            departmentPlayersScoresFromHeuristic.reduce((acc, n) => {
                return acc + n;
            }, 0) / departmentPlayersScoresFromHeuristic.length
        ).toFixed(2)
    );
    const previousAllPlayersScoreAverage = Number(
        (
            allPlayersScoresFromHeuristic.reduce((acc, n) => {
                return acc + n;
            }, 0) / allPlayersScoresFromHeuristic.length
        ).toFixed(2)
    );

    return {
        projectName: projectObj?.name,
        projectSlug: projectObj?.slug,
        projectCurrentYear: projectObj?.year,
        previousPlayerScoreAverage,
        previousAllPlayersScoreAverage,
        previousDepartmentPlayersScoreAverage,
    };
}
