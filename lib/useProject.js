import { useEffect, useState } from "react";
import { gql } from "@apollo/client";
import client from "./apollo";

const QUERY_PROJECT_DATA = gql`
    query GetProjectData($projectSlug: String) {
        project(where: { slug: $projectSlug }) {
            name
            slug
            year
            previousScores
        }
    }
`;

export function useProject(projectSlug, heuristicNumber) {
    const [projectObj, setProjectObj] = useState(null);

    /**
     *
     * Getting the Project data, including the previous scores
     *
     */

    useEffect(() => {
        if (projectSlug) {
            const variables = {
                projectSlug,
            };
            client
                .query({
                    query: QUERY_PROJECT_DATA,
                    variables,
                    fetchPolicy: "network-only",
                })
                .then(({ data }) => {
                    setProjectObj(data.project);
                });
        }
    }, [projectSlug]);

    console.log("aaa", projectObj);

    return {
        projectName: projectObj?.name,
        projectSlug: projectObj?.slug,
        projectCurrentYear: projectObj?.year,
    };

    let name;
    let slug;
    let year;
    let previousScores;
}
