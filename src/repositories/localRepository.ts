import {
  ArtworkFields,
  Database,
  MediaAsset,
  OWNER_ID,
  PortfolioConfig,
  Session,
  artworkFieldsSchema,
  databaseSchema,
  mediaSchema,
} from "../domain/models";
import {
  assertOwner,
  validateDatabase,
  validatePortfolio,
} from "../domain/rules";
import { createSeed } from "../fixtures/seed";
import { AppRepository, KeyValueStore } from "./contracts";
export const STORAGE_KEY = "artium.demo.v1";
export class LocalRepository implements AppRepository {
  private db: Database | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(private storage: KeyValueStore) {}
  async load(): Promise<Database> {
    const raw = await this.storage.getItem(STORAGE_KEY);
    if (raw === null) {
      this.db = createSeed();
      return this.db;
    }
    try {
      this.db = validateDatabase(databaseSchema.parse(JSON.parse(raw)));
      return this.db;
    } catch {
      this.db = null;
      throw new Error(
        "No se pueden leer los datos guardados o su versión no es compatible. No se han sobrescrito. Reintenta o restablece la demo; antes se conservará una copia de recuperación.",
      );
    }
  }
  private mutate(change: (db: Database) => Database): Promise<Database> {
    const op = this.queue.then(async () => {
      if (!this.db) throw new Error("Espera a que se recuperen los datos.");
      const next = validateDatabase(databaseSchema.parse(change(this.db)));
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(next));
      this.db = next;
      return next;
    });
    this.queue = op.catch(() => undefined);
    return op;
  }
  signIn(role: NonNullable<Session>["role"]) {
    return this.mutate((db) => ({
      ...db,
      session: {
        role,
        userId:
          role === "student"
            ? OWNER_ID
            : role === "teacher"
              ? "demo-docente"
              : "demo-invitado",
      },
    }));
  }
  signOut() {
    return this.mutate((db) => ({ ...db, session: null }));
  }
  saveArtwork(fields: ArtworkFields, media?: MediaAsset, id?: string) {
    return this.mutate((db) => {
      assertOwner(db.session);
      const previous = id ? db.artworks.find((a) => a.id === id) : undefined;
      if (id && !previous) throw new Error("Esta obra ya no está disponible.");
      if (previous) assertOwner(db.session, previous.ownerId);
      const parsed = artworkFieldsSchema.parse(fields);
      if (media) mediaSchema.parse(media);
      if (!media && !previous) throw new Error("Selecciona una imagen.");
      const next = {
        ...parsed,
        id:
          previous?.id ??
          `obra-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ownerId: OWNER_ID,
        imageId: media?.id ?? previous!.imageId,
        updatedAt: new Date().toISOString(),
      };
      return {
        ...db,
        artworks: previous
          ? db.artworks.map((a) => (a.id === id ? next : a))
          : [next, ...db.artworks],
        media: media
          ? [...db.media.filter((m) => m.id !== media.id), media]
          : db.media,
      };
    });
  }
  deleteArtwork(id: string) {
    return this.mutate((db) => {
      const artwork = db.artworks.find((a) => a.id === id);
      if (!artwork) throw new Error("Obra no encontrada.");
      assertOwner(db.session, artwork.ownerId);
      return {
        ...db,
        artworks: db.artworks.filter((a) => a.id !== id),
        portfolio: {
          ...db.portfolio,
          selectedArtworkIds: db.portfolio.selectedArtworkIds.filter(
            (value) => value !== id,
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }
  savePortfolio(config: PortfolioConfig) {
    return this.mutate((db) => {
      assertOwner(db.session, config.ownerId);
      return {
        ...db,
        portfolio: validatePortfolio(
          { ...config, updatedAt: new Date().toISOString() },
          db,
        ),
      };
    });
  }
  reset(): Promise<Database> {
    const op = this.queue.then(async () => {
      const raw = await this.storage.getItem(STORAGE_KEY);
      if (raw !== null)
        await this.storage.setItem(
          `${STORAGE_KEY}.recovery.${Date.now()}`,
          raw,
        );
      const seed = createSeed();
      await this.storage.setItem(STORAGE_KEY, JSON.stringify(seed));
      this.db = seed;
      return seed;
    });
    this.queue = op.catch(() => undefined);
    return op;
  }
}
