export default function BarChart({ allJourneyScores, refDom }) {
    if (!allJourneyScores || !allJourneyScores.scores_by_heuristic) {
        return null;
    }
    function getHeight(score) {
        return (385 / 5) * score;
    }
    function getAveragePosition(score) {
        let amount = score !== 0 ? 1 : -2;

        return 385 - (385 / 5) * score + amount;
    }

    function getColor(showPlayer) {
        return showPlayer ? "#5383EB" : "#D9D9D9";
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1048"
            height="387"
            fill="none"
            viewBox="0 0 1048 387"
            ref={refDom}
        >
            {allJourneyScores.scores_by_heuristic.map((score, index) => {
                return (
                    <rect
                        key={score.label}
                        x={22 + index * 24 + index * 25}
                        y={385 - getHeight(score.value) + 2}
                        height={getHeight(score.value)}
                        width="24"
                        fill={getColor(score.show_player)}
                    />
                );
            })}

            <rect
                x="0"
                y={getAveragePosition(allJourneyScores.average_score) + 2}
                width="1048"
                height="1"
                fill="#ff0000"
            />
        </svg>
    );
}
