import React from "react";
import Switch, { SwitchMono } from "../Switch";
import Debug from "../Debug";

// import { Container } from './styles';

function MessageContainer({ ignored }) {
    const message = ignored
        ? "This journey is now ignored"
        : "Ignore this journey?";

    const classNames = ignored ? "text-red-500" : "";

    return <span className={classNames}>{message}</span>;
}

function Ignore({ onChange, isDisable = true, ignored = false }) {
    console.log("ignore disable", isDisable);
    function handleOnChange(value) {
        onChange(value);
    }
    return (
        <div className="mt-10">
            <header className="flex flex-col justify-between mb-6 items-center px-4 gap-3">
                <h1 className="text-xl font-bold flex flex-col items-center gap-2">
                    <span className="h-[5px] block bg-red-500 w-10 mb-1"></span>
                    <span className="text-red-500 font-mono">DANGER ZONE</span>
                </h1>
                <div className="text-lg flex items-center flex-col gap-5 border-dashed border-spacing-2 border-red-200 border-4 p-4">
                    <h1 className="text-xl font-bold flex flex-col items-center gap-2">
                        <MessageContainer ignored={ignored} />
                    </h1>
                    {/* <Debug data={ignored} /> */}
                    <p>
                        Sometimes we are unable to test some journeys. In this
                        case, we need to fulfill as many heuristics as possible
                        and mark the current journey to be ignored in further
                        processes.
                    </p>
                    <div className="flex items-center">
                        <SwitchMono
                            onChange={handleOnChange}
                            selected={ignored ? "Yes" : "No"}
                            options={["No", "Yes"]}
                            disable={isDisable}
                        />
                    </div>
                </div>
            </header>
        </div>
    );
}

export default Ignore;
