import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import client from "../lib/apollo";
import { processChange, waitForNewData } from "../lib/utils";
import { MUTATION_SCORE_OBJ } from "../lib/mutations";
import Spinner from "../components/Spinner";

import { gql, useQuery } from "@apollo/client";

const QUERY_SCORES = gql`
    query GetScores($projectSlug: String, $playerSlug: String) {
        player(where: { id: "clag1accr0sww0alr76x1k8wg" }, first: 10000) {
            scoresObject
        }
    }
`;

const QUERY_SCORES_FROM_PLAYER = gql`
    query GetScoresFromPlayer($projectSlug: String, $playerSlug: String) {
        players(where: { slug: $playerSlug, project: { slug: $projectSlug } }) {
            id
            scoresObject
            journeys {
                id
                slug
            }
        }
    }
`;

const ScoresObjContext = createContext();

export function ScoresObjWrapper({ children }) {
    const [allScoresObj, setAllScoresObj] = useState(null);
    const [allScoresJson, setAllScoresJson] = useState(null);
    const router = useRouter();
    const { data, loading, error } = useQuery(QUERY_SCORES_FROM_PLAYER, {
        variables: {
            projectSlug: router.query.slug,
            playerSlug: router.query.player,
        },
    });

    window.getNewScoresObj = async function getNewScoresObj() {
        const { data: newData } = await client.query({
            query: QUERY_SCORES_FROM_PLAYER,
            variables: {
                projectSlug: router.query.slug,
                playerSlug: router.query.player,
            },
            fetchPolicy: "network-only",
        });

        if (newData.players[0]["scoresObject"] !== null) {
            setAllScoresObj(
                newData.players[0]["scoresObject"][router.query.journey]
            );
            console.log(
                "SETTING NEW ALL SCORES OBJ",
                newData.players[0]["scoresObject"]
            );
            return newData.players[0]["scoresObject"][router.query.journey];
        }
    };

    useEffect(() => {
        if (data && data.players[0]["scoresObject"] !== null) {
            setAllScoresObj(
                data.players[0]["scoresObject"][router.query.journey]
            );
            setAllScoresJson(data.players[0]["scoresObject"]);
            console.log("InitialScores", allScoresJson);
        } else if (data && data.players[0]["scoresObject"] === null) {
            let scoresObjModel = {};

            data?.players[0]["journeys"].map((journey) => {
                scoresObjModel[journey.slug] = [];
            });
            console.log("InitialScores", data.players[0]["scoresObject"]);

            setAllScoresJson(JSON.stringify(scoresObjModel));

            let allScoresObjJson = JSON.stringify(scoresObjModel);
            let allScoresObjJsonClone = JSON.parse(allScoresObjJson);

            processChange(
                client,
                {
                    playerId: data.players[0].id,
                    scoresObj: allScoresObjJsonClone,
                },
                MUTATION_SCORE_OBJ,
                true
            );

            // console.log("InitialScores SALVOUU", newData);
            // async function getNewData() {
            //     let newData = await waitForNewData();

            // }

            // getNewData();
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
    window.scoresObj = data?.players[0]["scoresObject"]
        ? data?.players[0]["scoresObject"][router.query.journey]
        : null;

    return (
        <ScoresObjContext.Provider
            value={{
                allScoresObj,
                allScoresJson,
                loading,
                error,
                setAllScoresObj,
                getNewScoresObj,
            }}
        >
            {children}
        </ScoresObjContext.Provider>
    );
}

export function useScoresObjContext() {
    return useContext(ScoresObjContext);
}
