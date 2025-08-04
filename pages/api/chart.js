import puppeteer from "puppeteer";
import { barChartService } from "../../lib/chartService";

export default async function handler(req, res) {
    const { project, journey, heuristic, players } = req.query;

    const host = req.headers.host;

    console.log("host:", host);

    try {
        const chartDom = await barChartService({
            host,
            project,
            journey,
            heuristic,
            players,
        });

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

        // usando o puppeteer para renderizar o SVG
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        try {
            // Defina o tamanho do viewport para aumentar a escala
            await page.setViewport({
                width: 2400, // Ajuste conforme necessário
                height: 900, // Ajuste conforme necessário
                deviceScaleFactor: 3, // Triplica a escala
            });

            // Carregue o SVG em uma página HTML
            await page.setContent(`
                <html>
                    <body style="margin: 0; padding: 0;">
                        ${chartDom}
                    </body>
                </html>
            `);

            // Aguarde o SVG ser renderizado
            const svgElement = await page.$("svg");

            if (!svgElement) {
                throw new Error("SVG element not found.");
            }

            // Ajuste o tamanho do SVG para o triplo do tamanho original
            await page.evaluate((svg) => {
                const bbox = svg.getBBox();
                svg.setAttribute("width", bbox.width * 3);
                svg.setAttribute("height", bbox.height * 3);
            }, svgElement);

            // Capture o screenshot do SVG como PNG
            const pngBuffer = await svgElement.screenshot({
                type: "png",
                omitBackground: true,
            });

            // Retorne o PNG como resposta
            res.setHeader("Content-Type", "image/png");
            res.status(200).send(pngBuffer);
        } finally {
            await browser.close();
        }

        // res.setHeader("content-type", "image/svg+xml");
        // res.status(200).send(chartDom);
        // res.status(200).send(baseUrl);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
}
