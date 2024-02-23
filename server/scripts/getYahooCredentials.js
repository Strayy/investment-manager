const puppeteer = require("puppeteer");

// Visits Yahoo finance page to return cookies and crumb for API endpoint.
const getYahooCredentials = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        const credentials = [undefined, undefined];

        await page.goto("https://finance.yahoo.com", { waitUntil: "networkidle0" });
        const cookies = await page.cookies();

        credentials[0] = cookies;

        const crumb = await page.evaluate(() => {
            const crumbMatch = window.YAHOO.context?.crumb;
            return crumbMatch || null;
        });

        credentials[1] = crumb;

        return credentials;
    } catch (err) {
        console.error("Error fetching credentials:", err.message);
    } finally {
        await browser.close();
    }
};

module.exports = getYahooCredentials;
