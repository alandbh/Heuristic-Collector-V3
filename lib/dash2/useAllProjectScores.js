import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import client from "../apollo";

const QUERY_PROJECT_DATA = gql`
    query GetProjectData($projectSlug: String) {
        project(where: { slug: $projectSlug }) {
            name
            slug
            year
            players(first: 10000, orderBy: slug_ASC) {
                name
                slug
                showInChart
                ignored_journeys {
                    slug
                    name
                }
                departmentObj {
                    departmentSlug
                    departmentName
                    departmentOrder
                }
                scoresObject
            }
            journeys {
                name
                slug
            }
            previousScores
            previousProjectSlug
        }
    }
`;

const QUERY_HEURISTICS = gql`
    query GetHeuristics($projectSlug: String) {
        heuristics(where: { project: { slug: $projectSlug } }, first: 10000) {
            name
            id
            heuristicNumber
            description
            group {
                name
                groupNumber
            }
            journeys {
                name
                slug
            }
        }
    }
`;

function organizeHeuristics(data) {
    // 1. Group by journey
    const journeyMap = new Map();

    data.forEach((heuristic) => {
        if (heuristic.journeys.length === 0) {
            if (!journeyMap.has("both")) {
                journeyMap.set("both", []);
            }
            journeyMap.get("both").push(heuristic);
        }
        heuristic.journeys.forEach((journey) => {
            if (!journeyMap.has(journey.slug)) {
                journeyMap.set(journey.slug, []);
            }
            journeyMap.get(journey.slug).push(heuristic);
        });
    });

    // 2. Sort each journey's heuristics by heuristicNumber
    const organized = [];
    journeyMap.forEach((heuristics, journeySlug) => {
        organized.push(
            heuristics.sort((a, b) => {
                return (
                    parseFloat(a.heuristicNumber) -
                    parseFloat(b.heuristicNumber)
                );
            })
        );
    });

    return organized.flatMap((heuristics) => heuristics);
}

function useAllProjectScores(projectSlug) {
    const [projectObj, setProjectObj] = useState(null);
    const [previousProjectObj, setPreviousProjectObj] = useState(null);
    const [previousProjectSlug, setPreviousProjectSlug] = useState(null);
    const [heuristics, setHeuristics] = useState(null);

    function fetchProjectData(
        query,
        projectSlug,
        setStatef1,
        setStatef2 = null
    ) {
        const variables = {
            projectSlug,
        };
        client
            .query({
                query,
                variables,
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                setStatef1(data.project);
                if (setStatef2 !== null) {
                    setStatef2(data.project?.previousProjectSlug);
                }
            });
    }

    useEffect(() => {
        if (projectSlug) {
            fetchProjectData(
                QUERY_PROJECT_DATA,
                projectSlug,
                setProjectObj,
                setPreviousProjectSlug
            );

            // fetchProjectData(QUERY_HEURISTICS, projectSlug, setHeuristics);
        }
    }, [projectSlug]);

    useEffect(() => {
        if (previousProjectSlug !== undefined) {
            fetchProjectData(
                QUERY_PROJECT_DATA,
                previousProjectSlug,
                setPreviousProjectObj
            );
        }
    }, [previousProjectSlug]);

    useEffect(() => {
        if (projectSlug) {
            fetchProjectData(QUERY_HEURISTICS, projectSlug, setHeuristics);
            const variables = {
                projectSlug,
            };
            client
                .query({
                    query: QUERY_HEURISTICS,
                    variables,
                    fetchPolicy: "network-only",
                })
                .then(({ data }) => {
                    console.log("organi", organizeHeuristics(data.heuristics));
                    setHeuristics(organizeHeuristics(data.heuristics));
                });
        }
    }, [projectSlug]);

    if (heuristics) {
    }

    // if (
    //     !previousProjectSlug ||
    //     !projectObj ||
    //     !previousProjectObj ||
    //     !heuristics
    // ) {
    //     return null;
    // }

    return { currentProjectObj: projectObj, previousProjectObj, heuristics };
}

export default useAllProjectScores;
