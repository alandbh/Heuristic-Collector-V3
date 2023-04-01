import React from "react";
import { gql, useQuery } from "@apollo/client";
import client from "../../lib/apollo";
import clientFast from "../../lib/apollo-fast";
import { useCallback, useEffect, useState, useRef } from "react";
import { useProjectContext } from "../../context/project";
import { useRouter } from "next/router";
import Spinner from "../Spinner";

// import { useDetectOutsideClick } from "../../lib/useDetectOutsideClick";

const QUERY_JOURNEYS = gql`
    query GetGroups($playerSlug: String, $projectSlug: String) {
        journeys(
            where: {
                players_some: {
                    slug: $playerSlug
                    project: { slug: $projectSlug }
                }
            }
        ) {
            name
            slug
        }
    }
`;

async function getJourneys(projectSlug, playerSlug, setJourneysData) {
    console.log("journey select - querying journeys");

    const result = await clientFast.query({
        query: QUERY_JOURNEYS,
        variables: {
            projectSlug,
            playerSlug,
        },
        fetchPolicy: "network-only",
    });

    const data = result.data,
        loading = result.loading,
        error = result.error;

    setJourneysData({ data, loading, error });
}

function JourneySelect({ compact = false }) {
    const [journeysData, setJourneysData] = useState(null);
    const [selected, setSelected] = useState(null);
    const router = useRouter();
    const { currentProject, currentPlayer, currentJourney } =
        useProjectContext();
    // const { data, loading, error } = useQuery(QUERY_JOURNEYS, {
    //     variables: {
    //         playerSlug: currentPlayer?.slug,
    //         projectSlug: currentProject?.slug,
    //     },
    // });

    console.log("journey select - load components");

    useEffect(() => {
        console.log("currentAAA", { currentProject, currentPlayer });
        if (currentProject?.id && currentPlayer?.id) {
            getJourneys(
                currentProject.slug,
                currentPlayer.slug,
                setJourneysData
            );
        }
    }, [currentProject, currentPlayer]);

    const modalRef = useRef(null);
    // const [modalOpen, setModalOpen] = useDetectOutsideClick(modalRef, true);
    useEffect(() => {
        if (journeysData !== null) {
            const { data } = journeysData;
            if (router.query.journey) {
                const { data } = journeysData;
                const selected = data?.journeys?.find(
                    (journey) => journey.slug === router.query.journey
                );
                setSelected(selected);
            } else {
                setSelected(data?.journeys[0]);

                if (data?.journeys[0]) {
                    router.replace({
                        query: {
                            ...router.query,
                            journey: data?.journeys[0].slug,
                        },
                    });
                }
            }
        }
    }, [journeysData, router]);

    const handleSelectPlayer = useCallback(
        (journey) => {
            router.replace({
                query: {
                    ...router.query,
                    journey: journey.slug,
                },
            });
            setSelected(journey);
            closeModal(modalRef);
        },
        [router]
    );

    function handleModal(modal) {
        openModal(modal);
    }

    function openModal(_modal) {
        const modal = _modal.current;
        modal.style.transition = "0.4s";
        modal.style.display = "flex";
        modal.children[0].style.transition = "0.4s";
        modal.children[0].style.transform = "translateY(-30vh)";
        setTimeout(() => {
            modal.style.opacity = 0;
            modal.style.opacity = 1;
            modal.style.zIndex = 9;
            modal.children[0].style.transform = "translateY(-20vh)";
        });
    }

    function closeModal(_modal) {
        const modal = _modal.current;
        modal.style.transition = "0.3s";
        modal.children[0].style.transition = "0.3s";
        modal.children[0].style.transform = "translateY(-30vh)";
        modal.style.opacity = 0;
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }

    if (journeysData === null) {
        return null;
    }
    if (journeysData.data === undefined) {
        return null;
    }

    if (journeysData.loading) {
        return (
            <div className="pt-3">
                <Spinner radius={10} thick={3} />
            </div>
        );
    }

    if (journeysData.error) {
        return <div>SOMETHING WENT WRONG: Please, reload the page.</div>;
    }

    return (
        <div>
            <div className="flex flex-col gap-2">
                <label
                    className={`text-gray-400 text-xs ${compact && "hidden"}`}
                    htmlFor="openModal"
                >
                    Select a Journey
                </label>
                <div className="flex gap-2 items-center content-center">
                    <h2 className="text-lg h-6 block font-bold leading-none">
                        {selected?.name}
                    </h2>
                    <button
                        id="openModal"
                        onClick={() => handleModal(modalRef)}
                        className="rounded-full hover:bg-slate-400/30 p-1 transition"
                    >
                        <svg
                            width="25"
                            height="24"
                            viewBox="0 0 25 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M10.9391 4.47644C10.9391 4.87427 11.0971 5.2558 11.3784 5.5371C11.6597 5.81841 12.0413 5.97644 12.4391 5.97644C12.8369 5.97644 13.2184 5.81841 13.4997 5.5371C13.7811 5.2558 13.9391 4.87427 13.9391 4.47644C13.9391 4.07862 13.7811 3.69708 13.4997 3.41578C13.2184 3.13448 12.8369 2.97644 12.4391 2.97644C12.0413 2.97644 11.6597 3.13448 11.3784 3.41578C11.0971 3.69708 10.9391 4.07862 10.9391 4.47644ZM10.9391 11.9764C10.9391 12.3743 11.0971 12.7558 11.3784 13.0371C11.6597 13.3184 12.0413 13.4764 12.4391 13.4764C12.8369 13.4764 13.2184 13.3184 13.4997 13.0371C13.7811 12.7558 13.9391 12.3743 13.9391 11.9764C13.9391 11.5786 13.7811 11.1971 13.4997 10.9158C13.2184 10.6345 12.8369 10.4764 12.4391 10.4764C12.0413 10.4764 11.6597 10.6345 11.3784 10.9158C11.0971 11.1971 10.9391 11.5786 10.9391 11.9764V11.9764ZM10.9391 19.4764C10.9391 19.8743 11.0971 20.2558 11.3784 20.5371C11.6597 20.8184 12.0413 20.9764 12.4391 20.9764C12.8369 20.9764 13.2184 20.8184 13.4997 20.5371C13.7811 20.2558 13.9391 19.8743 13.9391 19.4764C13.9391 19.0786 13.7811 18.6971 13.4997 18.4158C13.2184 18.1345 12.8369 17.9764 12.4391 17.9764C12.0413 17.9764 11.6597 18.1345 11.3784 18.4158C11.0971 18.6971 10.9391 19.0786 10.9391 19.4764V19.4764Z"
                                fill="#9B9B9B"
                            />
                        </svg>
                        <span className="sr-only">Select a journey</span>
                    </button>
                </div>
            </div>

            <div
                className="w-full h-full fixed top-0 left-0 bg-white/90 dark:bg-black/90 items-center justify-center transition-all opacity-0 hidden py-5 flex-col"
                ref={modalRef}
                onClick={() => closeModal(modalRef)}
            >
                <div>
                    <h3 className="text-3xl text-center font-bold">
                        Select a journey
                    </h3>
                    <ul
                        className="bg-white dark:bg-slate-700 flex flex-wrap max-w-4xl overflow-y-auto justify-around my-5 border-l-1 border border-y-0 border-r-0"
                        style={{ maxHeight: "calc(100vh - 40px)" }}
                    >
                        {journeysData.data?.journeys?.map((journey) => (
                            <li
                                className="flex-1 min-w-[200px]"
                                key={journey.slug}
                            >
                                <button
                                    className="border items-center h-full box-border border-l-0 border-gray-300 shadow-[inset_0px_0px_0px_1px_rgba(200,200,255,0.3)] font-bold text-slate-500 dark:text-slate-300 hover:text-primary dark:hover:text-slate-200 hover:shadow-primary p-8 w-full flex justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all"
                                    onClick={() => handleSelectPlayer(journey)}
                                >
                                    {journey.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default React.memo(JourneySelect);
