import React, { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { gql, useQuery } from "@apollo/client";
import client from "../../lib/apollo";

import Dashboard from "../../components/Dashboard";
import Evaluation from "../../components/Evaluation";
import Header from "../../components/Header";
import { ProjectWrapper } from "../../context/project";
import { CredentialsWrapper } from "../../context/credentials";
// import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import { Link as Scroll, animateScroll } from "react-scroll";
import { useScroll } from "../../lib/utils";

const QUERY_PROJECTS = gql`
    query Projects($slug: String) {
        project(where: { slug: $slug }) {
            slug
            name
            id
        }
    }
`;

async function doTheQuery(queryString, variables, setStateFunction) {
    console.log("projectEffect - querying", variables);

    const result = await client.query({
        query: queryString,
        variables,
        fetchPolicy: "network-only",
    });

    const data = result.data,
        loading = result.loading,
        error = result.error;

    setStateFunction({ data, loading, error });
}

function Project() {
    const router = useRouter();
    const [user, loadingUser] = useAuthState(auth);
    const [projectData, setProjectData] = useState(null);
    const { slug, tab, player } = router.query;

    console.log("slugloading");

    // const { data, loading, error } = useQuery(QUERY_PROJECTS, {
    //     variables: {
    //         slug,
    //     },
    // });

    useEffect(() => {
        if (slug !== undefined) {
            doTheQuery(
                QUERY_PROJECTS,
                {
                    slug,
                },
                setProjectData
            );
        }
    }, [slug]);

    if (projectData === null) {
        return null;
    }

    console.log("projectData", projectData);

    if (slug === undefined) {
        return (
            <header>
                <div className="bg-primary flex justify-between px-5 items-center h-12"></div>
            </header>
        );
    }

    if (projectData?.loading) {
        // return null;
        return (
            <header>
                <div className="bg-primary flex justify-between px-5 items-center h-12"></div>
                <div className="bg-white shadow-md px-5 py-3 h-20"></div>
                <main className="flex bg-slate-100 items-center h-[calc(100vh_-_126px)]">
                    Loading ptoject...
                </main>
            </header>
        );
    }

    if (projectData.error) {
        return (
            <div>
                Something went wrong in loading this project {error.message}
            </div>
        );
    }

    if (projectData?.project === null) {
        return <div>PROJECT NOT FOUND</div>;
    }

    if (projectData?.data.project.slug !== slug) {
        return <div>NOT FOUND</div>;
    }

    // console.log("user", user);

    if (typeof window !== "undefined") {
        if (!user && !loadingUser) {
            router.push("/login");
            // return;
        }
    }

    if (!user) {
        // router.push("/login");
        return null;
    }

    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50">
            <Head>
                <Head>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                    <meta
                        name="viewport"
                        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                    />
                    <meta
                        name="description"
                        content="R/GA's Heuristic Collector"
                    />
                    <meta name="theme-color" content="#dd0000" />
                    <title>R/GA&apos;s Heuristic Collector</title>
                    <link rel="manifest" href="/manifest.json" />
                    <link rel="shortcut icon" href="/favicon.ico" />
                    <link
                        rel="apple-touch-icon"
                        href="/apple-touch-icon.png"
                    ></link>
                    <link
                        rel="android-chrome-192x192"
                        href="/android-chrome-192x192.png"
                    ></link>
                </Head>
            </Head>
            <CredentialsWrapper>
                <ProjectWrapper data={projectData.data}>
                    <Header
                        // className="mt-20"
                        // project={data?.project.name}
                        routes={{ slug, tab: "progress" }}
                        auth={{ user, loadingUser, auth }}
                    />
                    <main className="mt-10 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                        {tab === "progress" ? <Dashboard /> : <Evaluation />}
                    </main>
                    <footer className="py-10">{/* FOOTER */}</footer>
                    <Gototop />
                </ProjectWrapper>
            </CredentialsWrapper>
        </div>
    );
}

// export default withPageAuthRequired(Project);
export default Project;

function Gototop() {
    const [scrollY, setScrollY] = useScroll();
    const goToUpRef = useRef(null);

    if (goToUpRef.current !== null) {
        if (scrollY > 200) {
            goToUpRef.current.classList.add("transition-all");
            goToUpRef.current.classList.remove("translate-y-20");
            goToUpRef.current.classList.remove("opacity-0");
        } else {
            goToUpRef.current.classList.add("opacity-0");
            goToUpRef.current.classList.add("translate-y-20");
        }
    }

    const scroll = animateScroll;
    return (
        <div
            ref={goToUpRef}
            className="translate-y-20 bg-slate-700 fixed left-4 bottom-4 w-12 h-12"
        >
            <button
                className="w-full h-full text-white/70 text-4xl"
                onClick={() => {
                    scroll.scrollToTop();
                }}
            >
                ᐞ
            </button>
        </div>
    );
}

export { Gototop };
