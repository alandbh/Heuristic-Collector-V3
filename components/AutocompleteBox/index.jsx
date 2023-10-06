function AutocompleteBox({ collection, refference, onItemClick }) {
    return (
        <div className="flex items-end content-end  relative">
            {collection?.length > 0 ? (
                <ul
                    className="absolute flex flex-col top-[0px] left-1/2 -ml-[300px] w-[600px]  bg-white shadow-2xl "
                    ref={refference}
                >
                    {collection.map((item, index) => {
                        return (
                            <li className="w-full" key={index}>
                                <button
                                    onClick={() =>
                                        onItemClick(
                                            item.item.heuristicNumber,
                                            item.item.name
                                        )
                                    }
                                    className="flex flex-1 w-full gap-2 text-left py-4 px-4 bg-white focus:bg-blue-50 focus:outline-blue-200"
                                    tabIndex={0}
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
    );
}

export default AutocompleteBox;
