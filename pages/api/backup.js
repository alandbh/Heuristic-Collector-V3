import { gql } from "@apollo/client";
import clientFast from "../../lib/apollo-fast";

const QUERY_BACKUP_PROJECT = gql`
    query GetAllScores($projectSlug: String) {
        players(where: { project: { slug: $projectSlug } }, last: 1000) {
            name
            slug
            scoresObject
        }
    }
`;

const BACKUP_QUERY = gql`
    query CollectorBackupSnapshot {
        projects(orderBy: createdAt_DESC, last: 1000) {
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
        heuristics(orderBy: heuristicNumber_ASC, last: 10000) {
            id
            name
            heuristicNumber
            description
            project {
                id
                slug
            }
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
        players(orderBy: slug_ASC, last: 10000) {
            id
            name
            slug
            showInChart
            scoresObject
            project {
                id
                slug
            }
            departmentObj {
                departmentName
                departmentSlug
                departmentOrder
            }
            ignored_journeys {
                name
                slug
            }
            zeroed_journeys {
                name
                slug
            }
            finding(orderBy: createdAt_ASC, first: 10000) {
                id
                journey {
                    slug
                    name
                }
                findingObject
            }
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

        const projects = data?.projects || [];
        const heuristics = data?.heuristics || [];
        const players = data?.players || [];

        const projectsWithRelations = projects.map((project) => ({
            ...project,
            heuristics: [],
            players: [],
        }));

        const projectIndexById = new Map();
        const projectIndexBySlug = new Map();

        projectsWithRelations.forEach((project, index) => {
            if (project.id) {
                projectIndexById.set(project.id, index);
            }
            if (project.slug) {
                projectIndexBySlug.set(project.slug, index);
            }
        });

        const orphanHeuristics = [];
        heuristics.forEach((heuristic) => {
            const projectRef = heuristic.project;
            const indexById = projectRef?.id
                ? projectIndexById.get(projectRef.id)
                : undefined;
            const indexBySlug =
                indexById === undefined && projectRef?.slug
                    ? projectIndexBySlug.get(projectRef.slug)
                    : undefined;
            const projectIndex =
                indexById !== undefined ? indexById : indexBySlug;

            if (projectIndex === undefined) {
                orphanHeuristics.push(heuristic);
                return;
            }

            projectsWithRelations[projectIndex].heuristics.push(heuristic);
        });

        const orphanPlayers = [];
        players.forEach((player) => {
            const projectRef = player.project;
            const indexById = projectRef?.id
                ? projectIndexById.get(projectRef.id)
                : undefined;
            const indexBySlug =
                indexById === undefined && projectRef?.slug
                    ? projectIndexBySlug.get(projectRef.slug)
                    : undefined;
            const projectIndex =
                indexById !== undefined ? indexById : indexBySlug;

            if (projectIndex === undefined) {
                orphanPlayers.push(player);
                return;
            }

            projectsWithRelations[projectIndex].players.push(player);
        });

        const projectCount = projectsWithRelations.length;
        const heuristicCount = heuristics.length;
        const playerCount = players.length;

        const payload = {
            meta: {
                generatedAt: new Date().toISOString(),
                heuristicCount,
                orphanHeuristicCount: orphanHeuristics.length,
                orphanPlayerCount: orphanPlayers.length,
            },
            data: orphanPlayers,
        };

        res.setHeader("Cache-Control", "no-store");
        return res.status(200).json(payload);
    } catch (error) {
        console.error("[backup] Failed to build snapshot", error);
        return res.status(500).json({ error: "Failed to generate backup" });
    }
}
