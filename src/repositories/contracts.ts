import {
  ArtworkFields,
  Database,
  MediaAsset,
  PortfolioConfig,
  Session,
} from "../domain/models";
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export interface AuthRepository {
  signIn(role: NonNullable<Session>["role"]): Promise<Database>;
  signOut(): Promise<Database>;
}
export interface ArtworkRepository {
  saveArtwork(
    fields: ArtworkFields,
    media?: MediaAsset,
    id?: string,
  ): Promise<Database>;
  deleteArtwork(id: string): Promise<Database>;
}
export interface PortfolioRepository {
  savePortfolio(config: PortfolioConfig): Promise<Database>;
}
export interface AppRepository
  extends AuthRepository, ArtworkRepository, PortfolioRepository {
  load(): Promise<Database>;
  reset(): Promise<Database>;
}
