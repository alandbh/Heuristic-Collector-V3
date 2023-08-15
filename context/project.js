import { createContext, useContext, useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useRouter } from "next/router";
import client from "../lib/apollo";
import clientFast from "../lib/apollo-fast";

const QUERY_ALL_JOURNEYS = gql`
    query GetGroups($playerSlug: String, $projectSlug: String) {
        journeys(
            where: {
                players_some: {
                    slug: $playerSlug
                    project: { slug: $projectSlug }
                }
            }
            orderBy: slug_ASC
        ) {
            name
            slug
        }
    }
`;

const QUERY_ALL_PLAYERS = gql`
    query Projects($projectSlug: String) {
        project(where: { slug: $projectSlug }) {
            slug
            players(first: 10000, orderBy: name_ASC) {
                id
                name
                slug
                department
                logo {
                    url
                }
            }
        }
    }
`;

const QUERY_CURRENT_PLAYER = gql`
    query getCurrentPlayer($projectSlug: String, $playerSlug: String) {
        players(where: { project: { slug: $projectSlug }, slug: $playerSlug }) {
            id
            name
            slug
            scoresObject
            journeys {
                id
                slug
            }
            ignored_journeys {
                name
                slug
                id
            }
            zeroed_journeys {
                name
                slug
                id
            }
        }
    }
`;

const QUERY_CURRENT_JOURNEY = gql`
    query getCurrentJourney($projectSlug: String, $journeySlug: String) {
        journeys(
            where: {
                project: { slug: $projectSlug }
                AND: { slug: $journeySlug }
            }
        ) {
            id
            slug
            name
        }
    }
`;

async function doTheQuery(queryString, variables, setStateFunction) {
    console.log("project - querying");

    const result = await clientFast.query({
        query: queryString,
        variables,
        fetchPolicy: "network-only",
    });

    const data = result.data,
        loading = result.loading,
        error = result.error;

    setStateFunction({ data, loading, error });
}

const ProjectContext = createContext();

export function ProjectWrapper({ children, data }) {
    const [_allPlayersData, setAllPlayersData] = useState(null);
    const [_allJourneysData, setAllJourneysData] = useState(null);
    const [currentPlayerData, setCurrentPlayerData] = useState(null);
    const [currentJourneyData, setCurrentJourneyData] = useState(null);
    const router = useRouter();

    const { slug, tab, player, journey } = router.query || "";

    // const { data: currentPlayer, loading: loadingCurrentPlayer } = useQuery(
    //     QUERY_CURRENT_PLAYER,
    //     {
    //         variables: {
    //             playerSlug: player,
    //             projectSlug: slug,
    //         },
    //     }
    // );

    // Querying Current Player
    useEffect(() => {
        if ((player, slug)) {
            doTheQuery(
                QUERY_CURRENT_PLAYER,
                {
                    playerSlug: player,
                    projectSlug: slug,
                },
                setCurrentPlayerData
            );
        }
    }, [player, slug]);

    useEffect(() => {
        if (slug) {
            doTheQuery(
                QUERY_ALL_PLAYERS,
                {
                    projectSlug: slug,
                },
                setAllPlayersData
            );
        }
    }, [slug]);

    useEffect(() => {
        if ((player, slug)) {
            doTheQuery(
                QUERY_ALL_JOURNEYS,
                {
                    projectSlug: slug,
                    playerSlug: player,
                },
                setAllJourneysData
            );
        }
    }, [slug, player]);

    // Querying Current Journey
    useEffect(() => {
        if ((journey, slug)) {
            doTheQuery(
                QUERY_CURRENT_JOURNEY,
                {
                    journeySlug: journey,
                    projectSlug: slug,
                },
                setCurrentJourneyData
            );
        }
    }, [journey, slug]);

    if (
        _allPlayersData === null ||
        _allJourneysData === null ||
        currentPlayerData === null ||
        currentJourneyData === null
    ) {
        return null;
    }

    const { data: allPlayersData, loading: loadingAllPlayersData } =
        _allPlayersData;
    const { data: allJourneysData, loading: loadingAllJourneysData } =
        _allJourneysData;
    const { data: currentPlayer, loading: loadingCurrentPlayer } =
        currentPlayerData;

    const { data: currentJourney, loading: loadingCurrentJourney } =
        currentJourneyData;

    // const { data: currentJourney, loading: loadingCurrentJourney } = useQuery(
    //     QUERY_CURRENT_JOURNEY,
    //     {
    //         variables: {
    //             journeySlug: journey,
    //             projectSlug: slug,
    //         },
    //     }
    // );

    if (
        loadingAllPlayersData ||
        loadingAllJourneysData ||
        loadingCurrentPlayer ||
        loadingCurrentJourney ||
        currentPlayer === undefined ||
        currentPlayer === null
    ) {
        return null;
    }

    // console.log("url", router.asPath.split("#").pop());
    // console.log("currentPlayer", currentPlayer.players[0]);
    // console.log("currentJourney", currentJourney.journeys[0]);

    return (
        <ProjectContext.Provider
            value={{
                currentProject: data.project,
                allPlayersData,
                allJourneysData,
                currentPlayer: currentPlayer.players[0],
                currentJourney: currentJourney.journeys[0],
            }}
        >
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjectContext() {
    return useContext(ProjectContext);
}
