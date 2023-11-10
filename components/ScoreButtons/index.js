import { useState } from "react";
import Spinner from "../Spinner";
import { useLongPress } from "@uidotdev/usehooks";

export default function ScoreButtons({
    id,
    scoreValue,
    onChangeScore,
    disabled,
    amoutOfButtons = 6,
}) {
    const [buttonActive, setButtonActive] = useState(null);
    const [hintMessage, setHintMessage] = useState("");

    const buttonsArray = Array.from(Array(amoutOfButtons).keys());

    function getButtonClass(buttonValue) {
        const baseStyle =
            "w-10 h-10 rounded-full font-bold hover:scale-125 focus:scale-125 focus:outline-none  transition ";

        const activeStyle = {
            0: "bg-slate-600 opacity-100 scale-125 text-white",
            1: "bg-red-700 opacity-100 scale-125 text-white",
            2: "bg-red-500 opacity-100 scale-125 text-white",
            3: "bg-orange-500 opacity-100 scale-125 text-white",
            4: "bg-green-400 opacity-100 scale-125 text-white",
            5: "bg-green-500 opacity-100 scale-125 text-white",
        };

        return buttonValue === scoreValue
            ? baseStyle + activeStyle[buttonValue]
            : baseStyle +
                  " bg-blue-100/50 opacity-70 text-blue-700 hover:opacity-100 focus:opacity-100 border border-2 border-blue-300";
    }

    const attrs = useLongPress(
        (event) => {
            onChangeScore(event.target.dataset.value);
            setButtonActive(null);
        },
        {
            onStart: (event) => setButtonActive(event.target.dataset.value),
            onFinish: (event) => console.log("Press Finished"),
            onCancel: (event) => setButtonActive(null),
            threshold: 2000,
        }
    );

    function handlePressShiftEnter(event) {
        if (
            event.key === "Enter" &&
            event.type === "keydown" &&
            event.shiftKey === true
        ) {
            onChangeScore(event.target.dataset.value);
            setButtonActive(null);
        }
    }

    function handleMouseOver(event) {
        if (event.type === "mouseover" && !event.target.disabled) {
            console.log("MOUSE OVER", { targert: event.target });
            setHintMessage("Press and hold to set a score");
        } else {
            setHintMessage("");
            console.log("MOUSE OuTTTTT");
        }
    }

    const lastButton =
        scoreValue !== amoutOfButtons - 1
            ? amoutOfButtons - 1
            : amoutOfButtons - 2;

    function handleOnFocus(event) {
        if (event.type === "focus") {
            setHintMessage("Press Shift + Enter do set a score");
        } else if (
            event.type === "blur" &&
            Number(event.target.dataset.value) === lastButton
        ) {
            console.log("FOCUS", event.target.dataset.value);
            setHintMessage("");
        }
    }

    // function handlePressingNumber(event) {
    //     const buttonValue = event.target.dataset.value;
    //     setButtonActive(buttonValue);
    //     const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    //     if (!isMobile) {
    //         handleHoldButton(event);
    //     } else if (event.type === "mouseup" && isMobile) {
    //         handleTouchEnd(event);
    //     }
    // }

    // function handleHoldButton(event) {
    //     const buttonValue = event.target.dataset.value;
    //     const delay = event.target.dataset.delay || 2000;
    //     console.log({ event });

    //     if (
    //         event.type === "mousedown" ||
    //         event.type === "touchstart" ||
    //         (event.key === "Enter" &&
    //             event.type === "keydown" &&
    //             event.shiftKey === true)
    //     ) {
    //         if (buttonTimeout) {
    //             buttonTimeout = null;
    //         }
    //         clearTimeout(buttonTimeout);
    //         buttonTimeout = setTimeout(() => {
    //             // setScore(buttonValue)
    //             console.log("MUDOUUUUU", buttonValue);
    //             onChangeScore(buttonValue);
    //             setButtonActive(null);
    //             clearButtonTimeout({ type: "timeout" });
    //             // handleChangeScore(buttonValue);
    //         }, delay);

    //         return;
    //     } else {
    //         clearButtonTimeout(event);
    //     }

    //     // console.log("SOLTAAA");
    //     // setButtonActive(null);
    //     // clearTimeout(buttonTimeout);

    //     // console.log("botao", event.type);
    // }
    // function clearButtonTimeout(event) {
    //     // if (event) {
    //     //     alert("CLEAR: " + event.type + " " + buttonTimeout);
    //     // } else {
    //     //     alert("CLEAR2: ");
    //     // }
    //     clearTimeout(buttonTimeout);
    //     console.log("SOLTAAA");
    //     setButtonActive(null);
    // }

    // // let initialTime = null;

    // function handleTouchStart(event) {
    //     // alert("start: " + event.type);
    //     setInitialTime(Date.now());

    //     const buttonValue = event.target.dataset.value;
    //     setButtonActive(buttonValue);
    // }

    // function handleTouchEnd(event) {
    //     // clearTimeout(mobileTimeout);

    //     const buttonValue = event.target.dataset.value;
    //     setButtonActive(null);

    //     if (Date.now() - initialTime > 2000) {
    //         // alert("end: " + event.type);
    //         // onChangeScore(buttonValue);
    //         setInitialTime(null);
    //         setValueTest(buttonValue);
    //         setButtonActive(null);
    //     }

    //     // clearTimeout(mobileTimeout);
    //     // mobileTimeout = setTimeout(() => {
    //     //     onChangeScore(buttonValue);
    //     //     setButtonActive(null);
    //     //     clearButtonTimeout({ type: "timeout" });
    //     // }, 4000);
    // }

    return (
        <div className="flex flex-col gap-0 my-4">
            <div
                onMouseOver={(ev) => handleMouseOver(ev)}
                onMouseOut={(ev) => handleMouseOver(ev)}
                className="flex gap-5"
                id={id}
            >
                {buttonsArray.map((item, index) => (
                    <div
                        key={index + "-button-" + new Date().getTime()}
                        className="my-4"
                    >
                        <div
                            className={`relative ${
                                index == buttonActive
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                        >
                            <Spinner
                                colorClass="blue-500"
                                radius={22}
                                thick={4}
                                className="absolute z-0 scale-125"
                            />
                        </div>
                        <button
                            onKeyDown={(ev) => handlePressShiftEnter(ev)}
                            onFocus={(ev) => handleOnFocus(ev)}
                            onBlur={(ev) => handleOnFocus(ev)}
                            onContextMenu={(ev) => ev.preventDefault()}
                            {...attrs}
                            data-value={index}
                            className={
                                getButtonClass(index) +
                                " " +
                                " z-1 relative top-1 left-1 select-none"
                            }
                            disabled={disabled || index == scoreValue}
                        >
                            {index}
                        </button>
                    </div>
                ))}

                {/* {<Debug data={buttonActive} />} */}
                {/* {<Debug data={valueTest} />} */}
            </div>

            <small className="text-slate-500 h-3 -mt-1">{hintMessage}</small>
        </div>
    );
}
