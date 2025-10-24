import { gql } from "@apollo/client";

/**
 *
 * GRAPHQL QUERY CONSTANTS
 */
export const MUTATION_SCORE_OBJ = gql`
    mutation UpdatePlayerScore($playerId: ID, $scoresObj: Json) {
        updatePlayer(
            where: { id: $playerId }
            data: { scoresObject: $scoresObj }
        ) {
            id
            scoresObject
        }
    }
`;
export const MUTATION_SCORE = gql`
    mutation setScores($scoreId: ID, $scoreValue: Int, $scoreNote: String) {
        updateScore(
            where: { id: $scoreId }
            data: { scoreValue: $scoreValue, note: $scoreNote }
        ) {
            id
            note
            scoreValue
            evidenceUrl
        }
    }
`;
export const MUTATION_EVIDENCE = gql`
    mutation setScores($scoreId: ID, $evidenceUrl: String, $scoreNote: String) {
        updateScore(
            where: { id: $scoreId }
            data: { evidenceUrl: $evidenceUrl, note: $scoreNote }
        ) {
            id
            scoreValue
            note
            evidenceUrl
        }
    }
`;

export const MUTATION_PUBLIC_SCORE_OBJ = gql`
    mutation PublishUpdatedPlayerScore($playerId: ID) {
        publishPlayer(where: { id: $playerId }) {
            id
            scoresObject
        }
    }
`;

export const MUTATION_CREATE_PLAYER = gql`
    mutation CreatePlayer(
        $name: String!
        $slug: String!
        $projectId: ID!
        $journeys: [JourneyWhereUniqueInput!]!
        $departmentId: ID!
    ) {
        createPlayer(
            data: {
                name: $name
                slug: $slug
                project: { connect: { id: $projectId } }
                journeys: { connect: $journeys }
                departmentObj: { connect: { id: $departmentId } }
            }
        ) {
            id
            slug
            name
        }
    }
`;

export const MUTATION_CREATE_PLAYER_WITH_LOGO = gql`
    mutation CreatePlayerWithLogo(
        $name: String!
        $slug: String!
        $projectId: ID!
        $journeys: [JourneyWhereUniqueInput!]!
        $departmentId: ID!
        $logoId: ID!
    ) {
        createPlayer(
            data: {
                name: $name
                slug: $slug
                project: { connect: { id: $projectId } }
                journeys: { connect: $journeys }
                departmentObj: { connect: { id: $departmentId } }
                logo: { connect: { id: $logoId } }
            }
        ) {
            id
            slug
            name
        }
    }
`;
export const MUTATION_PUBLIC = gql`
    mutation setScorePublic($scoreId: ID) {
        publishScore(where: { id: $scoreId }, to: PUBLISHED) {
            id
            scoreValue
            note
            evidenceUrl
            heuristic {
                name
                id
                group {
                    name
                }
                heuristicNumber
                description
            }
        }
    }
`;

const stringCreateFunc = `createScore(
    data: {
        scoreValue: $scoreValue
        project: { connect: { slug: $projectSlug } }
        player: { connect: { slug: $playerSlug } }
        journey: { connect: { slug: $journeySlug } }
        evidenceUrl: ""
        heuristic: { connect: { id: $heuristicId } }
    }
) {
    scoreValue
    id
},`;

const stringCreate = `
mutation createNewScore(
    $projectSlug: String
    $playerSlug: String
    $journeySlug: String
    $scoreValue: Int!
    $heuristicId: ID
) {
   ${stringCreateFunc}
}
`;

export const MUTATION_CREATE_SCORE = gql(stringCreate);
