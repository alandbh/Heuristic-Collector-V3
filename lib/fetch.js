export async function fetchAPI(query, { variables, preview } = {}) {
    const res = await fetch(process.env.NEXT_PUBLIC_GRAPHCMS_API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
                preview
                    ? process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN
                    : process.env.NEXT_PUBLIC_GRAPHCMS_TOKEN
            }`,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });
    const json = await res.json();

    if (json.errors) {
        console.error(json.errors);
        throw new Error("Failed to fetch API");
    }

    return json.data;
}
