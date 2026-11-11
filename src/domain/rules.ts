import {
  Artwork,
  Database,
  OWNER_ID,
  PortfolioConfig,
  PortfolioDocument,
  Session,
  User,
  portfolioSchema,
} from "./models";
export function isOwner(session: Session, ownerId = OWNER_ID): boolean {
  return (
    session?.role === "student" &&
    session.userId === OWNER_ID &&
    ownerId === session.userId
  );
}
export function assertOwner(session: Session, ownerId = OWNER_ID) {
  if (!isOwner(session, ownerId))
    throw new Error(
      "Solo el estudiante propietario puede editar este contenido.",
    );
}
export function canView(session: Session, artwork: Artwork): boolean {
  return (
    !!session &&
    (artwork.visibility === "public" || isOwner(session, artwork.ownerId))
  );
}
export function validatePortfolio(
  config: PortfolioConfig,
  db: Database,
): PortfolioConfig {
  const parsed = portfolioSchema.parse(config);
  if (
    parsed.ownerId !== OWNER_ID ||
    new Set(parsed.selectedArtworkIds).size !== parsed.selectedArtworkIds.length
  )
    throw new Error("La selección del portfolio no es válida.");
  for (const id of parsed.selectedArtworkIds)
    if (!db.artworks.some((a) => a.id === id && a.ownerId === parsed.ownerId))
      throw new Error("Solo puedes seleccionar obras de tu biblioteca.");
  return parsed;
}
export function moveArtwork(
  ids: string[],
  id: string,
  direction: -1 | 1,
): string[] {
  const next = [...ids];
  const from = next.indexOf(id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= next.length) return next;
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}
export function makePortfolioDocument(
  db: Database,
  author: User,
  config = db.portfolio,
): PortfolioDocument {
  validatePortfolio(config, db);
  if (author.id !== config.ownerId)
    throw new Error("La autoría no coincide con el portfolio.");
  return {
    author: { id: author.id, displayName: author.displayName, bio: author.bio },
    config,
    works: config.selectedArtworkIds.map((id) => {
      const artwork = db.artworks.find((a) => a.id === id)!;
      const media = db.media.find((m) => m.id === artwork.imageId);
      if (!media)
        throw new Error("Una imagen no está disponible. Revisa la biblioteca.");
      return { artwork, media };
    }),
  };
}
export function validateDatabase(raw: Database): Database {
  if (
    raw.session &&
    ((raw.session.role === "student" && raw.session.userId !== OWNER_ID) ||
      (raw.session.role === "teacher" &&
        raw.session.userId !== "demo-docente") ||
      (raw.session.role === "guest" && raw.session.userId !== "demo-invitado"))
  )
    throw new Error("Sesión demo no válida.");
  if (
    new Set(raw.artworks.map((a) => a.id)).size !== raw.artworks.length ||
    new Set(raw.media.map((m) => m.id)).size !== raw.media.length
  )
    throw new Error("Hay identificadores duplicados.");
  if (raw.artworks.some((a) => !raw.media.some((m) => m.id === a.imageId)))
    throw new Error("Faltan referencias de imágenes.");
  validatePortfolio(raw.portfolio, raw);
  return raw;
}
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}
