import { z } from "zod";
export const OWNER_ID = "demo-alba";
export const accents = ["#6436C9", "#2355B5", "#A02678"] as const;
export const disciplines = [
  "Pintura",
  "Ilustración",
  "Fotografía",
  "Escultura",
] as const;
export const limits = {
  title: 60,
  description: 360,
  technique: 70,
  altText: 180,
  intro: 280,
  artworks: 12,
  imageMB: 20,
};
const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Este campo es obligatorio.")
    .max(max)
    .transform((s) => s.replace(/\s+/g, " "));
export const sessionSchema = z
  .object({ role: z.enum(["student", "teacher", "guest"]), userId: z.string() })
  .nullable();
export type Session = z.infer<typeof sessionSchema>;
export interface University {
  id: string;
  name: string;
  shortName: string;
  city: string;
}
export interface User {
  id: string;
  displayName: string;
  role: "student" | "teacher";
  universityId: string;
  bio: string;
  initials: string;
  color: string;
}
export const mediaSchema = z
  .object({
    id: z.string(),
    localUri: z.string().optional(),
    bundledKey: z.string().optional(),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    width: z.number().positive().max(20000),
    height: z.number().positive().max(20000),
  })
  .refine((m) => Boolean(m.localUri || m.bundledKey));
export type MediaAsset = z.infer<typeof mediaSchema>;
export const artworkFieldsSchema = z.object({
  title: text(limits.title),
  description: text(limits.description),
  technique: text(limits.technique),
  year: z.number().int().min(1900).max(new Date().getFullYear()),
  altText: text(limits.altText),
  visibility: z.enum(["private", "public"]),
  discipline: z.enum(disciplines),
});
export type ArtworkFields = z.infer<typeof artworkFieldsSchema>;
export const artworkSchema = artworkFieldsSchema.extend({
  id: z.string(),
  ownerId: z.string(),
  imageId: z.string(),
  updatedAt: z.string(),
});
export type Artwork = z.infer<typeof artworkSchema>;
export const portfolioSchema = z.object({
  ownerId: z.string(),
  selectedArtworkIds: z.array(z.string()).max(12),
  templateId: z.enum(["gallery", "editorial"]),
  accentColor: z.enum(accents),
  intro: z
    .string()
    .trim()
    .max(limits.intro)
    .transform((s) => s.replace(/\s+/g, " ")),
  updatedAt: z.string(),
  schemaVersion: z.literal(1),
});
export type PortfolioConfig = z.infer<typeof portfolioSchema>;
export const databaseSchema = z.object({
  schemaVersion: z.literal(1),
  session: sessionSchema,
  artworks: z.array(artworkSchema),
  media: z.array(mediaSchema),
  portfolio: portfolioSchema,
});
export type Database = z.infer<typeof databaseSchema>;
export interface PortfolioDocument {
  author: Pick<User, "id" | "displayName" | "bio">;
  config: PortfolioConfig;
  works: { artwork: Artwork; media: MediaAsset }[];
}
