import { useEffect, useState } from "react";
import styles from "./Progress.module.css";

function Progress({
    amount = 10,
    total = 100,
    legend,
    style,
    size = "big",
    barColor = "limeGreen",
}) {
    const [percentage, setPercentage] = useState(0);
    useEffect(() => {
        const timeout = setTimeout(() => {
            setPercentage(((amount / total) * 100).toFixed(1));
        }, 1000);

        return () => clearTimeout(timeout);
    }, [amount, total]);
    return (
        <div
            style={{ ...style }}
            className={
                size === "small" ? styles.containerSmall : styles.container
            }
        >
            {legend && (
                <span
                    className={
                        size === "small" ? styles.legendSmall : styles.legend
                    }
                >
                    {legend}
                </span>
            )}
            <div className={styles["bar-wrapper"]}>
                <div
                    className={
                        size === "small" ? styles.baseSmall : styles.base
                    }
                >
                    <div
                        style={{
                            width: percentage + "%",
                            background: barColor,
                        }}
                        className={styles.bar}
                    ></div>
                </div>
                <b
                    style={
                        size === "small"
                            ? { fontSize: "small", width: "2rem" }
                            : { fontSize: "1.5rem" }
                    }
                >
                    {percentage}%
                </b>
            </div>
            <div className={styles.description}>
                <span className={styles.numbers}>
                    {amount} of {total}
                </span>
            </div>
        </div>
    );
}

export default Progress;
