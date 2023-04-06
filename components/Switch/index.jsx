import { useState } from "react";

function Switch({ onChange, options, selected, disable = false }) {
    const [option, setOption] = useState(selected);

    function handleOnChange(ev) {
        setOption(ev.target.value);
        onChange(ev.target.value);
    }

    function getBubblePosition() {
        if (option === options[0]) {
            return "translate-x-[2px] w-[100px] bg-red-500";
        } else if (option === options[1]) {
            return "translate-x-[102px] w-[100px] bg-red-300";
        } else if (option === options[2]) {
            return "translate-x-[204px] w-[100px] bg-orange-300";
        } else {
            return "translate-x-[306px] w-[100px] bg-green-300";
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
                    className={`bubble z-0 transition duration-200 rounded-full top-[2px] h-[26px] absolute ${getBubblePosition()}`}
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

function SwitchMono({ onChange, options, selected, disable = false }) {
    const [option, setOption] = useState(selected);

    console.log("options", options);

    function handleOnChangeMono(ev) {
        console.log(ev.target.value);
        setOption(ev.target.value);
        onChange(ev.target.value);
    }

    function getBubblePosition() {
        if (option === options[0]) {
            return "translate-x-[2px] w-[150px] border border-blue-500 bg-blue-100";
        } else if (option === options[1]) {
            return "translate-x-[152px] w-[150px] border border-blue-500 bg-blue-100";
        } else if (option === options[2]) {
            return "translate-x-[302px] w-[150px] border border-blue-500 bg-blue-100";
        } else if (option === options[3]) {
            return "translate-x-[452px] w-[150px] border border-blue-500 bg-blue-100";
        } else if (option === options[4]) {
            return "translate-x-[602px] w-[150px] border border-blue-500 bg-blue-100";
        } else if (option === options[5]) {
            return "translate-x-[752px] w-[150px] border border-blue-500 bg-blue-100";
        } else {
            return "translate-x-[902px] w-[150px] border border-blue-500 bg-blue-100";
        }
    }

    return (
        <>
            <div className="h-12 overflow-x-scroll w-full lg:overflow-x-visible  rounded-full flex items-center switch-scroll">
                <div className="wrapper flex  w-fit border dark:border-white/60 h-8 rounded-full relative">
                    <div
                        className={`bubble z-0 transition duration-300 rounded-full top-[2px] h-[26px] absolute ${getBubblePosition()}`}
                    ></div>
                    <div
                        className={`container flex w-[${
                            options.length * 100
                        }px] justify-between items-center font-bold z-10  text-xs leading-8 uppercase dark:text-white/60`}
                    >
                        {options.map((_option, index) => (
                            <label
                                style={{ flex: "0 0 150px" }}
                                key={index}
                                className="flex w-[150px] items-center justify-center cursor-pointer"
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
                                    className={
                                        option === options[index]
                                            ? `text-blue-500`
                                            : `text-blue-500 dark:text-blue-100`
                                    }
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
