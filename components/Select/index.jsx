function Select({ label, onChange, defaultValue, options, disabled, id }) {
    return (
        <div className="flex flex-col gap-1 flex-1">
            <label htmlFor={id} className="text-slate-500 font-bold">
                {label}
            </label>
            <select
                className="border border-slate-300  block h-10 px-4 rounded-sm"
                onChange={onChange}
                defaultValue={defaultValue}
                disabled={disabled}
                id={id}
            >
                <option value="">...</option>
                {options?.map((journey) => {
                    return (
                        <option key={journey.slug} value={journey.slug}>
                            {journey.name}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}

export default Select;
