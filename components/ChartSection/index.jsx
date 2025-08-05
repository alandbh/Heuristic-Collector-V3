function ChartSection({ title, average, children, dark }) {
    return (
        <section className={dark ? "text-slate-200" : "text-slate-500"}>
            <header className="flex justify-between mb-6 items-center px-4 gap-">
                <h1 className="text-xl font-bold ">
                    <div className="h-[5px] bg-primary w-10 mb-1"></div>
                    {title}
                </h1>
                {average && (
                    <div className="text-lg flex items-center gap-1 whitespace-nowrap">
                        <b>Average: </b>
                        <span id="generalAverage">
                            {Number(average).toFixed(1).replace(".", ",")}
                        </span>
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
