export default async function handler(req, res) {
    const { project } = req.query;

    const fakeObjetct = {
        players: [
            {
                playerSlug: "tesco",
                playerName: "Tesco",
                slides: [
                    {
                        slideId: "app-h_1.6",
                        heuristicBarChart:
                            "https://heuristic-v4.vercel.app/chart-test.png",
                        slideValues: {
                            appValue: "1,0",
                            appCategoryAverage: "1,3",
                            mobileSiteValue: "4,0",
                            mobileSiteCategoryAverage: "1,2",
                            generalAverage: "2.1",
                        },
                    },
                    {
                        slideId: "app-h_3.16",
                        heuristicBarChart:
                            "https://heuristic-v4.vercel.app/chart-test.png",
                        slideValues: {
                            appValue: "1,5",
                            appCategoryAverage: "1,5",
                            mobileSiteValue: "4,5",
                            mobileSiteCategoryAverage: "1,5",
                            generalAverage: "2.5",
                        },
                    },
                ],
            },
            {
                playerSlug: "adidas",
                playerName: "Adidas",
                slides: [
                    {
                        slideId: "app-h_1.6",
                        heuristicBarChart:
                            "https://heuristic-v4.vercel.app/chart-test.png",
                        slideValues: {
                            appValue: "2,0",
                            appCategoryAverage: "2,3",
                            mobileSiteValue: "5,0",
                            mobileSiteCategoryAverage: "2,2",
                            generalAverage: "3.1",
                        },
                    },
                    {
                        slideId: "app-h_3.16",
                        heuristicBarChart:
                            "https://heuristic-v4.vercel.app/chart-test.png",
                        slideValues: {
                            appValue: "2,5",
                            appCategoryAverage: "2,5",
                            mobileSiteValue: "5,5",
                            mobileSiteCategoryAverage: "5,5",
                            generalAverage: "3.5",
                        },
                    },
                ],
            },
        ],
    };

    res.status(200).json(fakeObjetct);
}
