import Link from "next/link";
import Logo from "../components/Logo";
import LoggedUser from "../components/LoggedUser";
// import { useUser } from "@auth0/nextjs-auth0";
import Head from "next/head";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { useRouter } from "next/router";

export default function Home(props) {
    // console.log("credential", useUser().user);

    // const { given_name, picture } = useCredentialsContext().user;

    // const userObj = useUser()?.user;

    // if (userObj !== undefined) {
    //     const { given_name, picture } = userObj;
    // }

    const [user, loading] = useAuthState(auth);

    console.log("user", user);
    console.log("loadingUser", loading);

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
            <div className="flex flex-col  px-0">
                <div className="flex w-full max-w-5xl mx-auto justify-between my-10 px-4">
                    <Logo />

                    <div className="flex items-center gap-5">
                        <Link href="/projects">
                            <a className="bg-primary text-sm hover:bg-primary/70 text-white/80 uppercase px-6 py-5 rounded-md font-bold h-1 flex items-center">
                                {user ? "Enter " : "Log In"}
                            </a>
                        </Link>

                        {user && (
                            <LoggedUser
                                picture={user?.photoURL}
                                name={user?.displayName.split(" ")[0]}
                                email={user?.email}
                                size={40}
                                auth={auth}
                            />
                        )}
                    </div>
                </div>
                <div className="my-20">
                    <Section mt={10}>
                        <div className="col-span-3 max-w-[300px] mx-auto md:mx-0 mb-10">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video1a.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                No more typing long texts into spreadsheets
                            </P>
                            <P>
                                Spreadsheets are great for storing and
                                visualizing data.
                            </P>
                            <P>
                                It turns out that when we need to run a
                                heuristic evaluation, using a smartphone, tablet
                                or even a laptop, it is quite difficult to
                                manually enter data into these spreadsheets.
                                Especially when there are many columns.
                            </P>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold items-center">
                                        Check it out
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </Section>

                    <Section reverse>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                Typos? Not a biq dieal! 🤓
                            </P>
                            <P>
                                Fuzzy search to quickly find the heuristic. No
                                need to type the exact term. 🙌🏽
                            </P>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                        Get Started
                                    </a>
                                </Link>
                            </div>
                        </div>

                        <div className="col-span-3 max-w-[300px] mx-auto md:mx-0">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video2.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                    </Section>

                    <Section>
                        <div className="col-span-3 max-w-[300px] mx-auto md:mx-0 mb-10">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video3.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                Extra findings or blockers
                            </P>
                            <P>
                                If you have found something interesting beyond
                                the heuristics, you can register it easily.
                            </P>
                            <P>
                                Moreover, if you stumbled upon any blockers, you
                                can register it too.
                            </P>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                        Get Started
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </Section>

                    <Section reverse>
                        <div className="col-span-5">
                            <P className="font-bold text-3xl">
                                Producers, we hear you.
                            </P>
                            <P>
                                In Progress tab, producers can follow the work
                                in progress.
                            </P>
                            <small>(experimental)</small>
                            <div className="mt-10 h-11">
                                <Link href="/projects">
                                    <a className="mt-5 border border-primary text-primary hover:bg-primary/80 hover:text-white/90 uppercase px-7 py-3 rounded-md font-bold h-1 items-center">
                                        Get Started
                                    </a>
                                </Link>
                            </div>
                        </div>

                        <div className="col-span-3 max-w-[300px] mx-auto">
                            <video
                                className="shadow-xl"
                                playsInline
                                autoPlay
                                muted
                                loop
                            >
                                <source
                                    src={"/video4.webm"}
                                    type="video/webm"
                                />
                            </video>
                        </div>
                    </Section>

                    <Section bgClass="bg-blue-600" mb={0}>
                        <div className="col-span-8 pt-1 text-center">
                            <h1 className="text-4xl my-20 text-white/90">
                                Concept and Architecture
                            </h1>

                            <div className="w-md">
                                <p className="text-lg mb-4 text-white/90 ">
                                    We needed to deal with three entities:
                                    Players, Heuristics, and Journeys.
                                </p>
                                <p className="text-lg mb-4 text-white/90 ">
                                    Each retailer (or player) was evaluated in
                                    one or more journeys. So, the list of
                                    heuristics could vary according to the
                                    journey.
                                </p>
                            </div>

                            <picture className="text-blue-500">
                                <source
                                    srcSet="/architecture.svg"
                                    type="image/webp"
                                />
                                <img
                                    className="text-blue-500"
                                    src="/architecture.svg"
                                    alt=""
                                />
                            </picture>
                        </div>
                    </Section>

                    <Section py={20} bgClass="bg-blue-900" mtClass={0}>
                        <h1 className="text-4xl col-span-8 text-white/90 text-center my-20">
                            Managing the data
                        </h1>
                        <div className="col-span-4 mb-10 ">
                            <P>
                                <span className="text-white/90">
                                    All data collected is stored in a Google
                                    Sheets document in raw and human-readable
                                    format.
                                </span>
                            </P>
                        </div>

                        <div className="col-span-4">
                            <div className="w-52 mx-auto mb-10 md:mb-0">
                                <picture>
                                    <source
                                        srcSet="/googlesheets.svg"
                                        type="image/webp"
                                    />
                                    <img src="/googlesheets.svg" alt="" />
                                </picture>
                            </div>
                        </div>
                        <div className="fullPage col-span-8 w-[100vw] relative pb-20 flex justify-end opacity-80 dark:opacity-100 dark:mix-blend-multiply mix-blend-luminosityyy inverttt">
                            <picture className="w-[100%] mx-auto bg-blue-200">
                                <source srcSet="/sheet.png" type="image/webp" />
                                <img
                                    className="w-full mix-blend-multiply"
                                    src="/sheet.png"
                                    alt=""
                                />
                            </picture>
                        </div>
                    </Section>
                </div>
            </div>
        </>
    );
}
//calc((100vw - 1024px + 1rem)/2 * -1)
// export async function getStaticProps() {
//     const res = await client.query({
//         query: heuristicQuery,
//     });

//     return {
//         props: {
//             countries: res,
//         },
//     };
// }

function P(props) {
    return (
        <p
            className={
                `text-lg mb-4 text-slate-600 dark:text-slate-400 ` +
                props.className
            }
        >
            {props.children}
        </p>
    );
}

function Section(props) {
    const {
        cols = 8,
        gap = 10,
        mtClass = "mt-10",
        mb = 20,
        pyClass = "py-4",
        bgClass = "",
        className = "",
        reverse = false,
    } = props;

    const gridObj = {
        12: "grid-cols-12",
        8: "grid-cols-8",
        4: "grid-cols-4",
        3: "grid-cols-3",
    };

    const gridClass = "grid-cols-" + cols;
    // const bgClass = "bg-" + bg;
    const mbClass = "mb-" + mb;
    const gapClass = "gap-" + gap;
    return (
        <div className={`${mbClass} ${mtClass} ${bgClass} px-5`}>
            <section
                className={`max-w-5xl ${gridClass} ${pyClass} ${
                    reverse && "flex flex-col-reverse"
                }  mx-auto md:grid  ${gapClass} ${className}`}
            >
                {props.children}
            </section>
        </div>
    );
}
