function Select({
    label,
    onChange,
    defaultValue,
    options,
    disabled,
    id,
    dark,
}) {
    return (
        <div className="flex flex-col gap-1 flex-1">
            <label
                htmlFor={id}
                className={`${
                    dark ? "text-slate-200" : "text-slate-500"
                } font-bold`}
            >
                {label}
            </label>
            <select
                className={`border  block h-10 px-4 rounded-sm ${
                    dark ? "border-slate-500 bg-slate-800" : "border-slate-300"
                }`}
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
