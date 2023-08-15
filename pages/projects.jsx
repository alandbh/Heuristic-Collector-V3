import { gql, useQuery } from "@apollo/client";
import ClientOnly from "../lib/ClientOnly";
import Card from "../components/Card";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

import Logo from "../components/Logo";
import LoggedUser from "../components/LoggedUser";
import Link from "next/link";
import Head from "next/head";

const QUERY_PROJECTS = gql`
    query {
        projects(orderBy: name_DESC) {
            id
            name
            slug
            year
            public
            journeys(first: 1000, orderBy: slug_ASC) {
                slug
            }
            players(first: 1000, orderBy: slug_ASC) {
                slug
            }
            thumbnail {
                url
            }
        }
    }
`;

function Projects(props) {
    const { data, loading, error } = useQuery(QUERY_PROJECTS);
    console.log(data?.projects);
    const [user, loadingUser] = useAuthState(auth);
    const router = useRouter();
    // console.log("withPageAuthRequired", props.user);
    // const { user, error: errorUser, isLoading } = useUser();

    console.log("user-", user);

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

    // console.log(data.projects);

    const projectsToMap = data?.projects.filter((project) => {
        if (!isUserAuthorized(user)) {
            return project.public === true;
        }

        return true;
    });

    // console.log("projectsMap", projectsToMap);
    if (projectsToMap === undefined) {
        return null;
    }
    // projectsToMap

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <meta name="description" content="R/GA's Heuristic Collector" />
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
            <ClientOnly>
                <div className="flex px-4 w-full justify-between my-10">
                    <Link href={`/`}>
                        <a>
                            <Logo />
                        </a>
                    </Link>

                    <div className="flex items-center gap-5">
                        <LoggedUser
                            picture={user?.photoURL}
                            name={user?.displayName.split(" ")[0]}
                            email={user?.email}
                            size={40}
                            auth={auth}
                        />
                    </div>
                </div>
                <div className="m-4 mt-20 md:m-10 md:mt-28 flex flex-wrap gap-5 md:gap-10 justify-center">
                    {projectsToMap?.map((proj) => (
                        <Card key={proj.id} data={proj} />
                    ))}
                </div>
            </ClientOnly>
        </>
    );
}

export default Projects;

function isUserAuthorized(user) {
    if (
        user?.email.includes("alandbh@gmail.com") ||
        user?.email.includes("alanfuncionario@gmail.com") ||
        user?.email.includes("cindy.gcp.rga") ||
        user?.email.includes("@rga.com")
    ) {
        return true;
    }
}
