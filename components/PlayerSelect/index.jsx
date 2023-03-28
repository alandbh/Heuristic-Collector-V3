import React from "react";
import { gql } from "@apollo/client";
import { useCallback, useEffect, useState, useRef } from "react";
import { useProjectContext } from "../../context/project";
import { useRouter } from "next/router";
import client from "../../lib/apollo";
import Spinner from "../Spinner";

// import { useDetectOutsideClick } from "../../lib/useDetectOutsideClick";

const QUERY_PLAYERS = gql`
    query Projects($projectSlug: String) {
        project(where: { slug: $projectSlug }) {
            slug
            players(first: 10000) {
                id
                name
                slug
                department
                logo {
                    url
                }
            }
        }
    }
`;

const modal_style = {
    enter: { transition: "0.5s", opacity: 1, transform: "translateY(0px)" },
    exit: {
        transition: "0.5s",
        opacity: 0,
        transform: "translateY(-100px)",
    },
    hidden: {
        transition: "0.5s",
        display: "none",
        opacity: 0,
        transform: "translateX(100px)",
        zIndex: 9,
    },
};

function getPlayers(currentProject, setPlayersData) {
    client
        .query({
            query: QUERY_PLAYERS,
            variables: {
                projectSlug: currentProject.slug,
            },
            fetchPolicy: "network-only",
        })
        .then(({ data }) => {
            setPlayersData(data);
        });
}

/**
 *
 * Component
 */

function PlayerSelect({ compact }) {
    const [selected, setSelected] = useState(null);
    const [playersData, setPlayersData] = useState(null);
    const router = useRouter();
    const { currentProject } = useProjectContext();
    // const { data, loading, error } = useQuery(QUERY_PLAYERS, {
    //     variables: {
    //         projectSlug: currentProject.slug,
    //     },
    // });

    const modalRef = useRef(null);
    // const [modalOpen, setModalOpen] = useDetectOutsideClick(modalRef, true);
    useEffect(() => {
        console.log("PlayerSelect loading");
        getPlayers(currentProject, setPlayersData);
    }, [currentProject]);

    useEffect(() => {
        if (router.query.player) {
            const selected = playersData?.project?.players.find(
                (player) => player.slug === router.query.player
            );
            console.log("selected", router.query.player);
            setSelected(selected);
        } else {
            setSelected(playersData?.project?.players[0]);
            router.replace({
                query: {
                    ...router.query,
                    player: playersData?.project?.players[0].slug,
                },
            });
        }
    }, [playersData, router]);

    const handleSelectPlayer = useCallback(
        (player) => {
            router.replace({
                query: {
                    ...router.query,
                    player: player.slug,
                },
            });
            setSelected(player);
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
        modal.children[0].style.transition = "0.4s";
        modal.children[0].style.transform = "translateY(-30vh)";
        modal.style.display = "flex";
        setTimeout(() => {
            modal.style.opacity = 0;
            modal.style.opacity = 1;
            modal.style.zIndex = 9;
            modal.children[0].style.transform = "translateY(-2vh)";
        });
    }

    function closeModal(_modal) {
        const modal = _modal.current;
        modal.style.transition = "0.3s";
        modal.children[0].style.transition = "0.3s";
        modal.children[0].style.transform = "translateY(-30vh)";
        console.log(modal.children[0]);
        modal.style.opacity = 0;
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }

    if (playersData === null) {
        return (
            <div className="pt-3">
                <Spinner radius={10} thick={3} colorClass="primary" />
            </div>
        );
    }

    // if (error) {
    //     return <div>SOMETHING WENT WRONG: {error.message}</div>;
    // }

    return (
        <div>
            <div className="flex flex-col gap-2">
                <label
                    className={`text-gray-400 text-xs ${compact && "hidden"}`}
                    htmlFor="openModal"
                >
                    Select a Player
                </label>
                <div className="flex gap-2 items-center content-center">
                    <picture className="h-6 block dark:brightness-[0] dark:invert dark:grayscale dark:opacity-70">
                        <source srcSet={selected?.logo.url} type="image/webp" />
                        <img
                            className="object-cover max-h-5"
                            src={selected?.logo.url}
                            alt=""
                        />
                    </picture>
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
                        <span className="sr-only">Select a player</span>
                    </button>
                </div>
            </div>

            <div
                className="w-full h-full fixed top-0 left-0 bg-white/90 dark:bg-black/90 items-center justify-center transition-all opacity-0 hidden py-5aaa flex-col pt-[120px] md:pt-0"
                ref={modalRef}
                onClick={() => closeModal(modalRef)}
            >
                <div>
                    <h3 className={`text-3xl text-center font-bold `}>
                        Select a player
                    </h3>
                    <ul
                        className="bg-white dark:bg-slate-700 flex flex-wrap max-w-4xl overflow-y-auto justify-around my-5 border-l-1 border border-y-0 border-r-0"
                        style={{ maxHeight: "calc(100vh - 100px)" }}
                    >
                        {playersData?.project?.players?.map((player, index) => (
                            <li
                                className="flex-1 min-w-[200px]"
                                key={player.slug}
                            >
                                <button
                                    className="border box-border border-l-0 border-gray-300 shadow-[inset_0px_0px_0px_1px_rgba(200,200,255,0.3)] font-bold text-slate-500 hover:text-primary hover:shadow-primary p-8 w-full flex justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all"
                                    onClick={() => handleSelectPlayer(player)}
                                >
                                    <picture className="h-6 block dark:grayscale dark:brightness-[0] dark:invert">
                                        <source
                                            srcSet={player.logo.url}
                                            type="image/webp"
                                        />
                                        <img
                                            className="object-cover max-h-6"
                                            src={player.logo.url}
                                            alt=""
                                        />
                                    </picture>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default React.memo(PlayerSelect);
