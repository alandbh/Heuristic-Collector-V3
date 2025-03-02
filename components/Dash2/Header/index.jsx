import Debugg from "../../../lib/Debugg";
import SearchBoxSimple from "../../SearchBoxSimple";
import Select from "../../Select";

function Header({
    currentProjectObj,
    currentJourney,
    heuristics,
    handleClickHeuristic,
    handleSelectPlayer,
    handleSelectJourney,
    router,
    isRetail,
    dark,
}) {
    let collection;

    if (!isRetail) {
        collection = heuristics.filter((heuristic) =>
            heuristic.journeys.some(
                (journey) => journey.slug === currentJourney
            )
        );
    } else {
        collection = heuristics;
    }

    return (
        <>
            <div className="w-[864px] mx-auto flex flex-col">
                <h1 className={dark ? "text-slate-200" : "text-slate-500"}>
                    Dashboard v2:{" "}
                    {/* <b>{"(Only For The Golden Alecrin: Alkosto 🍁)"}</b> */}
                </h1>
            </div>
            <div className="w-[864px] mx-auto flex flex-col">
                <div className="flex w-full gap-10 mt-10">
                    {!isRetail && (
                        <div>
                            <Select
                                label="Select a journey"
                                disabled={isRetail}
                                onChange={(ev) => handleSelectJourney(ev)}
                                defaultValue={router.query.journey}
                                options={currentProjectObj.journeys}
                                id="journeySelect"
                                dark={dark}
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <SearchBoxSimple
                            label="Find the heuristic"
                            type="search"
                            name="search"
                            id="search"
                            autoComplete="off"
                            accessKey="s"
                            disabled={!collection.length > 0}
                            onItemClick={handleClickHeuristic}
                            collection={collection}
                            srOnlyIconText="Search for heuristics"
                            placeholder="type the number or the name of the heuristic"
                            filterBy={["name", "heuristicNumber"]}
                            dark={dark}
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
                            dark={dark}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;
