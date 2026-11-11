import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useApp } from "../state/AppProvider";
import { isOwner } from "../domain/rules";
import { users, universities } from "../fixtures/seed";
import {
  Button,
  Confirm,
  Empty,
  Eyebrow,
  Heading,
  Notice,
  Screen,
  Text,
} from "../components/ui";
import { ArtworkCard } from "../components/ArtworkCard";
import { colors } from "../theme/tokens";
export default function ProfileScreen() {
  const { db, repository, run } = useApp();
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!db) return null;
  const own = isOwner(db.session);
  const user = users[0]!;
  const works = db.artworks.filter((a) => a.ownerId === user.id);
  const action = async (fn: () => Promise<NonNullable<typeof db>>) => {
    setBusy(true);
    setError("");
    try {
      await run(fn);
      setReset(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo guardar el cambio.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <Eyebrow>{own ? "TU ESPACIO CREATIVO" : "TU SESIÓN"}</Eyebrow>
      {own ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View
              style={{
                height: 70,
                width: 70,
                borderRadius: 35,
                backgroundColor: user.color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 23, fontFamily: "Poppins-SemiBold" }}>
                {user.initials}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Heading small>{user.displayName}</Heading>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                Estudiante demo · {universities[0]!.shortName}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.muted }}>{user.bio}</Text>
          <Button
            label="Añadir obra"
            icon="plus"
            onPress={() => router.push("/artwork/new")}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Heading small>Mi biblioteca</Heading>
            <Text style={{ color: colors.muted, fontSize: 12 }}>
              {works.length} obras
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            Tus originales, en un solo lugar. Elegirlos para el portfolio es un
            paso independiente.
          </Text>
          {works.map((a) => (
            <View key={a.id}>
              <ArtworkCard artwork={a} db={db} compact />
              <Text
                style={{
                  fontSize: 10,
                  color: colors.muted,
                  marginTop: -15,
                  marginBottom: 12,
                }}
              >
                {a.visibility === "private" ? "PRIVADA" : "PÚBLICA EN LA DEMO"}
              </Text>
            </View>
          ))}
          {!works.length ? (
            <Empty
              title="Tu biblioteca empieza aquí"
              message="Añade tu primera obra desde la galería."
            />
          ) : null}
        </>
      ) : (
        <>
          <Heading>
            {db.session?.role === "teacher"
              ? "Mirada docente"
              : "Bienvenido, visitante"}
          </Heading>
          <Notice>
            Modo de consulta: explora obras y perfiles públicos. La biblioteca y
            la edición pertenecen al estudiante demo.
          </Notice>
          <Button
            label="Explorar obras"
            icon="search"
            onPress={() => router.push("/search")}
          />
        </>
      )}
      {error ? <Notice error>{error}</Notice> : null}
      <View
        style={{
          borderTopWidth: 1,
          borderColor: colors.line,
          paddingTop: 20,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 11, color: colors.muted }}>
          Los perfiles son ficticios. La sesión se guarda en este dispositivo y
          no es autenticación segura.
        </Text>
        <Button
          label="Cerrar sesión"
          icon="log-out"
          variant="secondary"
          onPress={() => action(() => repository.signOut())}
          disabled={busy}
        />
        {own ? (
          <Button
            label="Restablecer datos demo"
            variant="quiet"
            icon="rotate-ccw"
            onPress={() => setReset(true)}
            disabled={busy}
          />
        ) : null}
      </View>
      <Confirm
        visible={reset}
        title="¿Restablecer la demo?"
        message="Se restaurarán las obras y ajustes iniciales y se cerrará la sesión. Los metadatos anteriores se conservarán como copia local de recuperación. Esta acción no borra fotos de tu galería."
        onCancel={() => setReset(false)}
        onConfirm={() => action(() => repository.reset())}
        busy={busy}
      />
    </Screen>
  );
}
