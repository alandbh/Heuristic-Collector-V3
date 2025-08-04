import chromium from "@sparticuz/chromium";

const getPuppeteer = async () => {
    const isProd = process.env.NODE_ENV === "production";

    const puppeteer = isProd
        ? (await import("puppeteer-core")).default
        : (await import("puppeteer")).default;

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: isProd ? await chromium.executablePath() : undefined,
        headless: chromium.headless,
    });

    return browser;
};

export default getPuppeteer;
