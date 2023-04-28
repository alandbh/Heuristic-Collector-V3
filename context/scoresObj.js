import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import client from "../lib/apollo";
import { processChange } from "../lib/utils";
import { MUTATION_SCORE_OBJ } from "../lib/mutations";

import { gql, useQuery } from "@apollo/client";

const QUERY_FIRST_PLAYER = gql`
    query GetAllPlayers($projectSlug: String) {
        players(where: { project: { slug: $projectSlug } }, first: 1) {
            id
            name
            slug
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

function isScoresObjectEmpty(scoresObject) {
    if (typeof scoresObject === "object" && scoresObject !== null) {
        return Object.keys(scoresObject).length === 0;
    } else if (scoresObject === null) {
        return true;
    }

    return !Boolean(scoresObject.trim());
}

export function ScoresObjWrapper({ children }) {
    const [allScoresObj, setAllScoresObj] = useState(null);
    const [allScoresJson, setAllScoresJson] = useState(null);
    const [scoresLoading, setScoresLoading] = useState(true);
    const router = useRouter();

    const { data: firstPlayerData } = useQuery(QUERY_FIRST_PLAYER, {
        variables: {
            projectSlug: router.query.slug,
        },
    });

    const { data, loading, error } = useQuery(QUERY_SCORES_FROM_PLAYER, {
        variables: {
            projectSlug: router.query.slug,
            playerSlug:
                router.query.player || firstPlayerData?.players[0]["slug"],
        },
    });

    async function getNewScoresObj() {
        console.log("fetching new scores");
        const { data: newData } = await client.query({
            query: QUERY_SCORES_FROM_PLAYER,
            variables: {
                projectSlug: router.query.slug,
                playerSlug: router.query.player,
            },
            fetchPolicy: "network-only",
        });

        if (
            newData?.players[0] &&
            newData?.players[0]["scoresObject"] !== null
        ) {
            setScoresLoading(false);
            setAllScoresJson(newData.players[0]["scoresObject"]);
            setAllScoresObj(
                newData.players[0]["scoresObject"][router.query.journey]
            );
            console.log(
                "fetching SETTING NEW ALL SCORES OBJ",
                newData.players[0]["scoresObject"]
            );
            return newData.players[0]["scoresObject"][router.query.journey];
        }
    }

    useEffect(() => {
        getNewScoresObj();
    }, [router.query.journey]);

    // const getNewScoresJson = getNewScoresObj;

    window.getNewScoresJson = async function getNewScoresJson() {
        console.log("fetching new scoresJson");
        const { data } = await client.query({
            query: QUERY_SCORES_FROM_PLAYER,
            variables: {
                projectSlug: router.query.slug,
                playerSlug: router.query.player,
            },
            fetchPolicy: "network-only",
        });

        if (data.players[0]["scoresObject"] !== null) {
            setAllScoresJson(data.players[0]["scoresObject"]);
            setAllScoresObj(
                data.players[0]["scoresObject"][router.query.journey]
            );
            console.log(
                "fetching SETTING NEW ALL SCORES OBJ",
                data.players[0]["scoresObject"]
            );

            console.log("ASAS", data.players[0]["scoresObject"]);

            debugger;
            return data.players[0]["scoresObject"];
        }
    };

    useEffect(() => {
        // isScoresObjectEmpty(data?.players[0]["scoresObject"]);

        if (!data || !firstPlayerData) {
            return;
        }

        setScoresLoading(false);

        if (isScoresObjectEmpty(data.players[0]["scoresObject"])) {
            console.log("isNotEmpty SIM", allScoresJson);
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
        } else {
            console.log("isNotEmpty NAO", allScoresJson);
            isScoresObjectEmpty(data.players[0]["scoresObject"]);
            setAllScoresObj(
                data.players[0]["scoresObject"][router.query.journey]
            );
            setAllScoresJson(data.players[0]["scoresObject"]);
            console.log("InitialScores", allScoresJson);
        }

        // }
    }, [data]);

    // console.log("SCORES", data);

    if (!data || allScoresObj === null) {
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
                getNewScoresJson,
                loading,
                error,
                setAllScoresObj,
                getNewScoresObj,
                scoresLoading,
            }}
        >
            {children}
        </ScoresObjContext.Provider>
    );
}

export function useScoresObjContext() {
    return useContext(ScoresObjContext);
}
