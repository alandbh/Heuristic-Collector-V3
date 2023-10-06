function ChartSection({ title, average, children }) {
    return (
        <section className="heuristic-chart">
            <header className="flex justify-between mb-6 items-center px-4 gap-3">
                <h1 className="text-xl font-bold">
                    <div className="h-[5px] bg-primary w-10 mb-1"></div>
                    {title}
                </h1>
                {average && (
                    <div className="text-lg flex items-center gap-1 whitespace-nowrap">
                        <b>Average: </b>
                        <span className=" text-slate-500">{average}</span>
                    </div>
                )}
            </header>
            <div className="bg-white dark:bg-slate-800 pb-1 rounded-lg shadow-lg  mb-16">
                {children}
            </div>
        </section>
    );
}

export default ChartSection;
