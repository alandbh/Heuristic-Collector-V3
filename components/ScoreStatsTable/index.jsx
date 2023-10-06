function ScoreStatsTable({ collection }) {
    function getUniqueScores(scoresObj) {
        const nonZeroedScores = getValidScores(scoresObj);
        const table = [];
        const scores = nonZeroedScores?.map((scoreObj) => scoreObj.value);

        const uniqueScores = Array.from(new Set(scores));

        uniqueScores.map((score) => {
            const tableRow = {};

            tableRow.score = score;
            tableRow.qtd = nonZeroedScores?.filter(
                (scoreObj) => scoreObj.value === score
            ).length;
            tableRow.players = nonZeroedScores
                ?.filter((scoreObj) => scoreObj.value === score)
                .map((scoreObj) => scoreObj.label)
                .join(", ");

            table.push(tableRow);
        });

        const sortedTable = table.sort((a, b) => b.score - a.score);

        return sortedTable;
    }

    function getCellColor(scoreValue) {
        const colorClasses = {
            5: "bg-lime-600 text-black font-bold border-none",
            4: "bg-lime-400 text-black font-bold border-none",
            3: "bg-yellow-400 text-black font-bold border-none",
            2: "bg-red-300 text-black font-bold border-none",
            1: "bg-red-500 text-black font-bold border-none",
            0: "bg-black text-white font-bold border-none",
        };

        return colorClasses[scoreValue];
    }

    function getValidScores(scoresObj) {
        return scoresObj?.filter(
            (scoresObj) =>
                !scoresObj.ignore_journey && !scoresObj.zeroed_journey
        );
    }

    return (
        <table className="table-fixed w-full text-sm  text-center">
            <thead className="border border-b-4 h-10">
                <tr>
                    <th className="border border-solid w-[120px]">
                        Score value
                    </th>
                    <th className="border border-solid w-[220px]">
                        Amount of players by score
                    </th>
                    <th className="border border-solid">Players by score</th>
                </tr>
            </thead>
            <tbody>
                {getUniqueScores(collection).map((score) => (
                    <tr key={score.score}>
                        <td className={getCellColor(score.score)}>
                            {score.score}
                        </td>
                        <td className="border  border-solid h-12">
                            <b className="text-xl">{score.qtd}</b>
                        </td>
                        <td className="text-left p-2 text-xs border-l border  border-solid">
                            {score.players}
                        </td>
                    </tr>
                ))}
                <tr>
                    <td className="text-right h-12 pt-8">
                        <b className="">TOTAL amount of players:</b>
                    </td>
                    <td className="text-center pt-8 text-xs ">
                        <b className="text-xl">
                            {getValidScores(collection)?.length}
                        </b>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export default ScoreStatsTable;
