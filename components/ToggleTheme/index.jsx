import { useState, useEffect } from "react";

function ToggleTheme(props) {
    const [dark, setDark] = useState(false);
    const [focus, setFocus] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (localStorage.theme === "dark") {
                document.documentElement.classList.add("dark");
                setDark(true);
            } else {
                document.documentElement.classList.remove("dark");
                setDark(false);
            }
        }
    }, []);

    function handleChange() {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if (!dark) {
            setDark(true);
            // Whenever the user explicitly chooses dark mode
            localStorage.theme = "dark";
            document.documentElement.classList.add("dark");
            console.log("dark", true);
        } else {
            setDark(false);
            // Whenever the user explicitly chooses light mode
            localStorage.theme = "light";
            document.documentElement.classList.remove("dark");
            console.log("dark", false);
        }
    }
    return (
        <label
            className={`${
                focus ? "bg-black/20" : "bg-transparent"
            } cursor-pointer w-[30px] h-[30px] hover:bg-black/20 transition p-1 rounded-full`}
            htmlFor="toggleTheme"
        >
            {dark ? (
                <svg
                    width="21"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10 16.5C8.4087 16.5 6.88258 15.8679 5.75736 14.7426C4.63214 13.6174 4 12.0913 4 10.5C4 8.9087 4.63214 7.38258 5.75736 6.25736C6.88258 5.13214 8.4087 4.5 10 4.5C11.5913 4.5 13.1174 5.13214 14.2426 6.25736C15.3679 7.38258 16 8.9087 16 10.5C16 12.0913 15.3679 13.6174 14.2426 14.7426C13.1174 15.8679 11.5913 16.5 10 16.5ZM10 14.5C11.0609 14.5 12.0783 14.0786 12.8284 13.3284C13.5786 12.5783 14 11.5609 14 10.5C14 9.43913 13.5786 8.42172 12.8284 7.67157C12.0783 6.92143 11.0609 6.5 10 6.5C8.93913 6.5 7.92172 6.92143 7.17157 7.67157C6.42143 8.42172 6 9.43913 6 10.5C6 11.5609 6.42143 12.5783 7.17157 13.3284C7.92172 14.0786 8.93913 14.5 10 14.5V14.5ZM9 0.5H11V3.5H9V0.5ZM0 9.5H3V11.5H0V9.5ZM17 9.5H20V11.5H17V9.5ZM9 17.5H11V20.5H9V17.5ZM16.621 2.5L18.036 3.914L15.914 6.036L14.5 4.62L16.621 2.5V2.5ZM14.5 15.914L15.914 14.5L18.036 16.621L16.621 18.036L14.5 15.914V15.914ZM4.121 14.5L5.536 15.914L3.414 18.036L2 16.62L4.121 14.5ZM2 3.914L3.414 2.5L5.536 4.621L4.12 6.036L2 3.914Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                </svg>
            ) : (
                <svg
                    width="21"
                    height="21"
                    viewBox="0 0 20 21"
                    fill="none"
                    className="mt-[2px]"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.97 0C7.73458 0.702878 6.70815 1.72146 5.99582 2.95145C5.28348 4.18143 4.91082 5.57864 4.916 7C4.916 11.418 8.438 15 12.782 15C13.928 15 15.018 14.75 16 14.302C14.39 16.544 11.787 18 8.849 18C3.962 18 0 13.97 0 9C0 4.03 3.962 0 8.849 0H8.969H8.97Z"
                        fill="white"
                        fillOpacity="0.8"
                    />
                </svg>
            )}

            <input
                className="sr-only"
                type="checkbox"
                name="toggleTheme"
                id="toggleTheme"
                checked={dark}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onChange={() => handleChange()}
            />
        </label>
    );
}

export default ToggleTheme;
