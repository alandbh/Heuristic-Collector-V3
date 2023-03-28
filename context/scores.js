import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import client from "../lib/apollo";
import Spinner from "../components/Spinner";

import { gql, useQuery } from "@apollo/client";

const QUERY_SCORES = gql`
    query GetScores(
        $projectSlug: String
        $journeySlug: String
        $playerSlug: String
    ) {
        scores(
            where: {
                player: { slug: $playerSlug }
                project: { slug: $projectSlug }
                journey: { slug: $journeySlug }
            }
            first: 10000
        ) {
            id
            scoreValue
            note
            evidenceUrl
            heuristic {
                heuristicNumber
                group {
                    name
                }
            }
        }
    }
`;

const ScoresContext = createContext();

export function ScoresWrapper({ children }) {
    const [allScores, setAllScores] = useState(null);
    const router = useRouter();
    const { data, loading, error } = useQuery(QUERY_SCORES, {
        variables: {
            projectSlug: router.query.slug,
            journeySlug: router.query.journey,
            playerSlug: router.query.player,
        },
    });

    window.getNewScores = async function getNewScores() {
        const { data: newData } = await client.query({
            query: QUERY_SCORES,
            variables: {
                projectSlug: router.query.slug,
                journeySlug: router.query.journey,
                playerSlug: router.query.player,
            },
            fetchPolicy: "network-only",
        });

        setAllScores(newData.scores);
        console.log("SETTING NEW ALL SCORES", newData);

        return newData.scores;
    };

    useEffect(() => {
        if (data) {
            setAllScores(data.scores);
        }
    }, [data]);

    // if (loading || !allScores) {
    //     return (
    //         <div className="h-[calc(100vh_-_126px)] flex flex-col items-center">
    //             <Spinner radius={40} thick={6} />
    //         </div>
    //     );
    //     return <div>LOADING SCORES OBJECT</div>;
    // }

    // if (error) {
    //     return <div>SOMETHING WENT WRONG: {error.message}</div>;
    // }
    // if (data === undefined) {
    //     return null;
    // }

    // console.log("SCORES", data);

    if (!data) {
        return null;
    }
    window.scores = data?.scores;

    return (
        <ScoresContext.Provider
            value={{ allScores, loading, error, setAllScores, getNewScores }}
        >
            {children}
        </ScoresContext.Provider>
    );
}

export function useScoresContext() {
    return useContext(ScoresContext);
}
