import Spinner from "../Spinner";

export function BtnSmallPrimary({
    status = "active",
    onClick,
    textActive,
    textFinished,
    disabled = false,
}) {
    const contentStatus = {
        active: textActive,
        disabled: textActive,
        loading: (
            <span className="flex items-center gap-2">
                <Spinner radius={8} thick={2} /> Wait...
            </span>
        ),
        saved: (
            <span className="flex items-center gap-2">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 14.4C9.69739 14.4 11.3253 13.7257 12.5255 12.5255C13.7257 11.3253 14.4 9.69739 14.4 8C14.4 6.30261 13.7257 4.67475 12.5255 3.47452C11.3253 2.27428 9.69739 1.6 8 1.6C6.30261 1.6 4.67475 2.27428 3.47452 3.47452C2.27428 4.67475 1.6 6.30261 1.6 8C1.6 9.69739 2.27428 11.3253 3.47452 12.5255C4.67475 13.7257 6.30261 14.4 8 14.4V14.4ZM8 16C3.5816 16 0 12.4184 0 8C0 3.5816 3.5816 0 8 0C12.4184 0 16 3.5816 16 8C16 12.4184 12.4184 16 8 16ZM4.8 6.4L3.2 8L7.2 12L12.8 6.4L11.2 4.8L7.2 8.8L4.8 6.4Z"
                        fill="currentColor"
                    />
                </svg>
                {textFinished}
            </span>
        ),
    };

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`py-2 px-4 rounded-md  dark:text-white/70 text-sm ${
                status === "saved" || disabled
                    ? "border opacity-70 text-slate-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/60 text-white/80"
            }`}
        >
            {contentStatus[status]}
        </button>
    );
}
export function BtnLargePrimary({
    status = "active",
    onClick,
    textActive,
    textFinished,
    disabled = false,
}) {
    const contentStatus = {
        active: textActive,
        disabled: textActive,
        loading: (
            <span className="flex items-center gap-2">
                <Spinner radius={8} thick={2} /> Wait...
            </span>
        ),
        saved: (
            <span className="flex items-center gap-2">
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M8 14.4C9.69739 14.4 11.3253 13.7257 12.5255 12.5255C13.7257 11.3253 14.4 9.69739 14.4 8C14.4 6.30261 13.7257 4.67475 12.5255 3.47452C11.3253 2.27428 9.69739 1.6 8 1.6C6.30261 1.6 4.67475 2.27428 3.47452 3.47452C2.27428 4.67475 1.6 6.30261 1.6 8C1.6 9.69739 2.27428 11.3253 3.47452 12.5255C4.67475 13.7257 6.30261 14.4 8 14.4V14.4ZM8 16C3.5816 16 0 12.4184 0 8C0 3.5816 3.5816 0 8 0C12.4184 0 16 3.5816 16 8C16 12.4184 12.4184 16 8 16ZM4.8 6.4L3.2 8L7.2 12L12.8 6.4L11.2 4.8L7.2 8.8L4.8 6.4Z"
                        fill="currentColor"
                    />
                </svg>
                {textFinished}
            </span>
        ),
    };

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`py-3 px-5 rounded-md  dark:text-white/70 text-xl ${
                status === "saved" || disabled
                    ? "border opacity-70 text-slate-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/60 text-white/80"
            }`}
        >
            {contentStatus[status]}
        </button>
    );
}
