import test from "node:test";
import assert from "node:assert/strict";
import { createSeed, users } from "../src/fixtures/seed";
import {
  isOwner,
  canView,
  makePortfolioDocument,
  moveArtwork,
  validatePortfolio,
} from "../src/domain/rules";
import {
  LocalRepository,
  STORAGE_KEY,
} from "../src/repositories/localRepository";
import { KeyValueStore } from "../src/repositories/contracts";
import { artworkFieldsSchema } from "../src/domain/models";
import { escapeHtml, renderPortfolioHtml } from "../src/services/pdfHtml";
class MemoryStorage implements KeyValueStore {
  data = new Map<string, string>();
  writes = 0;
  fail = false;
  async getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  async setItem(k: string, v: string) {
    if (this.fail) throw new Error("Storage full");
    this.writes++;
    this.data.set(k, v);
  }
}
const image = {
  id: "new-image",
  localUri: "file:///document/new.jpg",
  width: 800,
  height: 1200,
  mimeType: "image/jpeg" as const,
};
const fields = {
  title: "Obra nueva",
  description: "Descripción de la obra.",
  technique: "Acuarela",
  year: 2026,
  altText: "Formas azules sobre papel.",
  visibility: "private" as const,
  discipline: "Pintura" as const,
};
test("hydration does not overwrite seed; restart restores metadata, media and session", async () => {
  const storage = new MemoryStorage();
  const repo = new LocalRepository(storage);
  await assert.rejects(() => repo.signIn("student"), /recuperen/);
  await repo.load();
  assert.equal(storage.writes, 0);
  await repo.signIn("student");
  const db = await repo.saveArtwork(fields, image);
  const id = db.artworks[0]!.id;
  assert(!db.portfolio.selectedArtworkIds.includes(id));
  assert.equal(db.artworks[0]!.visibility, "private");
  const restored = await new LocalRepository(storage).load();
  assert.deepEqual(restored, db);
  assert.equal(
    restored.media.find((m) => m.id === image.id)?.localUri,
    image.localUri,
  );
});
test("owner checks apply to direct repository calls and private detail access", async () => {
  const storage = new MemoryStorage();
  const repo = new LocalRepository(storage);
  await repo.load();
  for (const role of ["guest", "teacher"] as const) {
    const db = await repo.signIn(role);
    assert(!isOwner(db.session));
    await assert.rejects(() => repo.saveArtwork(fields, image), /propietario/);
    await assert.rejects(() => repo.deleteArtwork("a1"), /propietario/);
    await assert.rejects(() => repo.savePortfolio(db.portfolio), /propietario/);
  }
  await repo.signIn("student");
  await assert.rejects(() => repo.deleteArtwork("a2"), /propietario/);
  await assert.rejects(
    () => repo.saveArtwork(fields, undefined, "a2"),
    /propietario/,
  );
  const privateWork = {
    ...createSeed().artworks[0]!,
    visibility: "private" as const,
  };
  assert(!canView({ role: "guest", userId: "demo-invitado" }, privateWork));
  assert(canView({ role: "student", userId: "demo-alba" }, privateWork));
});
test("selection rejects foreign, missing, duplicate and >12 works", () => {
  const db = createSeed();
  for (const ids of [["a2"], ["missing"], ["a1", "a1"], Array(13).fill("a1")])
    assert.throws(() =>
      validatePortfolio({ ...db.portfolio, selectedArtworkIds: ids }, db),
    );
});
test("reordering respects boundaries and leaves source unchanged", () => {
  const ids = ["a1", "a3", "a5"];
  assert.deepEqual(moveArtwork(ids, "a3", -1), ["a3", "a1", "a5"]);
  assert.deepEqual(moveArtwork(ids, "a1", -1), ids);
  assert.deepEqual(moveArtwork(ids, "a5", 1), ids);
  assert.deepEqual(moveArtwork(ids, "unknown", 1), ids);
  assert.deepEqual(ids, ["a1", "a3", "a5"]);
});
test("template switches and removal preserve library; editing selected work updates preview", async () => {
  const repo = new LocalRepository(new MemoryStorage());
  await repo.load();
  const original = await repo.signIn("student");
  let db = await repo.savePortfolio({
    ...original.portfolio,
    templateId: "editorial",
    selectedArtworkIds: ["a3", "a1"],
  });
  assert.deepEqual(db.artworks, original.artworks);
  db = await repo.saveArtwork(
    { ...fields, title: "Título actualizado" },
    undefined,
    "a3",
  );
  assert.equal(
    makePortfolioDocument(db, users[0]!).works[0]!.artwork.title,
    "Título actualizado",
  );
  db = await repo.savePortfolio({
    ...db.portfolio,
    selectedArtworkIds: ["a1"],
  });
  assert(db.artworks.some((a) => a.id === "a3"));
  db = await repo.deleteArtwork("a1");
  assert(!db.portfolio.selectedArtworkIds.includes("a1"));
  assert(!db.artworks.some((a) => a.id === "a1"));
});
test("serialized mutations do not lose updates; failed write is not committed", async () => {
  const storage = new MemoryStorage();
  const repo = new LocalRepository(storage);
  await repo.load();
  await repo.signIn("student");
  await Promise.all([
    repo.saveArtwork({ ...fields, title: "Primera" }, image),
    repo.saveArtwork(
      { ...fields, title: "Segunda" },
      { ...image, id: "second" },
    ),
  ]);
  let db = await new LocalRepository(storage).load();
  assert.equal(db.artworks.length, 8);
  storage.fail = true;
  await assert.rejects(() => repo.deleteArtwork("a1"), /full/);
  storage.fail = false;
  db = await repo.saveArtwork(
    { ...fields, title: "Tras fallo" },
    undefined,
    "a3",
  );
  assert(db.artworks.some((a) => a.id === "a1"));
});
test("corrupt or unknown schemas are preserved until explicit reset with backup", async () => {
  for (const raw of [
    "{broken",
    JSON.stringify({ ...createSeed(), schemaVersion: 2 }),
  ]) {
    const storage = new MemoryStorage();
    storage.data.set(STORAGE_KEY, raw);
    const repo = new LocalRepository(storage);
    await assert.rejects(() => repo.load(), /No se han sobrescrito/);
    assert.equal(storage.data.get(STORAGE_KEY), raw);
    assert.equal(storage.writes, 0);
    const db = await repo.reset();
    assert.equal(db.session, null);
    assert(
      [...storage.data.entries()].some(
        ([key, v]) => key.includes(".recovery.") && v === raw,
      ),
    );
  }
});
test("PDF contains only selected owned works, order and escaped text", () => {
  const db = createSeed();
  db.portfolio.selectedArtworkIds = ["a3", "a1"];
  db.artworks[0]!.title = '<script>alert("x")</script>';
  const document = makePortfolioDocument(db, users[0]!);
  const images = document.works.map(({ media }) => ({
    id: media.id,
    width: 10,
    height: 10,
    dataUri: "data:image/png;base64,YQ==",
  }));
  const html = renderPortfolioHtml(document, images);
  assert(html.indexOf("El peso del silencio") < html.indexOf("&lt;script&gt;"));
  assert(!html.includes("<script>"));
  assert(!html.includes("Órbita suave"));
  assert(!html.includes("mailto:"));
  assert(!html.includes("<button"));
  assert.equal((html.match(/<article>/g) ?? []).length, 2);
  assert.equal(escapeHtml(`<>&"'`), "&lt;&gt;&amp;&quot;&#39;");
  assert.throws(() => renderPortfolioHtml(document, []), /imagen/);
  assert.throws(
    () =>
      renderPortfolioHtml(document, [
        { ...images[0]!, dataUri: "javascript:alert(1)" },
      ]),
    /imagen/,
  );
});
test("empty portfolio, 12 long works, correct page count in both templates", () => {
  const db = createSeed();
  db.portfolio.selectedArtworkIds = [];
  assert.throws(
    () => renderPortfolioHtml(makePortfolioDocument(db, users[0]!), []),
    /al menos/,
  );
  db.artworks = Array.from({ length: 12 }, (_, i) => ({
    ...db.artworks[0]!,
    id: `work-${i}`,
    title: "A".repeat(60),
    description: "Texto extenso. ".repeat(25).slice(0, 360),
  }));
  db.portfolio.selectedArtworkIds = db.artworks.map((a) => a.id);
  for (const [template, count] of [
    ["gallery", 7],
    ["editorial", 13],
  ] as const) {
    db.portfolio.templateId = template;
    const html = renderPortfolioHtml(makePortfolioDocument(db, users[0]!), [
      {
        id: "a1",
        width: 960,
        height: 1120,
        dataUri: "data:image/png;base64,YQ==",
      },
    ]);
    assert.equal((html.match(/<section class="page/g) ?? []).length, count);
  }
});
test("field limits and whitespace normalization keep the print layout bounded", () => {
  assert(
    !artworkFieldsSchema.safeParse({ ...fields, title: "x".repeat(61) })
      .success,
  );
  assert(!artworkFieldsSchema.safeParse({ ...fields, year: 1800 }).success);
  assert(!artworkFieldsSchema.safeParse({ ...fields, year: 2027 }).success);
  assert(!artworkFieldsSchema.safeParse({ ...fields, altText: "" }).success);
  assert.equal(
    artworkFieldsSchema.parse({
      ...fields,
      description: "Muchos\n\n\n saltos\tde línea",
    }).description,
    "Muchos saltos de línea",
  );
});
test("accent contrast on white is at least 4.5:1", () => {
  for (const hex of ["#6436C9", "#2355B5", "#A02678"]) {
    const rgb = hex
      .match(/[0-9a-f]{2}/gi)!
      .map((c) => parseInt(c, 16) / 255)
      .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
    const luminance = 0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!;
    assert(1.05 / (luminance + 0.05) >= 4.5);
  }
});
