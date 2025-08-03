import { gql } from "@apollo/client";

export const QUERY_PROJECT_DATA = gql`
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
            isOverlapJourneys
            previousScores
            chartStyle
            previousProjectSlug
        }
    }
`;

export const QUERY_HEURISTICS = gql`
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
