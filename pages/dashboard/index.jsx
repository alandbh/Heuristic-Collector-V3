import { useRouter } from "next/router";
import { useEffect, useState, useCallback, useRef } from "react";
import { gql } from "@apollo/client";
import { saveSvgAsPng } from "save-svg-as-png";
import client from "../../lib/apollo";
import Fuse from "fuse.js";
import Debugg from "../../lib/Debugg";

// import { bancoDoBrasil } from "./edition2021/banco-do-brasil";
import { prevScores } from "./edition2021/prevScores";

import BarChart from "../../components/BarChart";
import CompareBar from "../../components/CompareBar";

const QUERY_HEURISTICS = gql`
    query GetAllHeuristics($projectSlug: String) {
        heuristics(last: 10000, where: { project: { slug: $projectSlug } }) {
            name
            heuristicNumber
            journeys {
                slug
                name
            }
        }
    }
`;

const QUERY_JOURNEYS = gql`
    query GetAllJourneys($projectSlug: String) {
        journeys(first: 1000, where: { project: { slug: $projectSlug } }) {
            name
            slug
        }
    }
`;

const QUERY_PLAYERS = gql`
    query GetAllPlayers($projectSlug: String) {
        players(first: 10000, where: { project: { slug: $projectSlug } }) {
            name
            slug
        }
    }
`;

function Dashboard() {
    const router = useRouter();
    const { project, heuristic, showPlayer, journey } = router.query;
    const [allScores, setAllScores] = useState(null);
    const [allHeuristics, setAllHeuristics] = useState(null);
    const [allJourneys, setAllJourneys] = useState(null);
    const [allPlayers, setAllPlayers] = useState(null);
    const [currentJourney, setCurrentJourney] = useState(null);
    const [heuristicsByJourney, setHeuristicsByJourney] = useState(null);
    const [selectedHeuristic, setSelectedHeuristic] = useState(null);
    const [result, setResult] = useState([]);
    const [svgCopied, setSVGCopied] = useState(false);
    const [pngSrc, setPngSrc] = useState(null);
    const inputRef = useRef(null);
    const chartRef = useRef(null);

    function fetchAllScores(project, journey, heuristic, showPlayer) {
        fetch(
            `/api/all?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}`
        ).then((data) => {
            data.json().then((result) => {
                setAllScores(result);
            });
        });
    }

    const getHeuristics = useCallback(() => {
        const variables = {
            projectSlug: router.query.project,
        };

        // Not using clientFast in order to not cache results
        client
            .query({
                query: QUERY_HEURISTICS,
                variables,
                fetchPolicy: "network-only",
            })
            .then(({ data }) => {
                setAllHeuristics(data.heuristics);
            });
    }, [router]);

    const getJourneys = useCallback(() => {
        if (router.query.project !== undefined) {
            const variables = {
                projectSlug: router.query.project,
            };
            console.log({ variables });
            client
                .query({
                    query: QUERY_JOURNEYS,
                    variables,
                    fetchPolicy: "network-only",
                })
                .then(({ data }) => {
                    setAllJourneys(data.journeys);
                });
        }
    }, [router.query.project]);

    const getPlayers = useCallback(() => {
        if (router.query.project !== undefined) {
            const variables = {
                projectSlug: router.query.project,
            };
            client
                .query({
                    query: QUERY_PLAYERS,
                    variables,
                    fetchPolicy: "network-only",
                })
                .then(({ data }) => {
                    setAllPlayers(data.players);
                });
        }
    }, [router.query.project]);

    useEffect(() => {
        fetchAllScores(project, journey, heuristic, showPlayer);
        getHeuristics();
        getJourneys();
        getPlayers();
    }, [
        project,
        heuristic,
        showPlayer,
        journey,
        getHeuristics,
        getJourneys,
        getPlayers,
    ]);

    useEffect(() => {
        if (router.query.journey !== undefined) {
            setCurrentJourney(router.query.journey);
        }

        setSelectedHeuristic(null);
        // if (router.query.showPlayer !== undefined) {
        //     setCurrentPlayer(router.query.showPlayer);
        // }
        if (
            router.query.heuristic !== undefined &&
            router.query.heuristic !== "" &&
            allHeuristics !== null &&
            heuristicsByJourney !== null &&
            heuristicsByJourney !== undefined
        ) {
            const currentHeuristicByUrl = heuristicsByJourney.filter(
                (heuristic) => {
                    return heuristic.heuristicNumber === router.query.heuristic;
                }
            );
            console.log({ allHeuristics });
            setSelectedHeuristic(currentHeuristicByUrl[0]);
        }
    }, [
        router.query.journey,
        allHeuristics,
        router.query.heuristic,
        router.query.showPlayer,
        heuristicsByJourney,
    ]);
    // useEffect(() => {
    //     if (allScores !== null) {
    //         console.log("allScores", allScores);
    //     }
    // }, [allScores]);

    useEffect(() => {
        console.log({ allHeuristics });
    }, [allHeuristics]);

    useEffect(() => {
        const heuristicsByJourney = allHeuristics?.filter((heuristic) => {
            // Filtering the heuristics by the current journey and if journey is empty.
            return (
                heuristic.journeys.filter(
                    (journey) => journey.slug === currentJourney
                ).length > 0
            );
        });

        if (inputRef.current !== null) {
            inputRef.current.value = "";
            setResult([]);
        }

        setHeuristicsByJourney(heuristicsByJourney);
    }, [currentJourney, allHeuristics]);

    if (
        allScores === null ||
        allHeuristics === null ||
        allJourneys === null ||
        allPlayers === null ||
        heuristicsByJourney === null
    ) {
        return null;
    }

    function handleSelectJourney(ev) {
        console.log("Journey", ev.target.value);
        setResult([]);
        setSelectedHeuristic(null);

        setCurrentJourney(ev.target.value);
        router.replace({
            query: {
                ...router.query,
                journey: ev.target.value,
                heuristic: null,
            },
        });
    }
    function handleSelectPlayer(ev) {
        console.log("Player", ev.target.value);

        // setCurrentPlayer(ev.target.value);
        router.replace({
            query: {
                ...router.query,
                showPlayer: ev.target.value,
            },
        });
        setResult([]);
        // setSelectedHeuristic(null);
    }

    // function getPlayerObj(playerSlug) {
    //     // console.log({ allPlayers });
    //     const playerObj = allScores.scores_by_heuristic.filter((player) => {
    //         return player.playerSlug === playerSlug;
    //     });

    //     console.log(playerObj[0]);

    //     return playerObj[0];
    // }

    // function getPreviousScoreByPlayer(player) {
    //     return prevScores[showPlayer][router.query.journey].find(
    //         (score) => score.id === Number(selectedHeuristic.heuristicNumber)
    //     );
    // }

    // function getCurrentYear() {
    //     const currentDate = new Date();

    //     return currentDate.getFullYear();
    // }

    const options = {
        includeScore: true,
        keys: ["name", "heuristicNumber"],
        minMatchCharLength: 2,
        threshold: 0.3,
        location: 0,
        distance: 2000,
    };

    const fuse = new Fuse(heuristicsByJourney, options);

    function handleSearch(ev) {
        console.log("heuristicsByJourney", fuse.search(ev.target.value));

        setResult(fuse.search(ev.target.value));
    }

    function handleClickHeuristic(heuristicNumber, name) {
        console.log({ heuristicNumber, name });
        // console.log(
        //     allHeuristics.filter(
        //         (heuristic) => heuristic["heuristicNumber"] === heuristicNumber
        //     )[0]
        // );
        setSelectedHeuristic({ heuristicNumber, name });
        setResult([]);

        router.replace({
            query: {
                ...router.query,
                heuristic: heuristicNumber,
            },
        });
    }

    function handleClickCopySvg() {
        navigator.clipboard.writeText(chartRef.current.outerHTML);
        setSVGCopied(true);

        setTimeout(() => {
            setSVGCopied(false);
        }, 6000);
    }

    function handleClickCopyPng() {
        let domUrl = window.URL || window.webkitURL || window;

        const svgText = chartRef.current.outerHTML;

        saveSvgAsPng(
            chartRef.current,
            `chart-${currentJourney}-h_${selectedHeuristic.heuristicNumber}-${router.query.showPlayer}.png`
        );
        return;

        /**
         * Caso seja necessário plotar o PNG na tela
         *
         * Remover o return acima
         */
        const svgBlob = new Blob([svgText], {
            type: "image/svg+xml;charset=utf-8",
        });

        const svgUrl = domUrl.createObjectURL(svgBlob);

        // create a canvas element to pass through
        let canvas = document.createElement("canvas");
        // width="901" height="340"
        canvas.width = 901;
        canvas.height = 340;
        let ctx = canvas.getContext("2d");

        // create a new image to hold it the converted type
        const img = new Image();

        // when the image is loaded we can get it as base64 url
        img.onload = function () {
            // draw it to the canvas
            ctx.drawImage(this, 0, 0);

            // if it needs some styling, we need a new canvas
            let styled = document.createElement("canvas");
            styled.width = canvas.width;
            styled.height = canvas.height;
            let styledCtx = styled.getContext("2d");
            styledCtx.save();
            // styledCtx.fillStyle = fill;
            styledCtx.fillRect(0, 0, canvas.width, canvas.height);
            styledCtx.strokeRect(0, 0, canvas.width, canvas.height);
            styledCtx.restore();
            styledCtx.drawImage(canvas, 0, 0);
            canvas = styled;

            // we don't need the original any more
            domUrl.revokeObjectURL(svgUrl);
            // now we can resolve the promise, passing the base64 url
            return canvas.toDataURL();
        };

        // load the image
        img.src = svgUrl;

        setPngSrc(svgUrl);
    }

    // Retrying to fectch the scores in case the api returns empty data
    if (allScores.average_score === null) {
        // fetchAllScores()
        fetchAllScores(project, journey, heuristic, showPlayer);
    }

    return (
        <div className="m-10">
            <div className="flex w-[800px] gap-10 mb-10">
                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-slate-500 font-bold">
                        Select a journey
                    </label>
                    <select
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(ev) => handleSelectJourney(ev)}
                        defaultValue={router.query.journey}
                    >
                        <option>...</option>
                        {allJourneys.map((journey) => {
                            return (
                                <option key={journey.slug} value={journey.slug}>
                                    {journey.name}
                                </option>
                            );
                        })}
                    </select>
                </div>

                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-slate-500 font-bold">
                        Find the heuristic
                    </label>
                    <input
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(e) => handleSearch(e)}
                        type="search"
                        name="search"
                        id="search"
                        autoComplete="off"
                        ref={inputRef}
                        accessKey="s"
                        placeholder={"Type something and select"}
                        tabIndex={1}
                    />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    <label className="text-slate-500 font-bold">
                        Select a player to highlight it
                    </label>

                    <select
                        className="border border-slate-300  block h-10 px-4 rounded-md"
                        onChange={(ev) => handleSelectPlayer(ev)}
                        defaultValue={router.query.showPlayer}
                    >
                        <option>...</option>
                        {allPlayers?.map((player) => {
                            return (
                                <option key={player.slug} value={player.slug}>
                                    {player.name}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
            <div className="flex items-end content-end w-[600px] relative">
                {result.length > 0 ? (
                    <ul className="absolute flex flex-col gap-3 top-[-20px] p-4 bg-white shadow-xl w-full">
                        {result.map((item, index) => {
                            return (
                                <li className="w-full" key={index}>
                                    <button
                                        onClick={() =>
                                            handleClickHeuristic(
                                                item.item.heuristicNumber,
                                                item.item.name
                                            )
                                        }
                                        className="flex flex-1 w-full gap-2 text-left py-2 bg-white"
                                        tabIndex={2}
                                    >
                                        <b className="block w-12 ">
                                            {item.item.heuristicNumber}
                                        </b>
                                        <span className="text-slate-500 flex-1">
                                            {item.item.name.substring(0, 130) +
                                                "..."}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    ""
                )}
            </div>
            {/* {<Debugg data={currentJourney} />} */}
            {/* {<Debugg data={heuristicsByJourney} />} */}
            {/* {<Debugg data={getPlayerObj(showPlayer).valuePrev} />} */}
            {/* {<Debugg data={allScores} />}  */}
            {/* {<Debugg data={showPlayer} />} */}

            {selectedHeuristic !== null ? (
                <div>
                    <div className="mb-10">
                        <h1 className="font-bold text-xl my-4">
                            Selected Heuristic
                        </h1>
                        <div className="flex gap-2 text-left">
                            <b>{selectedHeuristic?.heuristicNumber}</b>
                            <p className="w-[600px] text-slate-500">
                                {selectedHeuristic?.name}
                            </p>
                        </div>
                        <div className="flex gap-2 text-left mt-5">
                            <b>Average:</b>
                            <p className="w-[600px] text-slate-500">
                                {allScores.average_score}
                            </p>
                        </div>
                    </div>
                    <BarChart refDom={chartRef} allScores={allScores} />

                    <div className="mt-10 flex gap-10">
                        <button
                            className="border border-blue-300 h-10 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400"
                            onClick={handleClickCopySvg}
                        >
                            {svgCopied ? "✅ SVG Copied" : "Copy as SVG"}
                        </button>
                        <button
                            className="border border-blue-300 h-10 rounded px-6 hover:bg-blue-100 hover:text-blue-600 text-blue-400"
                            onClick={handleClickCopyPng}
                        >
                            Export as a PNG file
                        </button>
                    </div>

                    <div className="mt-10 mb-[200px] flex gap-10">
                        {selectedHeuristic &&
                        showPlayer &&
                        router.query.journey ? (
                            <CompareBar
                                showPlayer={showPlayer}
                                allScores={allScores}
                                prevScores={prevScores}
                                currentJourney={router.query.journey}
                                selectedHeuristic={selectedHeuristic}
                            />
                        ) : null}
                    </div>

                    {/* <svg
                        width="453"
                        height="342"
                        viewBox="0 0 453 342"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g>
                            <rect
                                x={33}
                                y={
                                    46 +
                                    (192 -
                                        (192 / 5) *
                                            getPreviousScoreByPlayer(showPlayer)
                                                .scoreValuePrev)
                                }
                                height={
                                    192 -
                                    (192 -
                                        (192 / 5) *
                                            getPreviousScoreByPlayer(showPlayer)
                                                .scoreValuePrev)
                                }
                                width="35"
                                fill="#666666"
                                style={{ borderRadius: "10px" }}
                                rx={7}
                            />

                            <rect
                                x={125}
                                y={
                                    46 +
                                    (192 -
                                        (192 / 5) *
                                            getPreviousScoreByPlayer(showPlayer)
                                                .averageScoreValuePrev) +
                                    2
                                }
                                height={
                                    192 -
                                    3 -
                                    (192 -
                                        (192 / 5) *
                                            getPreviousScoreByPlayer(showPlayer)
                                                .averageScoreValuePrev)
                                }
                                width="35"
                                stroke="#9AA0A6"
                                strokeWidth="2"
                                rx={7}
                                // style={{ strokeDasharray: `${192 * 1},35` }}
                            />

                            <line
                                className="linha inferior ano anterior"
                                y1="237"
                                x2="187"
                                y2="237"
                                stroke="#9AA0A6"
                                strokeWidth="2"
                            />
                            <text
                                x="50"
                                y="264"
                                textAnchor="middle"
                                style={{ fontWeight: "bold", fontSize: 24 }}
                                fill="#9AA0A6"
                            >
                                {
                                    getPreviousScoreByPlayer(showPlayer)
                                        .scoreValuePrev
                                }
                            </text>
                            <text
                                x="140"
                                y="264"
                                textAnchor="middle"
                                style={{ fontWeight: "bold", fontSize: 24 }}
                                fill="#9AA0A6"
                            >
                                {
                                    getPreviousScoreByPlayer(showPlayer)
                                        .averageScoreValuePrev
                                }
                            </text>

                            <text
                                x="90"
                                y="20"
                                textAnchor="middle"
                                style={{ fontWeight: "bold", fontSize: 24 }}
                                fill="#9AA0A6"
                            >
                                2021
                            </text>
                        </g>
                        <g>
                            <rect
                                x={33 + 230}
                                y={
                                    46 +
                                    (192 -
                                        (192 / 5) *
                                            getPlayerObj(showPlayer).value)
                                }
                                height={
                                    192 -
                                    (192 -
                                        (192 / 5) *
                                            getPlayerObj(showPlayer).value)
                                }
                                width="35"
                                fill="#666666"
                                style={{ borderRadius: "10px" }}
                                rx={7}
                            />

                            <rect
                                x={125 + 230}
                                y={
                                    46 +
                                    (192 -
                                        (192 / 5) * allScores.average_score) +
                                    2
                                }
                                height={
                                    192 -
                                    3 -
                                    (192 - (192 / 5) * allScores.average_score)
                                }
                                width="35"
                                stroke="#9AA0A6"
                                strokeWidth="2"
                                rx={7}
                                // style={{ strokeDasharray: `${192 * 1},35` }}
                            />

                            <line
                                x1="227"
                                y1="237"
                                x2="414"
                                y2="237"
                                stroke="#9AA0A6"
                                strokeWidth="2"
                            />
                            <text
                                x={50 + 230}
                                y="264"
                                textAnchor="middle"
                                style={{ fontWeight: "bold", fontSize: 24 }}
                                fill="#9AA0A6"
                            >
                                {getPlayerObj(showPlayer).value}
                            </text>
                            <text
                                x={140 + 230}
                                y="264"
                                textAnchor="middle"
                                style={{ fontWeight: "bold", fontSize: 24 }}
                                fill="#9AA0A6"
                            >
                                {allScores.average_score}
                            </text>

                            <text
                                x={90 + 230}
                                y="20"
                                textAnchor="middle"
                                style={{ fontWeight: "bold", fontSize: 24 }}
                                fill="#9AA0A6"
                            >
                                {getCurrentYear()}
                            </text>
                        </g>
                        <g>
                            <path
                                className="media estudo"
                                d="M297.699 338V320.82H302.891L306.008 332.539L309.09 320.82H314.293V338H311.07V324.477L307.66 338H304.32L300.922 324.477V338H297.699ZM324.922 334.039L328.203 334.59C327.781 335.793 327.113 336.711 326.199 337.344C325.293 337.969 324.156 338.281 322.789 338.281C320.625 338.281 319.023 337.574 317.984 336.16C317.164 335.027 316.754 333.598 316.754 331.871C316.754 329.809 317.293 328.195 318.371 327.031C319.449 325.859 320.812 325.273 322.461 325.273C324.312 325.273 325.773 325.887 326.844 327.113C327.914 328.332 328.426 330.203 328.379 332.727H320.129C320.152 333.703 320.418 334.465 320.926 335.012C321.434 335.551 322.066 335.82 322.824 335.82C323.34 335.82 323.773 335.68 324.125 335.398C324.477 335.117 324.742 334.664 324.922 334.039ZM325.109 330.711C325.086 329.758 324.84 329.035 324.371 328.543C323.902 328.043 323.332 327.793 322.66 327.793C321.941 327.793 321.348 328.055 320.879 328.578C320.41 329.102 320.18 329.812 320.188 330.711H325.109ZM320.902 324.031L322.52 320.527H326.211L322.988 324.031H320.902ZM342.488 338H339.43V336.172C338.922 336.883 338.32 337.414 337.625 337.766C336.938 338.109 336.242 338.281 335.539 338.281C334.109 338.281 332.883 337.707 331.859 336.559C330.844 335.402 330.336 333.793 330.336 331.73C330.336 329.621 330.832 328.02 331.824 326.926C332.816 325.824 334.07 325.273 335.586 325.273C336.977 325.273 338.18 325.852 339.195 327.008V320.82H342.488V338ZM333.699 331.508C333.699 332.836 333.883 333.797 334.25 334.391C334.781 335.25 335.523 335.68 336.477 335.68C337.234 335.68 337.879 335.359 338.41 334.719C338.941 334.07 339.207 333.105 339.207 331.824C339.207 330.395 338.949 329.367 338.434 328.742C337.918 328.109 337.258 327.793 336.453 327.793C335.672 327.793 335.016 328.105 334.484 328.73C333.961 329.348 333.699 330.273 333.699 331.508ZM345.746 323.867V320.82H349.039V323.867H345.746ZM345.746 338V325.555H349.039V338H345.746ZM354.887 329.352L351.898 328.812C352.234 327.609 352.812 326.719 353.633 326.141C354.453 325.562 355.672 325.273 357.289 325.273C358.758 325.273 359.852 325.449 360.57 325.801C361.289 326.145 361.793 326.586 362.082 327.125C362.379 327.656 362.527 328.637 362.527 330.066L362.492 333.91C362.492 335.004 362.543 335.812 362.645 336.336C362.754 336.852 362.953 337.406 363.242 338H359.984C359.898 337.781 359.793 337.457 359.668 337.027C359.613 336.832 359.574 336.703 359.551 336.641C358.988 337.188 358.387 337.598 357.746 337.871C357.105 338.145 356.422 338.281 355.695 338.281C354.414 338.281 353.402 337.934 352.66 337.238C351.926 336.543 351.559 335.664 351.559 334.602C351.559 333.898 351.727 333.273 352.062 332.727C352.398 332.172 352.867 331.75 353.469 331.461C354.078 331.164 354.953 330.906 356.094 330.688C357.633 330.398 358.699 330.129 359.293 329.879V329.551C359.293 328.918 359.137 328.469 358.824 328.203C358.512 327.93 357.922 327.793 357.055 327.793C356.469 327.793 356.012 327.91 355.684 328.145C355.355 328.371 355.09 328.773 354.887 329.352ZM359.293 332.023C358.871 332.164 358.203 332.332 357.289 332.527C356.375 332.723 355.777 332.914 355.496 333.102C355.066 333.406 354.852 333.793 354.852 334.262C354.852 334.723 355.023 335.121 355.367 335.457C355.711 335.793 356.148 335.961 356.68 335.961C357.273 335.961 357.84 335.766 358.379 335.375C358.777 335.078 359.039 334.715 359.164 334.285C359.25 334.004 359.293 333.469 359.293 332.68V332.023ZM372.488 338V320.82H385.227V323.727H375.957V327.535H384.582V330.43H375.957V335.105H385.555V338H372.488ZM387.312 334.449L390.617 333.945C390.758 334.586 391.043 335.074 391.473 335.41C391.902 335.738 392.504 335.902 393.277 335.902C394.129 335.902 394.77 335.746 395.199 335.434C395.488 335.215 395.633 334.922 395.633 334.555C395.633 334.305 395.555 334.098 395.398 333.934C395.234 333.777 394.867 333.633 394.297 333.5C391.641 332.914 389.957 332.379 389.246 331.895C388.262 331.223 387.77 330.289 387.77 329.094C387.77 328.016 388.195 327.109 389.047 326.375C389.898 325.641 391.219 325.273 393.008 325.273C394.711 325.273 395.977 325.551 396.805 326.105C397.633 326.66 398.203 327.48 398.516 328.566L395.41 329.141C395.277 328.656 395.023 328.285 394.648 328.027C394.281 327.77 393.754 327.641 393.066 327.641C392.199 327.641 391.578 327.762 391.203 328.004C390.953 328.176 390.828 328.398 390.828 328.672C390.828 328.906 390.938 329.105 391.156 329.27C391.453 329.488 392.477 329.797 394.227 330.195C395.984 330.594 397.211 331.082 397.906 331.66C398.594 332.246 398.938 333.062 398.938 334.109C398.938 335.25 398.461 336.23 397.508 337.051C396.555 337.871 395.145 338.281 393.277 338.281C391.582 338.281 390.238 337.938 389.246 337.25C388.262 336.562 387.617 335.629 387.312 334.449ZM407.539 325.555V328.18H405.289V333.195C405.289 334.211 405.309 334.805 405.348 334.977C405.395 335.141 405.492 335.277 405.641 335.387C405.797 335.496 405.984 335.551 406.203 335.551C406.508 335.551 406.949 335.445 407.527 335.234L407.809 337.789C407.043 338.117 406.176 338.281 405.207 338.281C404.613 338.281 404.078 338.184 403.602 337.988C403.125 337.785 402.773 337.527 402.547 337.215C402.328 336.895 402.176 336.465 402.09 335.926C402.02 335.543 401.984 334.77 401.984 333.605V328.18H400.473V325.555H401.984V323.082L405.289 321.16V325.555H407.539ZM418.016 338V336.137C417.562 336.801 416.965 337.324 416.223 337.707C415.488 338.09 414.711 338.281 413.891 338.281C413.055 338.281 412.305 338.098 411.641 337.73C410.977 337.363 410.496 336.848 410.199 336.184C409.902 335.52 409.754 334.602 409.754 333.43V325.555H413.047V331.273C413.047 333.023 413.105 334.098 413.223 334.496C413.348 334.887 413.57 335.199 413.891 335.434C414.211 335.66 414.617 335.773 415.109 335.773C415.672 335.773 416.176 335.621 416.621 335.316C417.066 335.004 417.371 334.621 417.535 334.168C417.699 333.707 417.781 332.586 417.781 330.805V325.555H421.074V338H418.016ZM435.91 338H432.852V336.172C432.344 336.883 431.742 337.414 431.047 337.766C430.359 338.109 429.664 338.281 428.961 338.281C427.531 338.281 426.305 337.707 425.281 336.559C424.266 335.402 423.758 333.793 423.758 331.73C423.758 329.621 424.254 328.02 425.246 326.926C426.238 325.824 427.492 325.273 429.008 325.273C430.398 325.273 431.602 325.852 432.617 327.008V320.82H435.91V338ZM427.121 331.508C427.121 332.836 427.305 333.797 427.672 334.391C428.203 335.25 428.945 335.68 429.898 335.68C430.656 335.68 431.301 335.359 431.832 334.719C432.363 334.07 432.629 333.105 432.629 331.824C432.629 330.395 432.371 329.367 431.855 328.742C431.34 328.109 430.68 327.793 429.875 327.793C429.094 327.793 428.438 328.105 427.906 328.73C427.383 329.348 427.121 330.273 427.121 331.508ZM438.406 331.602C438.406 330.508 438.676 329.449 439.215 328.426C439.754 327.402 440.516 326.621 441.5 326.082C442.492 325.543 443.598 325.273 444.816 325.273C446.699 325.273 448.242 325.887 449.445 327.113C450.648 328.332 451.25 329.875 451.25 331.742C451.25 333.625 450.641 335.188 449.422 336.43C448.211 337.664 446.684 338.281 444.84 338.281C443.699 338.281 442.609 338.023 441.57 337.508C440.539 336.992 439.754 336.238 439.215 335.246C438.676 334.246 438.406 333.031 438.406 331.602ZM441.781 331.777C441.781 333.012 442.074 333.957 442.66 334.613C443.246 335.27 443.969 335.598 444.828 335.598C445.688 335.598 446.406 335.27 446.984 334.613C447.57 333.957 447.863 333.004 447.863 331.754C447.863 330.535 447.57 329.598 446.984 328.941C446.406 328.285 445.688 327.957 444.828 327.957C443.969 327.957 443.246 328.285 442.66 328.941C442.074 329.598 441.781 330.543 441.781 331.777Z"
                                fill="#434343"
                            />
                            <circle
                                cx="278.5"
                                cy="330.5"
                                r="8.5"
                                stroke="#9AA0A6"
                                strokeWidth="2"
                            />
                        </g>
                    </svg> */}

                    {/* <button onClick={handleClickCopySvg}>Copy as SVG</button> */}
                </div>
            ) : currentJourney ? (
                <p>Please, find and select the heuristic</p>
            ) : (
                <p>Please, select a Journey</p>
            )}
        </div>
    );
}

export default Dashboard;
