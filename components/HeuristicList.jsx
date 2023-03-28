import React from "react";
import { useQuery, gql } from "@apollo/client";

// import { Container } from './styles';

const heuristicQuery = gql`
    query Heuristics {
        heuristics {
            name
            group {
                name
            }
        }
    }
`;

function HeuristicList({ query, variable }) {
    const { data, loading, error } = useQuery(query);

    console.log(data);

    if (loading) {
        return <h2>Loading Heuristic List</h2>;
    }

    if (error) {
        console.error(error);
        return <h2>Error: {error.message}</h2>;
    }
}

export default HeuristicList;
