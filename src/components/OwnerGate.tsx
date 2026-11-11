import { ReactNode } from "react";
import { useApp } from "../state/AppProvider";
import { isOwner } from "../domain/rules";
import { Empty, Screen } from "./ui";
export function OwnerGate({
  children,
  ownerId,
}: {
  children: ReactNode;
  ownerId?: string;
}) {
  const { db } = useApp();
  if (!db || !isOwner(db.session, ownerId))
    return (
      <Screen back>
        <Empty
          title="Espacio de creación"
          message="Esta acción está disponible para el estudiante propietario de la demostración. Tu sesión permite explorar las obras públicas."
          icon="lock"
        />
      </Screen>
    );
  return <>{children}</>;
}
