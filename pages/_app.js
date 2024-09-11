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

    window.addEventListener("load", async () => {
        if (location.search.includes("api/upload")) {
            const keys = await caches.keys();
            const mediaCache = await caches.open(
                keys.filter((key) => key.startsWith("media"))[0]
            );
            const image = await mediaCache.match("shared-image");
            if (image) {
                const blob = await image.blob();
                await mediaCache.delete("shared-image");
                // Handle the shared file somehow.
            }
        }
    });
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
