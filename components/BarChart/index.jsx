export default function BarChart({ allScores, refDom }) {
    if (!allScores || !allScores.scores_by_heuristic) {
        return null;
    }
    function getHeight(score) {
        return (340 / 5) * score;
    }
    function getAveragePosition(score) {
        let amount = score !== 0 ? 1 : -2;

        return 340 - (340 / 5) * score + amount;
    }

    function getColor(showPlayer) {
        return showPlayer ? "#5383EB" : "#D9D9D9";
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="901"
            height="340"
            fill="none"
            viewBox="0 0 901 339"
            ref={refDom}
        >
            {allScores.scores_by_heuristic.map((score, index) => {
                return (
                    <rect
                        key={score.label}
                        x={index * 21 + index * 23}
                        y={340 - getHeight(score.value)}
                        height={getHeight(score.value)}
                        width="21"
                        fill={getColor(score.show_player)}
                    />
                );
            })}

            <rect
                x="0"
                y={getAveragePosition(allScores.average_score)}
                width="901"
                height="1"
                fill="#ff0000"
            />
        </svg>
    );
}
