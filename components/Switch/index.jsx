import { useEffect, useState } from "react";

function Switch({ onChange, options, selected, disable = false }) {
    const [option, setOption] = useState(selected);

    function handleOnChange(ev) {
        setOption(ev.target.value);
        onChange(ev.target.value);
    }

    function getBubbleStyle() {
        if (option === options[0]) {
            return {
                transform: "translateX(2px)",
                width: "100px",
                backgroundColor: "#ef4444"
            };
        } else if (option === options[1]) {
            return {
                transform: "translateX(102px)",
                width: "100px",
                backgroundColor: "#fca5a5"
            };
        } else if (option === options[2]) {
            return {
                transform: "translateX(204px)",
                width: "100px",
                backgroundColor: "#fdba74"
            };
        } else {
            return {
                transform: "translateX(306px)",
                width: "100px",
                backgroundColor: "#86efac"
            };
        }
    }

    return (
        <>
            <div
                className={`wrapper flex  w-fit border dark:border-white/60 h-8 rounded-full relative ${
                    disable && "opacity-50"
                }`}
            >
                <div
                    className="bubble z-0 transition duration-200 rounded-full absolute"
                    style={{
                        top: "2px",
                        height: "26px",
                        ...getBubbleStyle()
                    }}
                ></div>
                <div className="container flex w-[408px] justify-between items-center font-bold z-10  text-xs leading-8 uppercase dark:text-white/60">
                    <label
                        className={`flex w-[100px] items-center justify-center grow cursor-pointer ${
                            disable && "cursor-default"
                        }`}
                    >
                        <input
                            type="radio"
                            className="sr-only"
                            name="worktype"
                            value={options[0]}
                            checked={option === options[0]}
                            onChange={(ev) => handleOnChange(ev)}
                            disabled={disable}
                        />
                        <span
                            className={
                                option === options[0] ? "text-white/80" : ""
                            }
                        >
                            {options[0]}
                        </span>
                    </label>
                    <label
                        className={`flex w-[100px] items-center justify-center grow cursor-pointer ${
                            disable && "cursor-default"
                        }`}
                    >
                        <input
                            type="radio"
                            className="sr-only"
                            name="worktype"
                            value={options[1]}
                            checked={option === options[1]}
                            onChange={(ev) => handleOnChange(ev)}
                            disabled={disable}
                        />
                        <span
                            className={
                                option === options[1] ? "text-red-600" : ""
                            }
                        >
                            {options[1]}
                        </span>
                    </label>

                    <label
                        className={`flex w-[100px] items-center justify-center grow cursor-pointer ${
                            disable && "cursor-default"
                        }`}
                    >
                        <input
                            type="radio"
                            className="sr-only"
                            name="worktype"
                            value={options[2]}
                            checked={option === options[2]}
                            onChange={(ev) => handleOnChange(ev)}
                            disabled={disable}
                        />
                        <span
                            className={
                                option === options[2] ? "text-slate-900" : ""
                            }
                        >
                            {options[2]}
                        </span>
                    </label>

                    <label
                        className={`flex w-[100px] items-center justify-center grow cursor-pointer ${
                            disable && "cursor-default"
                        }`}
                    >
                        <input
                            type="radio"
                            className="sr-only"
                            name="worktype"
                            value={options[3]}
                            checked={option === options[3]}
                            onChange={(ev) => handleOnChange(ev)}
                            disabled={disable}
                        />
                        <span
                            className={
                                option === options[3] ? "text-slate-900" : ""
                            }
                        >
                            {options[3]}
                        </span>
                    </label>
                </div>
            </div>
        </>
    );
}

export default Switch;

/**
 *
 *
 *
 *
 */

function SwitchMono({ onChange, options, selected, width = 150, fontSize = 12, disable = false }) {
    const [option, setOption] = useState(selected);

    useEffect(() => {
        setOption(selected);
    }, [selected]);

    function handleOnChangeMono(ev) {
        console.log(ev.target.value);
        setOption(ev.target.value);
        onChange(ev.target.value);
        return ev;
    }

    function getBubbleStyle() {
        const bubbleWidth = width || 150;
        
        if (option === options[0]) {
            return {
                transform: "translateX(1px)",
                width: `${bubbleWidth}px`
            };
        } else if (option === options[1]) {
            return {
                transform: `translateX(${bubbleWidth + 0}px)`,
                width: `${bubbleWidth}px`
            };
        } else if (option === options[2]) {
            return {
                transform: `translateX(${(bubbleWidth * 2) + 0}px)`,
                width: `${bubbleWidth}px`
            };
        } else if (option === options[3]) {
            return {
                transform: `translateX(${(bubbleWidth * 3) + 0}px)`,
                width: `${bubbleWidth}px`
            };
        } else if (option === options[4]) {
            return {
                transform: `translateX(${(bubbleWidth * 4) + 0}px)`,
                width: `${bubbleWidth}px`
            };
        } else if (option === options[5]) {
            return {
                transform: `translateX(${(bubbleWidth * 5) + 0}px)`,
                width: `${bubbleWidth}px`
            };
        } else {
            return {
                transform: `translateX(${(bubbleWidth * 6) + 0}px)`,
                width: `${bubbleWidth}px`
            };
        }
    }

    return (
        <>
            <div className="h-12 overflow-x-scroll w-full lg:overflow-x-visible  rounded-full flex items-center switch-scroll">
                <div className="wrapper flex  w-fit border dark:border-white/60 h-8 rounded-full relative">
                    <div
                        className="bubble border border-blue-500 bg-blue-100 z-0 transition duration-300 rounded-full absolute"
                        style={{
                            top: "2px",
                            height: "26px",
                            ...getBubbleStyle()
                        }}
                    ></div>
                    <div
                        className={`container flex w-[${
                            options.length * 100
                        }px] justify-between items-center font-bold z-10  text-xs leading-8 uppercase dark:text-white/60`}
                    >
                        {options.map((_option, index) => (
                            <label
                                style={{ flex: `0 0 ${width}px` }}
                                key={index}
                                className={`flex w-[${width}px] items-center justify-center cursor-pointer`}
                            >
                                <input
                                    type="radio"
                                    className="sr-only"
                                    name="worktype"
                                    value={options[index]}
                                    checked={option === options[index]}
                                    onChange={(ev) => handleOnChangeMono(ev)}
                                    disabled={disable}
                                />
                                <span
                                    style={{
                                        fontSize: `${fontSize}px`
                                    }}
                                    className={`truncate w-full text-center px-2 ${
                                        option === options[index]
                                            ? `text-blue-500`
                                            : `text-blue-500 dark:text-blue-100`
                                    }`}
                                >
                                    {options[index]}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export { SwitchMono };
