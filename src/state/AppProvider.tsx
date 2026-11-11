import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Database } from "../domain/models";
import { LocalRepository } from "../repositories/localRepository";
import { AppRepository } from "../repositories/contracts";
const repository = new LocalRepository(AsyncStorage);
type State = {
  db: Database | null;
  error: string;
  loading: boolean;
  repository: AppRepository;
  run: (operation: () => Promise<Database>) => Promise<Database>;
  reload: () => void;
};
const Context = createContext<State | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const reload = () => {
    setLoading(true);
    setError("");
    repository
      .load()
      .then(setDb)
      .catch((e) => setError(String(e.message)))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    let active = true;
    repository
      .load()
      .then((next) => {
        if (active) setDb(next);
      })
      .catch((e) => {
        if (active) setError(String(e.message));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const run = async (operation: () => Promise<Database>) => {
    const next = await operation();
    setDb(next);
    setError("");
    return next;
  };
  return (
    <Context.Provider value={{ db, error, loading, repository, run, reload }}>
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("Falta AppProvider");
  return value;
}
