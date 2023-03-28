import { createContext, useContext, useEffect, useState } from "react";
import { gql } from "@apollo/client";
import { useRouter } from "next/router";
import client from "../lib/apollo";

const QUERY_CURRENT_PLAYER = gql`
    query getCurrentPlayer($projectSlug: String, $playerSlug: String) {
        players(where: { project: { slug: $projectSlug }, slug: $playerSlug }) {
            id
            name
            slug
            journeys {
                id
                slug
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

    const result = await client.query({
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

    if (currentPlayerData === null || currentJourneyData === null) {
        return null;
    }

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
