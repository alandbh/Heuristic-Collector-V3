import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer";

export async function barChartService(params) {
    const { host, project, journey, heuristic, players } = params;

    // const browser = await puppeteer.launch();
    // const browser = await chromium.puppeteer.launch({
    //     args: chromium.args,
    //     executablePath: await chromium.executablePath,
    //     headless: chromium.headless,
    // });

    // Use puppeteer no local e chrome-aws-lambda na produção
    const isProduction = host.includes("localhost") ? false : true;

    // usando o puppeteer para renderizar o SVG
    const browser = await (isProduction
        ? chromium.puppeteer.launch({
              args: chromium.args,
              executablePath: await chromium.executablePath,
              headless: chromium.headless,
          })
        : puppeteer.launch());

    const page = await browser.newPage();

    // // Verifique se a aplicação está rodando em localhost
    const isLocalhost = host.includes("localhost");

    // // Defina a baseUrl com base no ambiente
    const baseUrl = isLocalhost
        ? "http://localhost:3000"
        : "https://heuristic-v4.vercel.app";
    try {
        // Construa a URL completa
        const url = `${baseUrl}/dash2?project=${project}&heuristic=${heuristic}&showManyPlayers=${players}&journey=${journey}`;

        // Navegue até a URL
        await page.goto(url, { waitUntil: "networkidle0" });

        // Aguarde o elemento ser montado
        await page.waitForSelector("#heuristic-chart");

        // Extraia o HTML do elemento
        const chartHtml = await page.$eval(
            "#heuristic-chart svg",
            (el) => el.outerHTML
        );

        await browser.close();
        return chartHtml;
    } catch (error) {
        await browser.close();
        throw new Error(`Failed to fetch chart: ${error.message}`);
    }
}
