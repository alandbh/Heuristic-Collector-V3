// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { gql, useMutation } from "@apollo/client";
import clientFast from "../../lib/apollo-fast";

async function getData(query, variables) {
    let queryString = variables
        ? {
              query: query,
              variables,
              fetchPolicy: "network-only",
          }
        : {
              query: query,
              fetchPolicy: "network-only",
          };

    let result = await clientFast.query(queryString);

    return result;
}

const QUERY_ALL = gql`
    query getAllPlayers($projectSlug: String) {
        players(where: { project: { slug: $projectSlug } }, first: 10000) {
            id
            name
            slug
            departmentObj {
                departmentName
                departmentSlug
                departmentOrder
            }
            scoresObject
        }
    }
`;

export default async function handler(req, res) {
    const { project } = req.query;
    const allPlayers = await getData(QUERY_ALL, { projectSlug: project });

    res.status(200).json(allPlayers.data.players);
}
