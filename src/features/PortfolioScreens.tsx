import { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useApp } from "../state/AppProvider";
import { isOwner, makePortfolioDocument, moveArtwork } from "../domain/rules";
import { accents, limits } from "../domain/models";
import { users } from "../fixtures/seed";
import { PortfolioRenderer } from "../components/PortfolioRenderer";
import { ArtworkImage } from "../components/ArtworkImage";
import { OwnerGate } from "../components/OwnerGate";
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
import {
  ExportStage,
  exportPortfolio,
  printPortfolio,
} from "../services/exportPortfolio";
import { colors } from "../theme/tokens";
export function PortfolioScreen() {
  const { db } = useApp();
  if (!db) return null;
  if (!isOwner(db.session))
    return (
      <Screen>
        <Eyebrow>PORTFOLIOS QUE CUENTAN HISTORIAS</Eyebrow>
        <Heading>Descubre a sus autores</Heading>
        <Notice>
          Estás en modo consulta. La creación de portfolio está disponible para
          el estudiante demo.
        </Notice>
        {users.map((user) => (
          <Button
            key={user.id}
            label={`Ver perfil de ${user.displayName}`}
            variant="secondary"
            icon="arrow-up-right"
            onPress={() => router.push(`/artist/${user.id}`)}
          />
        ))}
      </Screen>
    );
  return (
    <Screen>
      <View style={{ gap: 7 }}>
        <Eyebrow>HECHO POR TI</Eyebrow>
        <Heading>Mi portfolio</Heading>
        <Text style={{ color: colors.muted }}>
          Tu obra, en el orden que tú eliges.
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ fontSize: 11, color: colors.muted }}>
          {db.portfolio.selectedArtworkIds.length}/12 obras · Borrador local
        </Text>
        <Text style={{ fontSize: 11, color: colors.brand }}>
          {db.portfolio.templateId === "gallery" ? "Galería" : "Editorial"}
        </Text>
      </View>
      <Button
        label="Editar portfolio"
        icon="sliders"
        onPress={() => router.push("/portfolio/editor")}
      />
      <Button
        label="Vista previa y PDF"
        icon="file-text"
        variant="secondary"
        onPress={() => router.push("/portfolio/preview")}
      />
      <PortfolioRenderer document={makePortfolioDocument(db, users[0]!)} />
      <Notice>
        El enlace público llegará en una fase posterior. Tu portfolio permanece
        en este dispositivo hasta que decidas compartir un PDF.
      </Notice>
    </Screen>
  );
}
export function EditorScreen() {
  return (
    <OwnerGate>
      <Editor />
    </OwnerGate>
  );
}
function Editor() {
  const { db, repository, run } = useApp();
  const [config, setConfig] = useState(db!.portfolio);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  if (!db) return null;
  const own = db.artworks.filter((a) => a.ownerId === config.ownerId);
  const toggle = (id: string) => {
    setError("");
    setConfig((c) => {
      if (c.selectedArtworkIds.includes(id))
        return {
          ...c,
          selectedArtworkIds: c.selectedArtworkIds.filter((v) => v !== id),
        };
      if (c.selectedArtworkIds.length === limits.artworks) {
        setError(
          "El portfolio admite un máximo de 12 obras. Retira una antes de añadir otra.",
        );
        return c;
      }
      return { ...c, selectedArtworkIds: [...c.selectedArtworkIds, id] };
    });
  };
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await run(() => repository.savePortfolio(config));
      router.back();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo guardar el portfolio.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen back title="Editar portfolio">
      <Eyebrow>TU OBRA, TU RELATO</Eyebrow>
      <Heading>Da forma a tu selección</Heading>
      <Text style={{ color: colors.muted }}>
        Máximo 12 obras. Retirarlas del portfolio no las borra de tu biblioteca.
      </Text>
      <Heading small>01 · Presentación</Heading>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <Choice
          label="Galería · 2 columnas"
          selected={config.templateId === "gallery"}
          onPress={() => setConfig((c) => ({ ...c, templateId: "gallery" }))}
        />
        <Choice
          label="Editorial · Vertical"
          selected={config.templateId === "editorial"}
          onPress={() => setConfig((c) => ({ ...c, templateId: "editorial" }))}
        />
      </View>
      <Text style={{ fontSize: 12, color: colors.muted }}>
        PDF con portada y{" "}
        {config.templateId === "gallery" ? "dos obras" : "una obra"} por página.
      </Text>
      <Field
        label="Introducción del portfolio"
        multiline
        value={config.intro}
        onChangeText={(intro) => setConfig((c) => ({ ...c, intro }))}
        limit={limits.intro}
      />
      <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13 }}>
        Color de acento
      </Text>
      <View style={{ flexDirection: "row", gap: 14 }}>
        {accents.map((accent, i) => (
          <Pressable
            key={accent}
            accessibilityRole="button"
            accessibilityLabel={`Acento ${["Morado", "Azul", "Magenta"][i]}`}
            accessibilityState={{ selected: config.accentColor === accent }}
            onPress={() => setConfig((c) => ({ ...c, accentColor: accent }))}
            style={{
              height: 52,
              width: 52,
              borderRadius: 26,
              backgroundColor: accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {config.accentColor === accent ? (
              <Feather name="check" size={23} color="#fff" />
            ) : null}
          </Pressable>
        ))}
      </View>
      <Heading small>02 · Selección y orden</Heading>
      <Text>{config.selectedArtworkIds.length}/12 obras seleccionadas</Text>
      {config.selectedArtworkIds.map((id, i) => {
        const artwork = own.find((a) => a.id === id);
        if (!artwork) return null;
        return (
          <View
            key={id}
            style={{
              padding: 12,
              backgroundColor: "#fff",
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 14,
              gap: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
            >
              <ArtworkImage
                media={db.media.find((m) => m.id === artwork.imageId)}
                alt={artwork.altText}
                style={{ width: 58, height: 65, borderRadius: 6 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.brand, fontSize: 10 }}>
                  {String(i + 1).padStart(2, "0")} /{" "}
                  {artwork.visibility === "private"
                    ? "Privada, incluida en el PDF"
                    : "Obra seleccionada"}
                </Text>
                <Text style={{ fontFamily: "Poppins-Medium", fontSize: 13 }}>
                  {artwork.title}
                </Text>
              </View>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {([-1, 1] as const).map((direction) => (
                <Pressable
                  key={direction}
                  accessibilityRole="button"
                  accessibilityLabel={`${direction === -1 ? "Subir" : "Bajar"} ${artwork.title}`}
                  accessibilityState={{
                    disabled:
                      direction === -1
                        ? i === 0
                        : i === config.selectedArtworkIds.length - 1,
                  }}
                  disabled={
                    direction === -1
                      ? i === 0
                      : i === config.selectedArtworkIds.length - 1
                  }
                  onPress={() =>
                    setConfig((c) => ({
                      ...c,
                      selectedArtworkIds: moveArtwork(
                        c.selectedArtworkIds,
                        id,
                        direction,
                      ),
                    }))
                  }
                  style={{
                    minWidth: 60,
                    minHeight: 48,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: (
                      direction === -1
                        ? i === 0
                        : i === config.selectedArtworkIds.length - 1
                    )
                      ? 0.3
                      : 1,
                  }}
                >
                  <Feather
                    name={direction === -1 ? "arrow-up" : "arrow-down"}
                    size={18}
                    color={colors.brand}
                  />
                  <Text style={{ fontSize: 9 }}>
                    {direction === -1 ? "Subir" : "Bajar"}
                  </Text>
                </Pressable>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Retirar ${artwork.title} del portfolio`}
                onPress={() => toggle(id)}
                style={{
                  minHeight: 48,
                  minWidth: 72,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="minus" size={18} color={colors.brand} />
                <Text style={{ fontSize: 9 }}>Retirar</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
      {!config.selectedArtworkIds.length ? (
        <Empty
          title="Elige tu primera obra"
          message="Añádela desde la biblioteca que aparece debajo."
        />
      ) : null}
      <Heading small>En tu biblioteca</Heading>
      {own
        .filter((a) => !config.selectedArtworkIds.includes(a.id))
        .map((a) => (
          <Button
            key={a.id}
            label={`Añadir ${a.title}`}
            icon="plus"
            variant="secondary"
            onPress={() => toggle(a.id)}
          />
        ))}
      {own.every((a) => config.selectedArtworkIds.includes(a.id)) ? (
        <Text style={{ fontSize: 12, color: colors.muted }}>
          No quedan obras por seleccionar. Puedes incorporar más desde Mi
          biblioteca.
        </Text>
      ) : null}
      <Notice>
        El PDF contendrá todas las obras seleccionadas, incluidas las privadas.
        Revisa la selección antes de compartirlo.
      </Notice>
      {error ? <Notice error>{error}</Notice> : null}
      <Button
        label={preview ? "Ocultar vista previa" : "Previsualizar cambios"}
        icon="eye"
        variant="secondary"
        onPress={() => setPreview((v) => !v)}
      />
      {preview ? (
        <PortfolioRenderer
          document={makePortfolioDocument(db, users[0]!, config)}
        />
      ) : null}
      <Button
        label="Guardar portfolio"
        icon="check"
        onPress={save}
        busy={busy}
      />
      <Button
        label="Cancelar cambios"
        variant="quiet"
        onPress={() => router.back()}
        disabled={busy}
      />
    </Screen>
  );
}
export function PreviewScreen() {
  return (
    <OwnerGate>
      <Preview />
    </OwnerGate>
  );
}
function Preview() {
  const { db } = useApp();
  const [stage, setStage] = useState<ExportStage>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  if (!db) return null;
  const document = makePortfolioDocument(db, users[0]!);
  const busy = stage !== undefined && stage !== "done";
  const exportPdf = async () => {
    setError("");
    setMessage("");
    try {
      setMessage(await exportPortfolio(document, setStage));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No se pudo generar el PDF. Revisa las imágenes y reintenta.",
      );
      setStage("done");
    }
  };
  const print = async () => {
    setError("");
    setStage("generating");
    try {
      await printPortfolio(document);
      setMessage("Se han abierto las opciones de impresión del sistema.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "La impresión no está disponible.",
      );
    } finally {
      setStage("done");
    }
  };
  return (
    <Screen back title="Vista previa">
      <Eyebrow>LISTO PARA CONTAR TU HISTORIA</Eyebrow>
      <Heading>De tu espacio al papel</Heading>
      <Text style={{ color: colors.muted }}>
        A4 · Portada +{" "}
        {db.portfolio.templateId === "gallery" ? "2 obras" : "1 obra"} por
        página. El PDF conserva las imágenes completas.
      </Text>
      {Platform.OS === "web" ? (
        <Notice>
          Vista web auxiliar: se abrirá la impresión del navegador. La
          generación nativa se comprueba en Android.
        </Notice>
      ) : null}
      <Button
        label={
          busy
            ? {
                preparing: "Preparando imágenes…",
                generating: "Generando documento…",
                sharing: "Abriendo opciones…",
                done: "",
              }[stage!]
            : error
              ? "Reintentar exportación"
              : Platform.OS === "web"
                ? "Imprimir / guardar PDF"
                : "Generar y compartir PDF"
        }
        icon="download"
        onPress={exportPdf}
        disabled={!document.works.length || busy}
        busy={busy}
      />
      {busy ? (
        <Text accessibilityLiveRegion="polite">
          {stage === "preparing"
            ? "Preparando imágenes…"
            : stage === "generating"
              ? "Generando PDF…"
              : "Abriendo diálogo del sistema…"}
        </Text>
      ) : null}
      {error ? <Notice error>{error}</Notice> : null}
      {message ? <Notice>{message}</Notice> : null}
      {message.includes("No hay un servicio") ? (
        <Button
          label="Abrir opciones de impresión"
          onPress={print}
          variant="secondary"
          disabled={busy}
        />
      ) : null}
      <PortfolioRenderer document={document} />
    </Screen>
  );
}
