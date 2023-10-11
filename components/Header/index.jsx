import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useProjectContext } from "../../context/project";
import { ScoresObjWrapper } from "../../context/scoresObj";
import JourneySelect from "../JourneySelect";
import PlayerSelect from "../PlayerSelect";
import ToggleTheme from "../ToggleTheme";
import LoggedUser from "../LoggedUser";
// import { useCredentialsContext } from "../../context/credentials";
import { useIsSticky } from "../../lib/utils";
import React, { useRef } from "react";

function Header({ routes, className, auth }) {
    const router = useRouter();
    const { slug, tab } = router.query || "";
    const isProgress = tab === routes?.tab || "";
    const isSticky = useIsSticky(128);

    const headerRef = useRef(null);

    const { currentProject } = useProjectContext() || { project: { name: "" } };

    const { displayName: given_name, photoURL: picture, email } = auth.user;

    // console.log("useCredentialsContext()", useCredentialsContext());

    function handleNav(param, value) {
        if (value) {
            router.replace("/project/" + router.query.slug, undefined, {
                shallow: true,
            });

            router.replace({
                query: {
                    slug: router.query.slug,
                    tab: value,
                },
            });
        }
        router.replace("/project/" + router.query.slug, undefined, {
            shallow: true,
        });
    }

    const LINK_CLASSES = `border flex gap-2 align-middle items-center py-1 px-4 md:px-5 rounded-full transition-all text-xs md:text-sm `;

    if (!isSticky) {
        return (
            <header ref={headerRef} className={`z-10`}>
                <div
                    className={`bg-primary flex justify-between px-5 items-center h-12`}
                >
                    <div className="flex gap-4">
                        <Link href={`/projects`}>
                            <a>
                                <div className="py-1 hidden sm:block">
                                    <Image
                                        src={`/logo-white-35.svg`}
                                        width={100}
                                        height={35}
                                        alt={`Back to Project Gallery`}
                                    />
                                </div>
                                <div className="block sm:hidden bg-red-600 h-6 w-6"></div>
                            </a>
                        </Link>
                    </div>
                    <div className="flex gap-3 md:gap-5 items-center ">
                        <nav className="border-white/50 border rounded-full flex font-bold text-white">
                            {/* <Link href={`/project/${routes.slug}`}> */}
                            {/* <a href={`/project/${routes.slug}`}> */}
                            <button
                                onClick={() => {
                                    handleNav("tab", "");
                                }}
                            >
                                <span
                                    className={`${
                                        isProgress
                                            ? "border-transparent opacity-60"
                                            : "border-white text-white opacity-100"
                                    } ${LINK_CLASSES} `}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="17"
                                        fill="none"
                                        viewBox="0 0 16 17"
                                    >
                                        <path
                                            fill="#fff"
                                            d="M13.92 12.521a2.676 2.676 0 00-5.312.26c-2.742-.085-3.715-.726-3.556-2.03.059-.487.353-.747.894-.874A3.29 3.29 0 016.97 9.82c.03.003.062.005.092.009.202.048.408.089.613.121.609.1 1.228.15 1.818.118 1.657-.09 2.785-.82 2.843-2.37.055-1.502-.977-2.566-2.641-3.278-.534-.229-1.1-.406-1.667-.54a9.722 9.722 0 00-.628-.128 2.676 2.676 0 00-5.32-.045 2.676 2.676 0 005.177 1.229c.168.03.334.064.5.103a8.848 8.848 0 011.471.475c1.263.54 1.952 1.252 1.92 2.141-.028.797-.6 1.165-1.718 1.225a7.319 7.319 0 01-1.559-.103 7.906 7.906 0 01-.403-.077c-.07-.014-.118-.027-.14-.032l-.055-.01a4.46 4.46 0 00-1.593.059c-.985.23-1.677.842-1.805 1.888-.28 2.254 1.403 3.299 4.928 3.374a2.677 2.677 0 005.116-1.458zM4.733 5.518a1.488 1.488 0 110-2.975 1.488 1.488 0 010 2.975zm6.544 8.925a1.489 1.489 0 110-2.978 1.489 1.489 0 010 2.978z"
                                        ></path>
                                    </svg>{" "}
                                    Evaluation
                                </span>
                            </button>
                            {/* </a> */}
                            {/* </Link> */}
                            {/* <Link href={`/project/${routes.slug}?tab=${routes.tab}`}> */}
                            <button
                                onClick={() => {
                                    handleNav("tab", routes.tab);
                                }}
                            >
                                <span
                                    className={`${
                                        isProgress
                                            ? "border-white opacity-100"
                                            : "border-transparent opacity-60"
                                    } ${LINK_CLASSES}`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="17"
                                        fill="none"
                                        viewBox="0 0 16 17"
                                    >
                                        <path
                                            fill="#fff"
                                            d="M14.714 13.5H2.428V2.359a.143.143 0 00-.143-.143h-1a.143.143 0 00-.142.143v12.285c0 .079.064.143.142.143h13.429a.143.143 0 00.143-.143v-1a.143.143 0 00-.143-.142zM4 12.073h1a.143.143 0 00.143-.143V9.358A.143.143 0 005 9.215H4a.143.143 0 00-.143.143v2.571c0 .079.064.143.143.143zm2.714 0h1a.143.143 0 00.143-.143V6.215a.143.143 0 00-.143-.143h-1a.143.143 0 00-.143.143v5.714c0 .079.064.143.143.143zm2.714 0h1a.143.143 0 00.143-.143V7.608a.143.143 0 00-.143-.143h-1a.143.143 0 00-.143.143v4.321c0 .079.065.143.143.143zm2.715 0h1a.143.143 0 00.142-.143V4.786a.143.143 0 00-.142-.143h-1a.143.143 0 00-.143.143v7.143c0 .079.064.143.143.143z"
                                        ></path>
                                    </svg>
                                    Progress
                                </span>
                            </button>
                            {/* </Link> */}
                        </nav>
                        <ToggleTheme />
                        <LoggedUser
                            picture={picture}
                            name={given_name.split(" ")[0]}
                            email={email}
                            auth={auth.auth}
                        />
                    </div>
                </div>
                <div
                    className={`bg-white dark:bg-slate-800 shadow-md px-5 py-3`}
                >
                    <div className="flex items-center gap-8 justify-between sm:justify-start">
                        <b className="hidden sm:inline">
                            {currentProject.name}
                        </b>
                        <svg
                            className="hidden sm:inline"
                            width="21"
                            height="54"
                            viewBox="0 0 21 54"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <line
                                x1="19.623"
                                y1="0.359609"
                                x2="0.469857"
                                y2="52.9824"
                                stroke="#C4C4C4"
                            />
                        </svg>

                        {!isProgress ? (
                            <>
                                <PlayerSelect compact={scrollY > 200} />
                                <ScoresObjWrapper>
                                    <JourneySelect compact={scrollY > 200} />
                                </ScoresObjWrapper>
                            </>
                        ) : (
                            <h2 className="text-2xl font-bold">Progress</h2>
                        )}
                    </div>
                </div>
            </header>
        );
    } else {
        setTimeout(() => {
            headerRef.current?.classList.add("transition-all");
            headerRef.current?.classList.remove("-translate-y-20");
            headerRef.current?.classList.remove("opacity-0");
        }, 500);

        return (
            <header
                ref={headerRef}
                className="z-10 fixed w-full top-0 -translate-y-20 opacity-0"
            >
                <div
                    className={`bg-white dark:bg-slate-800 shadow-md px-5 py-3 md:py-1`}
                >
                    <div className="flex items-center gap-8 justify-between sm:justify-start">
                        <b className="hidden sm:inline">
                            {currentProject.name}
                        </b>
                        <svg
                            className="hidden sm:inline"
                            width="21"
                            height="54"
                            viewBox="0 0 21 54"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <line
                                x1="19.623"
                                y1="0.359609"
                                x2="0.469857"
                                y2="52.9824"
                                stroke="#777777"
                            />
                        </svg>

                        {!isProgress ? (
                            <>
                                <PlayerSelect compact={true} />
                                <ScoresObjWrapper>
                                    <JourneySelect compact={true} />
                                </ScoresObjWrapper>
                            </>
                        ) : (
                            <h2 className="text-2xl font-bold">Progress</h2>
                        )}
                    </div>
                </div>
            </header>
        );
    }
}

export default React.memo(Header);
