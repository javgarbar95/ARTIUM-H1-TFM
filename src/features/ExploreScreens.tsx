import { useMemo, useState } from "react";
import { FlatList, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArtworkCard, ArtistLine } from "../components/ArtworkCard";
import { ArtworkImage } from "../components/ArtworkImage";
import {
  Button,
  Choice,
  Empty,
  Eyebrow,
  Field,
  Heading,
  Notice,
  Screen,
  Text,
} from "../components/ui";
import { useApp } from "../state/AppProvider";
import { canView, isOwner, normalizeSearch } from "../domain/rules";
import { disciplines } from "../domain/models";
import { users, universities } from "../fixtures/seed";
import { colors } from "../theme/tokens";
export function HomeScreen() {
  const { db } = useApp();
  if (!db) return null;
  const works = db.artworks.filter((a) => a.visibility === "public");
  return (
    <Screen scroll={false}>
      <FlatList
        data={works}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{
          padding: 22,
          paddingTop: 24,
          paddingBottom: 28,
        }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 25 }}>
            <Eyebrow>MIRADAS QUE CONECTAN</Eyebrow>
            <Heading>El arte empieza{"\n"}con una mirada.</Heading>
            <Text style={{ color: colors.muted }}>
              Descubre lo que se está creando.
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 10,
              }}
            >
              <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 14 }}>
                Obras de la comunidad
              </Text>
              <Text style={{ fontSize: 10, color: colors.muted }}>
                MUESTRA DEMO
              </Text>
            </View>
          </View>
        }
        renderItem={({ item }) => <ArtworkCard artwork={item} db={db} />}
        ListEmptyComponent={
          <Empty
            title="Todavía no hay obras"
            message="Las obras con visibilidad pública aparecerán aquí."
          />
        }
      />
    </Screen>
  );
}
export function SearchScreen() {
  const { db } = useApp();
  const [query, setQuery] = useState("");
  const [university, setUniversity] = useState("");
  const [discipline, setDiscipline] = useState("");
  const filtered = useMemo(
    () =>
      db?.artworks.filter((a) => {
        const user = users.find((u) => u.id === a.ownerId);
        return (
          a.visibility === "public" &&
          normalizeSearch(`${a.title} ${user?.displayName}`).includes(
            normalizeSearch(query),
          ) &&
          (!university || user?.universityId === university) &&
          (!discipline || a.discipline === discipline)
        );
      }) ?? [],
    [db, query, university, discipline],
  );
  if (!db) return null;
  return (
    <Screen scroll={false}>
      <FlatList
        data={filtered}
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 22 }}
        ListHeaderComponent={
          <View style={{ gap: 14, marginBottom: 20 }}>
            <Eyebrow>ENCUENTRA TU INSPIRACIÓN</Eyebrow>
            <Heading>Explora otras miradas</Heading>
            <Field
              label="Buscar obras o artistas"
              placeholder="Nombre de obra o artista"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
            <Text style={{ fontFamily: "Poppins-Medium", fontSize: 12 }}>
              Universidad
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
              <Choice
                label="Todas"
                selected={!university}
                onPress={() => setUniversity("")}
              />
              {universities.map((u) => (
                <Choice
                  key={u.id}
                  label={u.shortName}
                  selected={university === u.id}
                  onPress={() => setUniversity(u.id)}
                />
              ))}
            </View>
            <Text style={{ fontFamily: "Poppins-Medium", fontSize: 12 }}>
              Disciplina
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
              <Choice
                label="Todas las disciplinas"
                selected={!discipline}
                onPress={() => setDiscipline("")}
              />
              {disciplines.map((d) => (
                <Choice
                  key={d}
                  label={d}
                  selected={discipline === d}
                  onPress={() => setDiscipline(d)}
                />
              ))}
            </View>
            {query || university || discipline ? (
              <Button
                label="Limpiar búsqueda y filtros"
                variant="quiet"
                icon="x"
                onPress={() => {
                  setQuery("");
                  setUniversity("");
                  setDiscipline("");
                }}
              />
            ) : null}
            <Text
              accessibilityLiveRegion="polite"
              style={{ color: colors.muted, fontSize: 12 }}
            >
              {filtered.length}{" "}
              {filtered.length === 1 ? "obra encontrada" : "obras encontradas"}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ArtworkCard artwork={item} db={db} compact />
        )}
        ListEmptyComponent={
          <Empty
            title="Sin resultados"
            message="Prueba otro nombre o limpia los filtros para seguir explorando."
            icon="search"
          />
        }
      />
    </Screen>
  );
}
export function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useApp();
  if (!db) return null;
  const artwork = db.artworks.find((a) => a.id === id);
  if (!artwork || !canView(db.session, artwork))
    return (
      <Screen back>
        <Empty
          title="Obra no disponible"
          message="Esta obra no existe o su visibilidad es privada."
        />
      </Screen>
    );
  const user = users.find((u) => u.id === artwork.ownerId);
  return (
    <Screen back title="Detalle de obra">
      <ArtworkImage
        media={db.media.find((m) => m.id === artwork.imageId)}
        alt={artwork.altText}
        style={{ height: 360, borderRadius: 16 }}
      />
      <View>
        <Eyebrow>
          {artwork.discipline.toUpperCase()} · {artwork.year}
        </Eyebrow>
        <Heading>{artwork.title}</Heading>
        <Text style={{ color: colors.muted, marginTop: 8 }}>
          {artwork.technique}
        </Text>
      </View>
      {user ? <ArtistLine user={user} /> : null}
      <Text>{artwork.description}</Text>
      <View
        style={{
          borderTopWidth: 1,
          borderColor: colors.line,
          paddingTop: 16,
          gap: 7,
        }}
      >
        <Text style={{ fontFamily: "Poppins-Medium", fontSize: 12 }}>
          Descripción accesible
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          {artwork.altText}
        </Text>
      </View>
      {isOwner(db.session, artwork.ownerId) ? (
        <>
          <Notice>
            {artwork.visibility === "private"
              ? "Privada · Solo tú puedes verla en la demo."
              : "Pública en esta demo local · No se ha publicado en Internet."}
          </Notice>
          <Button
            label="Editar esta obra"
            icon="edit-3"
            onPress={() => router.push(`/artwork/edit/${artwork.id}`)}
          />
        </>
      ) : null}
    </Screen>
  );
}
export function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db } = useApp();
  if (!db) return null;
  const user = users.find((u) => u.id === id);
  if (!user)
    return (
      <Screen back>
        <Empty
          title="Perfil no disponible"
          message="No encontramos este perfil de demostración."
        />
      </Screen>
    );
  const own = isOwner(db.session, user.id);
  const works = db.artworks.filter(
    (a) => a.ownerId === id && canView(db.session, a),
  );
  return (
    <Screen back title={own ? "Tu perfil artístico" : "Perfil de artista"}>
      <View
        style={{
          width: 70,
          height: 70,
          borderRadius: 35,
          backgroundColor: user.color,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontFamily: "Poppins-SemiBold", fontSize: 22 }}>
          {user.initials}
        </Text>
      </View>
      <View>
        <Eyebrow>{own ? "TU ESPACIO" : "ARTISTA DE LA COMUNIDAD"}</Eyebrow>
        <Heading>{user.displayName}</Heading>
        <Text style={{ color: colors.muted, marginTop: 9 }}>
          {universities.find((u) => u.id === user.universityId)?.name}
        </Text>
      </View>
      <Text>{user.bio}</Text>
      <Notice>
        Perfil ficticio de demostración. No representa a una persona ni una
        afiliación universitaria verificadas.
      </Notice>
      <Heading small>{own ? "Tus obras" : "Obras públicas"}</Heading>
      {works.length ? (
        works.map((a) => <ArtworkCard key={a.id} artwork={a} db={db} compact />)
      ) : (
        <Empty
          title="Sin obras públicas"
          message="Este perfil todavía no tiene obras que puedas consultar."
        />
      )}
    </Screen>
  );
}
