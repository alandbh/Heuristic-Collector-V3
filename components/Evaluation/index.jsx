import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Spinner from "../Spinner";
import { ScoresWrapper } from "../../context/scores";
import { ScoresObjWrapper } from "../../context/scoresObj";
import client from "../../lib/apollo";

import { useProjectContext } from "../../context/project";
// import { useCredentialsContext } from "../../context/credentials";
import HeuristicGroup from "../HeuristicGroup";
import GroupContainer from "../GroupContainer";
import { useCallback, useEffect, useMemo, useState } from "react";

const QUERY_GROUPS = gql`
    query GetGroups($projectSlug: String, $journeySlug: String) {
        groups(
            where: {
                project: { slug: $projectSlug }
                journeys_some: { slug: $journeySlug }
            }
        ) {
            id
            name
            description
            journeys(where: { slug: $journeySlug }) {
                name
            }
            heuristic(first: 10000) {
                name
                id
                heuristicNumber
                group {
                    name
                }
                description
                journeys {
                    slug
                }
                not_applicaple_players {
                    slug
                }
            }
        }
    }
`;

async function getGroups(projectSlug, journeySlug, setGroupsData) {
    console.log("Evaluation - querying groups");

    const result = await client.query({
        query: QUERY_GROUPS,
        variables: {
            projectSlug,
            journeySlug,
        },
        fetchPolicy: "network-only",
    });

    const data = result.data,
        loading = result.loading,
        error = result.error;

    setGroupsData({ data, loading, error });
}

function Evaluation() {
    console.log("Evaluation - loading");
    const { currentProject } = useProjectContext();
    const router = useRouter();
    const [groupsData, setGroupsData] = useState(null);

    // const { data, loading, error } = useQuery(QUERY_GROUPS, {
    //     variables: {
    //         projectSlug: currentProject.slug,
    //         journeySlug: router.query.journey,
    //     },
    // });

    const projectSlugMemo = useMemo(
        () => currentProject.slug,
        [currentProject.slug]
    );
    const journeySlugMemo = useMemo(
        () => router.query.journey,
        [router.query.journey]
    );

    useEffect(() => {
        console.log("testeEffect", {
            project: projectSlugMemo,
            router: journeySlugMemo,
        });
        if (projectSlugMemo && journeySlugMemo !== undefined) {
            //DELAY
            getGroups(projectSlugMemo, journeySlugMemo, setGroupsData);
        }
    }, [projectSlugMemo, journeySlugMemo]);

    // const dataToPass = useMemo(() => data, [data]);

    // console.log("Evaluation", useCredentialsContext());

    if (groupsData === null) {
        return null;
    }
    if (groupsData.data === undefined) {
        return null;
    }

    if (groupsData.loading) {
        return (
            <div className="h-[calc(100vh_-_126px)] flex flex-col items-center justify-center">
                <Spinner radius={50} thick={7} colorClass="primary" />
            </div>
        );
        return <div className="text-red-500">LOADING EVALUATION</div>;
    }

    if (groupsData.error) {
        return (
            <div>
                SOMETHING WENT WRONG: Evaluation {groupsData.error.message}
            </div>
        );
    }

    console.log("Evaluation loads groups successfully");

    return (
        <ScoresWrapper>
            <ScoresObjWrapper>
                <GroupContainer data={groupsData.data}></GroupContainer>
            </ScoresObjWrapper>
        </ScoresWrapper>
    );
}

export default Evaluation;
