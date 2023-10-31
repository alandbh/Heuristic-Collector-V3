function Spinner({
    radius = 10,
    thick = 4,
    colorClass = "slate-200",
    className,
}) {
    const size = radius * 2 + thick;
    const center = radius + thick / 2;
    const dashArray = 2 * 3.14 * radius * 0.7;

    return (
        <div className={`text-${colorClass} ${className}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className={`animate-spin text-${colorClass}`}
                height={size}
                width={size}
                viewBox={`0 0 ${size} ${size}`}
            >
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={thick}
                    className="opacity-25"
                ></circle>
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={thick}
                    className="opacity-75"
                    strokeDasharray={dashArray}
                ></circle>
            </svg>
        </div>
    );
}

export default Spinner;
