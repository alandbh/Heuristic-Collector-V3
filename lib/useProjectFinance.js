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
            previousProjectSlug
        }
    }
`;
const QUERY_PREVIOUS_PLAYER_SCORES = gql`
    query GetPreviousPlayerScores($projectSlug: String, $playerSlug: String) {
        players(
            where: {
                project: { slug: $projectSlug }
                AND: { slug: $playerSlug }
            }
        ) {
            name
            slug
            scoresObject
        }
    }
`;

export function useProjectFinance(
    projectSlug,
    playerSlug,
    currentJourney,
    heuristicNumber
) {
    const [projectObj, setProjectObj] = useState(null);
    const [previousScoresObj, setPreviousScoresObj] = useState(null);
    const [previousProjectSlug, setPreviousProjectSlug] = useState(null);
    const [previousAllPlayersScores, setPreviousAllPlayersScores] =
        useState(null);
    const [allPlayersScores, setAllPlayersScores] = useState(null);

    const emptyProject = {
        _projectName: null,
        _projectSlug: null,
        _projectCurrentYear: null,
        _previousProjectSlug: null,
        _previousPlayerScore: null,
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
                    setPreviousProjectSlug(data.project.previousProjectSlug);
                });
        }
    }, [projectSlug]);

    // useEffect(() => {
    //     if (projectObj && projectObj.previousProjectSlug) {
    //         const variables = {
    //             projectSlug: projectObj.previousProjectSlug,
    //             playerSlug,
    //         };

    //         client
    //             .query({
    //                 query: QUERY_PREVIOUS_PLAYER_SCORES,
    //                 variables,
    //                 fetchPolicy: "network-only",
    //             })
    //             .then(({ data }) => {
    //                 setPreviousScoresObj(data.players[0].scoresObject);

    //                 // setPreviousProjectSlug(data.project.previousProjectSlug);
    //             });
    //     }
    // }, [playerSlug, projectObj]);

    useEffect(() => {
        if (!projectSlug) {
            return;
        }
        async function fetchCurrentScores() {
            const response = await fetch(
                `/api/all?project=${projectSlug}&journey=${currentJourney}&showPlayer=${playerSlug}&heuristic=${heuristicNumber}`
            );
            const responseJson = await response.json();
            console.log("eee", responseJson);

            setAllPlayersScores(responseJson);
        }

        fetchCurrentScores();
    }, [
        currentJourney,
        heuristicNumber,
        playerSlug,
        previousProjectSlug,
        projectSlug,
    ]);

    useEffect(() => {
        if (!previousProjectSlug) {
            return;
        }
        async function fetchPreviousScores() {
            const response = await fetch(
                `/api/all?project=${previousProjectSlug}&journey=${currentJourney}&showPlayer=${playerSlug}&heuristic=${heuristicNumber}`
            );
            const responseJson = await response.json();
            console.log("ddd", responseJson);

            setPreviousAllPlayersScores(responseJson);
        }

        fetchPreviousScores();
    }, [currentJourney, heuristicNumber, playerSlug, previousProjectSlug]);

    if (
        !projectSlug ||
        !playerSlug ||
        !heuristicNumber ||
        !previousAllPlayersScores ||
        // !projectObj?.previousScores
        !projectObj?.previousProjectSlug
    ) {
        return emptyProject;
    }

    // const playerScoresObj = projectObj?.previousScores?.find(
    //     (scores) => scores.slug === playerSlug
    // );

    // if (!playerScoresObj) {
    //     // return emptyProject;
    // }

    const _previousPlayerScore =
        previousAllPlayersScores?.scores_by_heuristic?.find(
            (scoreObj) => scoreObj.playerSlug === playerSlug
        )?.value;

    const _playerScore = allPlayersScores?.scores_by_heuristic?.find(
        (scoreObj) => scoreObj.playerSlug === playerSlug
    )?.value;

    // const _previousPlayerScore = previousScoresObj?[currentJourney].find(
    //     (scoreObj) => scoreObj.heuristic.heuristicNumber === heuristicNumber
    // ).scoreValue;

    return {
        _projectName: projectObj?.name,
        _projectSlug: projectObj?.slug,
        _projectCurrentYear: projectObj?.year,
        _previousProjectSlug: projectObj?.previousProjectSlug,
        _previousPlayerScore,
        _playerScore,
        _previousAllPlayersScoreAverage:
            previousAllPlayersScores?.average_score,
        _allPlayersScoreAverage: allPlayersScores?.average_score,
        _allPlayersScoreAverageWithZeroed:
            allPlayersScores?.average_score_with_zeroed,
    };
}
