import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { createSeed, users } from "../src/fixtures/seed";
import { makePortfolioDocument } from "../src/domain/rules";
import { renderPortfolioHtml } from "../src/services/pdfHtml";
async function main() {
  const out = path.resolve("docs/evidencias");
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  const fonts = {
    regular: (await fs.readFile("assets/fonts/Poppins-Regular.ttf")).toString(
      "base64",
    ),
    semibold: (await fs.readFile("assets/fonts/Poppins-SemiBold.ttf")).toString(
      "base64",
    ),
  };
  for (const template of ["gallery", "editorial"] as const) {
    const db = createSeed();
    db.portfolio.templateId = template;
    db.artworks = Array.from({ length: 12 }, (_, i) => ({
      ...db.artworks[0]!,
      id: `test-${i}`,
      title: `${String(i + 1).padStart(2, "0")} ${"M".repeat(57)}`,
      technique: "Técnica ".repeat(10),
      description: "m".repeat(350) + ` FINAL-${i}`.slice(0, 10),
    }));
    db.portfolio.selectedArtworkIds = db.artworks.map((a) => a.id);
    db.portfolio.intro = "Introducción de prueba. ".repeat(12).slice(0, 280);
    const image = {
      id: "a1",
      width: 960,
      height: 1120,
      dataUri: `data:image/png;base64,${(await fs.readFile("assets/artworks/a1.png")).toString("base64")}`,
    };
    const html = renderPortfolioHtml(
      makePortfolioDocument(db, users[0]!),
      [image],
      fonts,
    );
    const page = await browser.newPage();
    await page.setContent(html);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    const overflow = await page.locator("article").evaluateAll((articles) =>
      articles.flatMap((a) => {
        const container = a.getBoundingClientRect();
        const last = a.querySelector(".description")!.getBoundingClientRect();
        const section = a.closest(".page")!.getBoundingClientRect();
        return last.bottom > container.bottom + 1 ||
          last.bottom > section.bottom - 30
          ? [
              {
                bottom: last.bottom,
                container: container.bottom,
                section: section.bottom,
              },
            ]
          : [];
      }),
    );
    if (overflow.length)
      throw new Error(
        `Desbordamiento en ${template}: ${JSON.stringify(overflow)}`,
      );
    await page.pdf({
      path: path.join(out, `maquetacion-${template}-12-obras.pdf`),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    console.log(
      `${template}: 12 obras, sin desbordamiento, PDF Chromium auxiliar generado.`,
    );
    await page.close();
  }
  await browser.close();
}
void main();
