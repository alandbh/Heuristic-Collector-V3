import { gql, useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import Spinner from "../Spinner";
import { ScoresWrapper } from "../../context/scores";
import { ScoresObjWrapper } from "../../context/scoresObj";
import client from "../../lib/apollo";
import clientFast from "../../lib/apollo-fast";

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
            groupNumber
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
                    groupNumber
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

    const result = await clientFast.query({
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
    const { currentProject, currentJourney } = useProjectContext();
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

    console.log("currentJourney ctx", currentJourney);
    // const journeySlugMemo = useMemo(
    //     () => router.query.journey,
    //     [router.query.journey]
    // );

    useEffect(() => {
        if (projectSlugMemo && currentJourney !== undefined) {
            //DELAY
            getGroups(projectSlugMemo, currentJourney.slug, setGroupsData);
        }
    }, [projectSlugMemo, currentJourney]);

    // const dataToPass = useMemo(() => data, [data]);

    // console.log("Evaluation", useCredentialsContext());

    console.log("groupsData invalid", groupsData);

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
    }

    if (groupsData.error) {
        return (
            <div>
                SOMETHING WENT WRONG: Evaluation {groupsData.error.message}
            </div>
        );
    }

    if (groupsData.data.groups.length === 0) {
        return <div>The journey or player is not valid.</div>;
    }

    return (
        <ScoresObjWrapper>
            <GroupContainer data={groupsData.data}></GroupContainer>
        </ScoresObjWrapper>
    );
}

export default Evaluation;
