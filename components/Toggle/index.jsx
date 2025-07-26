import { useEffect, useState } from "react";

function Toggle({ onChange, selected, disable = false }) {
    const [option, setOption] = useState(selected);

    useEffect(() => {
        setOption(selected);
    }, [selected]);

    function handleOnChange(ev) {
        console.log(ev.target.checked);
        console.log(!ev.target.checked);
        setOption(!ev.target.checked);
        onChange(!ev.target.checked);
        return;
    }

    function getBubblePosition() {
        if (option) {
            return "translate-x-[29px]";
        } else {
            return "translate-x-[3px]";
        }
    }

    return (
        <>
            <div
                className={`wrapper flex  w-fit border  dark:border-white/60 h-[34px] rounded-full relative ${
                    option ? "bg-green-300" : "bg-transparent border-blue-300"
                }`}
            >
                <div
                    className={`bubble z-0 transition duration-300 rounded-full top-[2px] w-[28px] h-[28px] border  ${
                        option ? "bg-white" : "bg-blue-100 border-blue-500"
                    } bg-blue-100 absolute ${getBubblePosition()}`}
                ></div>
                <div
                    className={`container flex w-[60px] justify-between z-10 dark:text-white/60`}
                >
                    <label
                        style={{ flex: "0 0 60px" }}
                        className="flex w-[44px] h-[34px] items-center justify-center cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            className="sr-only"
                            name="worktype"
                            value={option}
                            onChange={(ev) => handleOnChange(ev)}
                            disabled={disable}
                        />
                    </label>
                </div>
            </div>
        </>
    );
}

export { Toggle };
