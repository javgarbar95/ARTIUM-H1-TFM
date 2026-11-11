import { test, expect } from "@playwright/test";
import path from "node:path";
for (const width of [360, 393]) {
  test(`recorrido de creación y consulta a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 852 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page
      .getByRole("button", { name: "Entrar como estudiante demo", exact: true })
      .click();
    await expect(page.getByText("Obras de la comunidad")).toBeVisible();
    await page.screenshot({ path: `docs/evidencias/inicio-${width}.png` });
    await page.getByRole("tab", { name: "Buscar", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Buscar obras o artistas" })
      .fill("Órbita");
    await page.getByRole("button", { name: "UPV", exact: true }).click();
    await expect(page.getByText("1 obra encontrada")).toBeVisible();
    await page
      .getByRole("button", { name: "Ver obra Órbita suave", exact: true })
      .click();
    await expect(
      page.getByText("Un recorrido circular", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Ver perfil de Leo Navarro", exact: true })
      .click();
    await expect(
      page.getByText("Universitat Politècnica de València"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Volver", exact: true }).click();
    await page.getByRole("button", { name: "Volver", exact: true }).click();
    await expect(
      page.getByRole("textbox", { name: "Buscar obras o artistas" }),
    ).toHaveValue("Órbita");
    await page
      .getByRole("textbox", { name: "Buscar obras o artistas" })
      .fill("no-existe-obra");
    await expect(
      page.getByText("Sin resultados", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Limpiar búsqueda y filtros", exact: true })
      .click();
    await expect(page.getByText("6 obras encontradas")).toBeVisible();
    await page.getByRole("tab", { name: "Perfil", exact: true }).click();
    await page
      .getByRole("button", { name: "Añadir obra", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Guardar obra", exact: true })
      .click();
    await expect(
      page.getByText("Revisa los campos:", { exact: false }),
    ).toBeVisible();
    const chooser = page.waitForEvent("filechooser");
    await page
      .getByRole("button", {
        name: "Seleccionar imagen de la galería",
        exact: true,
      })
      .click();
    await (await chooser).setFiles(path.resolve("assets/artworks/a4.png"));
    await expect(
      page.getByRole("button", { name: "Cambiar imagen", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "Título", exact: true })
      .fill(`Luz de prueba ${width}`);
    await page
      .getByRole("textbox", { name: "Descripción", exact: true })
      .fill("Una obra incorporada durante la prueba de persistencia.");
    await page
      .getByRole("textbox", { name: "Técnica", exact: true })
      .fill("Collage digital");
    await page
      .getByRole("textbox", {
        name: "Descripción accesible de la imagen",
        exact: true,
      })
      .fill("Montañas azules superpuestas bajo un sol naranja.");
    await page
      .getByRole("button", { name: "Guardar obra", exact: true })
      .click();
    await expect(
      page.getByRole("button", {
        name: `Ver obra Luz de prueba ${width}`,
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", {
        name: `Ver obra Luz de prueba ${width}`,
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "Portfolio", exact: true }).click();
    await expect(page.getByText("2/12 obras · Borrador local")).toBeVisible();
    await page
      .getByRole("button", { name: "Editar portfolio", exact: true })
      .click();
    await page
      .getByRole("button", {
        name: `Añadir Luz de prueba ${width}`,
        exact: true,
      })
      .click();
    await page
      .getByRole("button", {
        name: `Subir Luz de prueba ${width}`,
        exact: true,
      })
      .click();
    await page
      .getByRole("button", { name: "Editorial · Vertical", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Acento Azul", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Guardar portfolio", exact: true })
      .click();
    await expect(page.getByText("3/12 obras · Borrador local")).toBeVisible();
    await page
      .getByRole("button", { name: "Vista previa y PDF", exact: true })
      .click();
    await page.screenshot({ path: `docs/evidencias/portfolio-${width}.png` });
    await page
      .getByRole("button", { name: "Imprimir / guardar PDF", exact: true })
      .click();
    await expect(
      page.getByText("Se ha abierto la impresión del navegador.", {
        exact: false,
      }),
    ).toBeVisible();
    const frame = page.frameLocator("#artium-print");
    await expect(frame.locator("article")).toHaveCount(3);
    await expect(frame.locator(".page")).toHaveCount(4);
    await expect(frame.locator("h2").nth(1)).toHaveText(
      `Luz de prueba ${width}`,
    );
    await page.reload();
    await expect(
      page.getByText(`Luz de prueba ${width}`, { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("Imagen no disponible", { exact: true }),
    ).toHaveCount(0);
    // Deep links cannot bypass role guards. Private details are hidden from consultation.
    await page.goto("/profile");
    await page
      .getByRole("button", { name: "Cerrar sesión", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Explorar como invitado", exact: true })
      .click();
    await page.goto("/artwork/new");
    await expect(
      page.getByText("Espacio de creación", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Guardar obra", exact: true }),
    ).toHaveCount(0);
    await page.goto("/portfolio/editor");
    await expect(
      page.getByText("Espacio de creación", { exact: true }),
    ).toBeVisible();
    await page.goto("/messages");
    await expect(
      page.getByText("Las conversaciones llegarán", { exact: true }),
    ).toBeVisible();
    await page.screenshot({ path: `docs/evidencias/mensajes-${width}.png` });
    expect(errors).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  });
}
test("recuperación controlada y cancelación de restablecer", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Entrar como estudiante demo", exact: true })
    .waitFor();
  await page.evaluate(() => localStorage.setItem("artium.demo.v1", "{invalid"));
  await page.reload();
  await expect(
    page.getByText("Vamos a recuperar tu espacio", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Restablecer demo", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("artium.demo.v1")),
  ).toBe("{invalid");
  await page
    .getByRole("button", { name: "Restablecer demo", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "Entrar como estudiante demo",
      exact: true,
    }),
  ).toBeVisible();
});

test("edición, borrado confirmado, portfolio vacío e imagen inaccesible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Entrar como estudiante demo", exact: true })
    .click();
  await page.goto("/artwork/edit/a1");
  await page
    .getByRole("textbox", { name: "Título", exact: true })
    .fill("Entre planos revisado");
  await page.getByRole("button", { name: "Guardar obra", exact: true }).click();
  await page.goto("/portfolio/preview");
  await expect(
    page.getByText("Entre planos revisado", { exact: true }),
  ).toBeVisible();
  await page.goto("/artwork/edit/a1");
  await page
    .getByRole("button", { name: "Eliminar obra", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Título", exact: true }),
  ).toHaveValue("Entre planos revisado");
  await page
    .getByRole("button", { name: "Eliminar obra", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Añadir obra", exact: true }),
  ).toBeVisible();
  await page.goto("/portfolio/editor");
  await page
    .getByRole("button", {
      name: "Retirar El peso del silencio del portfolio",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Guardar portfolio", exact: true })
    .click();
  await page.goto("/portfolio/preview");
  await expect(
    page.getByText("Un portfolio por descubrir", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Imprimir / guardar PDF", exact: true }),
  ).toBeDisabled();
  // A broken persisted image reference must be explicit in the UI and recoverable in export.
  await page.evaluate(() => {
    const db = JSON.parse(localStorage.getItem("artium.demo.v1")!);
    db.portfolio.selectedArtworkIds = ["a3"];
    db.media = db.media.map((m: { id: string }) =>
      m.id === "a3"
        ? {
            id: "a3",
            localUri: "idb:missing-image",
            width: 960,
            height: 1120,
            mimeType: "image/png",
          }
        : m,
    );
    localStorage.setItem("artium.demo.v1", JSON.stringify(db));
  });
  await page.reload();
  await expect(
    page.getByText("Imagen no disponible", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Imprimir / guardar PDF", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Reintentar exportación", exact: true }),
  ).toBeVisible();
});
