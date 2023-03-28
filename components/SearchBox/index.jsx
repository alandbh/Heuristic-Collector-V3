import React, { useState, useEffect, useRef } from "react";
import { Link as Scroll } from "react-scroll";
import { useProjectContext } from "../../context/project";
import Fuse from "fuse.js";

function SearchBox(data) {
    const [result, setResult] = useState([]);
    const [vw, setVw] = useState(1024);
    const { currentProject, currentPlayer, currentJourney } =
        useProjectContext();

    if (window !== undefined) {
        window.addEventListener("resize", function () {
            // viewport and full window dimensions will change
            setVw(window.innerWidth);
        });
    }

    useEffect(() => {
        if (window !== undefined) {
            setVw(window.innerWidth);
        }
    }, []);

    const options = {
        includeScore: true,
        keys: ["name", "description"],
        minMatchCharLength: 3,
        threshold: 0.3,
        location: 0,
        distance: 2000,
    };

    if (data && currentJourney) {
        const heuristicsByJourney = data.data.filter((heuristic) => {
            // Filtering the heuristics by the current journey and if journey is empty.
            return (
                heuristic.journeys.filter(
                    (journey) => journey.slug === currentJourney.slug
                ).length > 0 || heuristic.journeys.length === 0
            );
        });
        const fuse = new Fuse(heuristicsByJourney, options);

        // console.log("fuse", heuristicsByJourney);

        function handleSearch(term) {
            setResult(fuse.search(term));
        }
    }

    const inputRef = useRef(null);

    function getOffsetScroll() {
        if (scrollY > 200) {
            // return vw < 700 ? -120 : -20;
            // console.log("mais que 200");
            return vw < 700 ? -200 : -90;
        }
        // console.log("MENOS que 200");

        // return vw < 700 ? -210 : -210;
        return -210;
        // return vw < 700 ? -600 : -160;
    }

    function handleClick(id) {
        console.log("clicou", id);

        inputRef.current.value = "";
        setResult([]);

        const heuristicElement = document.getElementById(id);

        heuristicElement.classList.add(
            "bg-blue-100",
            "animate-pulse",
            "text-slate-700"
        );

        heuristicElement.style.boxShadow = "7px 0 0px 24px rgb(219, 234, 254)";

        setTimeout(() => {
            heuristicElement.classList.remove(
                "bg-blue-100",
                "animate-pulse",
                "text-slate-700"
            );
            heuristicElement.style.boxShadow = "none";
        }, 5000);
    }
    return (
        <>
            <div className="rounded-md flex items-center gap-2 pl-2 border-slate-200 border text-slate-500 w-full bg-white dark:bg-transparent">
                <label htmlFor="search">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M16.325 14.899L21.705 20.279C21.8941 20.4682 22.0003 20.7248 22.0002 20.9923C22.0001 21.2599 21.8937 21.5164 21.7045 21.7055C21.5153 21.8946 21.2587 22.0008 20.9912 22.0007C20.7236 22.0006 20.4671 21.8942 20.278 21.705L14.898 16.325C13.2897 17.5707 11.2673 18.1569 9.24214 17.9643C7.21699 17.7718 5.34124 16.815 3.99649 15.2886C2.65174 13.7622 1.939 11.7808 2.00326 9.74753C2.06753 7.71427 2.90396 5.78185 4.34242 4.34339C5.78087 2.90494 7.71329 2.0685 9.74656 2.00424C11.7798 1.93998 13.7612 2.65272 15.2876 3.99747C16.814 5.34222 17.7708 7.21796 17.9634 9.24312C18.1559 11.2683 17.5697 13.2907 16.324 14.899H16.325ZM10 16C11.5913 16 13.1174 15.3678 14.2427 14.2426C15.3679 13.1174 16 11.5913 16 9.99999C16 8.40869 15.3679 6.88257 14.2427 5.75735C13.1174 4.63213 11.5913 3.99999 10 3.99999C8.40871 3.99999 6.88259 4.63213 5.75737 5.75735C4.63215 6.88257 4.00001 8.40869 4.00001 9.99999C4.00001 11.5913 4.63215 13.1174 5.75737 14.2426C6.88259 15.3678 8.40871 16 10 16V16Z"
                            fill="currentColor"
                        />
                    </svg>
                    <span className="sr-only">Search for heuristics</span>
                </label>

                <input
                    className="h-10 p-2 rounded-md bg-transparent  text-slate-500 w-full"
                    onChange={(e) => handleSearch(e.target.value)}
                    type="search"
                    name="search"
                    id="search"
                    autoComplete="off"
                    ref={inputRef}
                    accessKey="s"
                />
            </div>
            <div className="px-1 relative">
                <ul className="bg-white shadow-md px-1 absolute z-10">
                    {result?.map((item, index) => (
                        <li
                            key={index}
                            className="block cursor-pointer w-full py-1 border-b-2"
                        >
                            <Scroll
                                activeClass="hover:text-blue-700"
                                className="py-1 px-4 w-full block text-slate-500 hover:text-slate-800 focus:bg-blue-100 focus:outline-none"
                                to={item.item.id}
                                spy={false}
                                smooth={true}
                                offset={getOffsetScroll()}
                                onClick={() => handleClick(item.item.id)}
                                tabIndex={0}
                                href={"#" + item.item.id}
                            >
                                <b className="text-blue-400">
                                    {item.item.name}
                                </b>
                                <span className=" block w-full mt-2 text-sm">
                                    {item.item.description.substring(0, 130)}...
                                </span>
                            </Scroll>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export default React.memo(SearchBox);
