import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Icon({ allScores }) {
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
                height="2"
                fill="#ff0000"
            />

            {/* 
            <rect y="273" width="21" height="66" fill="#D9D9D9" />
            <rect x="44" y="204" width="21" height="135" fill="#D9D9D9" />
            <rect x="88" y="137" width="21" height="202" fill="#D9D9D9" />
            <rect x="132" y="68" width="21" height="271" fill="#D9D9D9" />
            <rect x="176" width="21" height="339" fill="#D9D9D9" />
            <rect x="220" width="21" height="339" fill="#D9D9D9" />
            <rect x="264" width="21" height="339" fill="#D9D9D9" />
            <rect x="308" y="273" width="21" height="66" fill="#5383EB" />
            <rect x="352" width="21" height="339" fill="#D9D9D9" />
            <rect x="396" width="21" height="339" fill="#D9D9D9" />
            <rect x="440" y="137" width="21" height="202" fill="#D9D9D9" />
            <rect x="484" y="68" width="21" height="271" fill="#D9D9D9" />
            <rect x="528" width="21" height="339" fill="#D9D9D9" />
            <rect x="572" width="21" height="339" fill="#D9D9D9" />
            <rect x="616" y="137" width="21" height="202" fill="#D9D9D9" />
            <rect x="660" width="21" height="339" fill="#D9D9D9" />
            <rect x="704" width="21" height="339" fill="#D9D9D9" />
            <rect x="748" y="137" width="21" height="202" fill="#D9D9D9" />
            <rect x="792" y="137" width="21" height="202" fill="#D9D9D9" />
            <rect x="836" y="137" width="21" height="202" fill="#D9D9D9" />
            <rect x="880" y="137" width="21" height="202" fill="#D9D9D9" /> 
            */}
        </svg>
    );
}

function Dashboard() {
    const router = useRouter();
    const { project, heuristic, showPlayer, journey } = router.query;
    const [allScores, setAllScores] = useState(null);

    // const project = searchParams.get("project");
    // const journey = searchParams.get("journey");
    // const heuristic = searchParams.get("heuristic");
    // const showPlayer = searchParams.get("showPlayer");

    // const yourParamName = request.nextUrl.searchParams.get("player");

    // console.log({ project, journey, heuristic, showPlayer });

    useEffect(() => {
        fetch(
            `/api/all?project=${project}&journey=${journey}&heuristic=${heuristic}&showPlayer=${showPlayer}`
        ).then((data) => {
            data.json().then((result) => {
                // setApiResult(result);

                // setTotalOfScores(getAllScoresApi(result).length);
                setAllScores(result);
            });
        });
    }, [project]);

    useEffect(() => {
        if (allScores !== null) {
            console.log("allScores", allScores);
        }
    }, [allScores]);

    if (allScores === null) {
        return null;
    }

    return (
        <div className="m-0">
            <Icon allScores={allScores} />
        </div>
    );
}

export default Dashboard;
