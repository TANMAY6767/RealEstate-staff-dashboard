import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PdfService {
    static async generatePdf(templateName, data, filename) {
        try {
            // Read and render EJS template
            const templatePath = path.join(__dirname, "../templates", `${templateName}.ejs`);
            const template = fs.readFileSync(templatePath, "utf-8");
            const html = ejs.render(template, data);

            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: "new",
                args: ["--no-sandbox", "--disable-setuid-sandbox"]
            });

            const page = await browser.newPage();

            // Set content and wait for any potential resources to load
            await page.setContent(html, { waitUntil: "networkidle0" });

            // Generate PDF
            const pdfPath = path.join(__dirname, "../public/invoices", filename);
            await page.pdf({
                path: pdfPath,
                format: "A4",
                printBackground: true
            });

            await browser.close();

            return `/invoices/${filename}`;
        } catch (error) {
            console.error("Error generating PDF:", error);
            throw new Error("Could not generate PDF");
        }
    }
}
