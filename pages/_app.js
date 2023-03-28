import React from "react";
// import { UserProvider } from "@auth0/nextjs-auth0";
import { ApolloProvider } from "@apollo/client";
import client from "../lib/apollo";

import "../styles/globals.css";
if (typeof window !== "undefined") {
    if (localStorage.theme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
}
function MyApp({ Component, pageProps }) {
    return (
        // <UserProvider>
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
        // </UserProvider>
    );
}

export default MyApp;
