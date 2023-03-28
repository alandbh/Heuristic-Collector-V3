import styles from "./Donnut.module.css";

function Donnut({
    total = 100,
    sum = 0,
    radius = 34,
    thick = 6,
    color = { base: "#ddd", primary: "#558fe6" },
}) {
    // const radius = 34;
    const circ = 2 * Math.PI * radius;
    const percent = isNaN((sum / total) * 100) ? 1 : (sum / total) * 100;
    const size = radius * 2 + thick * 2 + 4;
    const fontSize = () => {
        return radius / 3 < 12 ? 12 : radius / 3;
    };

    const dash = {
        // strokeDashoffset: calc(175.92px - (175.92px * 85 / 100));
        strokeDashoffset: circ - (circ * percent) / 100,
        strokeDasharray: circ,
        strokeWidth: thick + 2,
        transform: `translate(${thick + 2}px, ${thick + 2}px)`,
    };

    return (
        <div className={styles.percent} style={{ height: size, width: size }}>
            <svg style={{ width: size, height: size }}>
                <circle
                    // className="stroke-slate-200 dark:stroke-slate-100/30"
                    cx={radius}
                    cy={radius}
                    r={radius}
                    stroke={color.base}
                    style={{
                        strokeWidth: thick + 2,
                        transform: `translate(${thick + 2}px, ${thick + 2}px)`,
                    }}
                ></circle>
                <circle
                    // className="stroke-primary brightness-125"
                    style={dash}
                    stroke={color.primary}
                    cx={radius}
                    cy={radius}
                    r={radius}
                ></circle>
            </svg>
            <h2
                style={{ fontSize: fontSize() }}
                className="dark:text-slate-100/70"
            >
                {percent.toFixed(1)}
                <span>%</span>
            </h2>
        </div>
    );
}

export default Donnut;
