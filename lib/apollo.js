import { ApolloClient, InMemoryCache } from "@apollo/client";

const token = process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN;
const api = process.env.NEXT_PUBLIC_GRAPHCMS_API;

const client = new ApolloClient({
    uri: api,
    headers: {
        Authorization: `Bearer ${token}`,
    },
    cache: new InMemoryCache(),
});

export default client;
