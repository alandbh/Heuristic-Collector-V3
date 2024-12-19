import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Sidenav from "../../components/Dash2/Sidenav";
import useAllProjectScores from "../../lib/dash2/useAllProjectScores";
import SearchBoxSimple from "../../components/SearchBoxSimple";
import Select from "../../components/Select";

// import { Container } from './styles';

function dash2() {
    const [selectedHeuristic, setSelectedHeuristic] = useState({
        heuristicNumber: "",
        name: "",
    });
    const router = useRouter();
    const { project } = router.query;

    const { currentProjectObj, heuristics, previousProjectObj } =
        useAllProjectScores(project);
    console.log("allProjectScores", currentProjectObj, heuristics);

    function handleClickHeuristic(item) {
        setSelectedHeuristic({
            heuristicNumber: item.item.heuristicNumber,
            name: item.item.name,
        });

        router.replace({
            query: {
                ...router.query,
                heuristic: item.item.heuristicNumber,
            },
        });
    }

    function handleSelectPlayer(ev) {
        router.replace({
            query: {
                ...router.query,
                showPlayer: ev.target.value,
            },
        });
    }

    if (!heuristics || !currentProjectObj) {
        return null;
    }

    return (
        <div className="bg-slate-100/70 dark:bg-slate-800/50 h-screen">
            <div className="flex">
                <Sidenav />

                <main className="pt-5 px-8 min-h-[calc(100vh_-_126px)] flex flex-col items-center">
                    <div className="w-[864px] mx-auto flex flex-col">
                        <h1>
                            Dashboard v2: <b>{currentProjectObj?.name}</b>
                        </h1>
                    </div>
                    <div className="w-[864px] mx-auto flex flex-col">
                        <div className="flex w-full gap-10 mt-10">
                            <div className="flex-1">
                                <SearchBoxSimple
                                    label="Find the heuristic"
                                    type="search"
                                    name="search"
                                    id="search"
                                    autoComplete="off"
                                    accessKey="s"
                                    disabled={!heuristics}
                                    onItemClick={handleClickHeuristic}
                                    collection={heuristics}
                                    srOnlyIconText="Search for heuristics"
                                    placeholder="type the number or the name of the heuristic"
                                    filterBy={["name", "heuristicNumber"]}
                                />
                            </div>

                            <div>
                                <Select
                                    label="Select a player to highlight it"
                                    disabled={false}
                                    onChange={(ev) => handleSelectPlayer(ev)}
                                    defaultValue={router.query.showPlayer}
                                    options={currentProjectObj.players}
                                    id="playerSelect"
                                />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default dash2;
