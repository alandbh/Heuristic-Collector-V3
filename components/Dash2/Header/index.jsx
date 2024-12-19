import SearchBoxSimple from "../../SearchBoxSimple";
import Select from "../../Select";

function Header({
    currentProjectObj,
    heuristics,
    handleClickHeuristic,
    handleSelectPlayer,
    router,
}) {
    return (
        <>
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
        </>
    );
}

export default Header;
