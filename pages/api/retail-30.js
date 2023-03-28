import marketplace from "./results/marketplace.json";
import fashion from "./results/fashion.json";
import beauty from "./results/beauty.json";
// import supermarket from "./results/supermarket.json";
// Deploying MKT and Fashion2 in Vercel

export default async function retail30(req, res) {
    // gettind Marketplace data
    const marketplaceFetch = await fetch(
        "https://heuristic-collector-mkt.vercel.app/api/all?project=retail-30"
    );
    const marketPlaceJson = await marketplaceFetch.json();

    // Getting Fashion data
    const fashionFetch = await fetch(
        "https://heuristic-collector-fashion.vercel.app/api/all?project=retail-30"
    );
    const fashionJson = await fashionFetch.json();

    // Getting Beauty data
    const beautyFetch = await fetch(
        "https://heuristic-collector-v2.vercel.app/api/all?project=retail-30"
    );
    const beautyJson = await beautyFetch.json();

    // Concatenating Marketplace, Fashion and Beauty
    const results = [...marketPlaceJson, ...fashionJson, ...beautyJson];

    res.status(200).json(results);
}
