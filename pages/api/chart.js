import { gql, useMutation } from "@apollo/client";
import client from "../../lib/apollo";
import clientFast from "../../lib/apollo-fast";
import { getHeuristicDataset } from "../../lib/getHeuristicDataset";
import { barChartService } from "../../lib/chartService";

export default async function handler(req, res) {
    const { project, journey, heuristic, player } = req.query;

    const baseUrl = req.headers.host;

    console.log("baseUrl:", baseUrl);

    try {
        const chartDom = await barChartService(baseUrl);

        if (!chartDom) {
            res.status(404).send(
                "Element with ID 'heuristic-chart' not found."
            );
            return;
        }

        // Verifique se chartDom é uma string
        if (typeof chartDom !== "string") {
            res.status(500).send("Error: chartDom is not a valid string.");
            return;
        }

        // Verifique se o conteúdo é um SVG válido
        if (!chartDom.startsWith("<svg")) {
            res.setHeader("content-type", "text/html");
            res.status(200).send(chartDom); // Retorna como HTML para depuração
            return;
        }

        res.setHeader("content-type", "image/svg+xml");
        res.status(200).send(chartDom);
        // res.status(200).send(baseUrl);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}
