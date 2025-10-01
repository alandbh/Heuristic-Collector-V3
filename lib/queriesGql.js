import { gql } from "@apollo/client";

export const QUERY_PROJECT_DATA = gql`
    query GetProjectData($projectSlug: String) {
        project(where: { slug: $projectSlug }) {
            name
            slug
            year
            players(last: 10000, orderBy: slug_ASC) {
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
        heuristics(where: { project: { slug: $projectSlug } }, last: 10000) {
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

// Queries para a nova funcionalidade de inserção de heurística
export const QUERY_ALL_PROJECTS = gql`
    query GetAllProjects {
        projects(last: 1000, orderBy: createdAt_DESC) {
            slug
            name
            year
            id
            createdAt
        }
    }
`;

export const QUERY_PROJECT_BY_ID = gql`
    query GetProject($projectId: ID) {
        project(where: {id: $projectId}) {
            slug
            name
            isOverlapJourneys
            journeys {
                name
                slug
            }
        }
    }
`;

export const QUERY_HEURISTICS_FROM_PROJECT = gql`
    query getHeuristicsFromTheProject($projectId: ID) {
        heuristics(where: {project: {id: $projectId}}, last: 1000) {
            id
            name
            heuristicNumber
            group {
                name
                groupNumber
            }
            journeys {
                name
                slug
            }
            not_applicaple_players {
                name
                slug
                id
            }
        }
    }
`;

export const QUERY_PLAYERS_FROM_PROJECT = gql`
    query getPlayersFromTheProject($projectId: ID) {
        players(where: {project: {id: $projectId}}, last: 1000) {
            id
            name
            slug
            scoresObject
        }
    }
`;