import { gql } from "@apollo/client";
import clientFast from "../../lib/apollo-fast";

const QUERY_BACKUP_PROJECT = gql`
    query ProjectBackup($projectSlug: String) {
        players(where: { project: { slug: $projectSlug } }, last: 1000) {
            name
            slug
            journeys {
                name
                slug
            }
            departmentObj {
                departmentName
                departmentSlug
                departmentOrder
            }
            finding {
                journey {
                    slug
                }
                findingObject
            }
            scoresObject
        }

        project(where: { slug: $projectSlug }) {
            id
            name
            slug
            year
            createdAt
            updatedAt
            isOverlapJourneys
            previousScores
            chartStyle
            previousProjectSlug
            journeys {
                name
                slug
            }
        }

        heuristics(
            where: { project: { slug: $projectSlug } }
            orderBy: heuristicNumber_ASC
            last: 10000
        ) {
            id
            name
            heuristicNumber
            description

            group {
                name
                groupNumber
            }
            journeys {
                name
                slug
            }
            not_applicaple_players {
                id
                name
                slug
            }
        }

        groups(where: { project: { slug: $projectSlug } }, last: 1000) {
            name
            groupNumber
            journeys {
                slug
                name
            }
            heuristic {
                heuristicNumber
                name
                journeys {
                    slug
                    name
                }
            }
        }

        journeys(where: { project: { slug: $projectSlug } }, last: 1000) {
            name
            slug
        }

        rgaUsers(where: { project: { slug: $projectSlug } }, last: 1000) {
            email
            userType
        }
    }
`;

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const requestToken =
        req.headers["api_key"] ||
        (Array.isArray(req.query.token) ? req.query.token[0] : req.query.token);
    const backupToken = process.env.API_SECRET_KEY;

    const projectSlug = req.query.project;

    if (!backupToken) {
        return res
            .status(500)
            .json({ error: "Backup token not configured on the server" });
    }

    if (requestToken !== backupToken) {
        return res
            .status(401)
            .json({ error: "Unauthorized: invalid backup token" });
    }

    try {
        const { data } = await clientFast.query({
            query: QUERY_BACKUP_PROJECT,
            variables: {
                projectSlug,
            },
            fetchPolicy: "network-only",
        });

        const heuristics = data?.heuristics || [];
        const players = data?.players || [];

        const heuristicCount = heuristics.length;
        const playerCount = players.length;

        const payload = {
            meta: {
                generatedAt: new Date().toISOString(),
                projectName: data.project.name,
                projectSlug: data.project.slug,
                ProjectYear: data.project.year,
                heuristicCount,
                playerCount,
            },
            data,
        };

        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json(payload);
    } catch (error) {
        console.error("[backup] Failed to build snapshot", error);
        return res.status(500).json({ error: "Failed to generate backup" });
    }
}
