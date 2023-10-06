function SearchBoxSimple({
    label,
    type,
    name,
    id,
    autoComplete,
    accessKey,
    placeholder,
    disabled,
    onInputChange,
    onItemClick,
    onFocus,
    inputRefference,
    resultRefference,
    srOnlyIconText,
    collection,
}) {
    return (
        <div>
            <div className="flex flex-col gap-1 flex-1 opacity-100">
                <label className="text-slate-500 font-bold">{label}</label>

                <div
                    className={`rounded flex items-center gap-2 pl-2 border-slate-300 border text-slate-500 w-full bg-white dark:bg-transparent `}
                >
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
                            ></path>
                        </svg>
                        <span className="sr-only">{srOnlyIconText}</span>
                    </label>
                    <input
                        className="h-10 p-2 rounded-md bg-transparent text-slate-500 w-full"
                        type={type}
                        name={name}
                        id={id}
                        autoComplete={autoComplete}
                        accessKey={accessKey}
                        placeholder={placeholder}
                        disabled={disabled}
                        onChange={onInputChange}
                        onFocus={onFocus}
                        ref={inputRefference}
                    />
                </div>
            </div>

            <div className="flex items-end content-end  relative">
                {collection?.length > 0 ? (
                    <ul
                        className="absolute flex flex-col top-[0px] left-1/2 -ml-[300px] w-[600px]  bg-white shadow-2xl "
                        ref={resultRefference}
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
        </div>
    );
}

export default SearchBoxSimple;
