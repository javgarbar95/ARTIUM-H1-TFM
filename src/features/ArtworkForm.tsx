import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useApp } from "../state/AppProvider";
import {
  ArtworkFields,
  MediaAsset,
  artworkFieldsSchema,
  disciplines,
  limits,
} from "../domain/models";
import { isOwner } from "../domain/rules";
import { pickAndStoreImage } from "../services/media";
import { OwnerGate } from "../components/OwnerGate";
import { ArtworkImage } from "../components/ArtworkImage";
import {
  Button,
  Choice,
  Confirm,
  Empty,
  Field,
  Heading,
  Notice,
  Screen,
  Text,
} from "../components/ui";
export default function ArtworkForm() {
  return (
    <OwnerGate>
      <Form />
    </OwnerGate>
  );
}
function Form() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { db, repository, run } = useApp();
  const existing = db?.artworks.find((a) => a.id === id);
  const [fields, setFields] = useState({
    title: existing?.title ?? "",
    description: existing?.description ?? "",
    technique: existing?.technique ?? "",
    year: String(existing?.year ?? new Date().getFullYear()),
    altText: existing?.altText ?? "",
    visibility: existing?.visibility ?? "private",
    discipline: existing?.discipline ?? "Pintura",
  });
  const [media, setMedia] = useState<MediaAsset>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  if (!db) return null;
  if (id && (!existing || !isOwner(db.session, existing.ownerId)))
    return (
      <Screen back>
        <Empty
          title="Edición no disponible"
          message="Solo puedes editar obras de tu propia biblioteca."
          icon="lock"
        />
      </Screen>
    );
  const patch = (key: string, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));
  const pick = async () => {
    setError("");
    setBusy(true);
    try {
      const picked = await pickAndStoreImage();
      if (picked) setMedia(picked);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo importar la imagen.",
      );
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    setError("");
    const parsed = artworkFieldsSchema.safeParse({
      ...fields,
      year: Number(fields.year),
    });
    if (!parsed.success) {
      setError(
        "Revisa los campos: todos son obligatorios. El año debe estar entre 1900 y el actual, y los textos dentro de los límites indicados.",
      );
      return;
    }
    if (!media && !existing) {
      setError("Selecciona una imagen antes de guardar.");
      return;
    }
    setBusy(true);
    try {
      await run(() =>
        repository.saveArtwork(parsed.data as ArtworkFields, media, id),
      );
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la obra.");
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!id) return;
    setBusy(true);
    try {
      await run(() => repository.deleteArtwork(id));
      setConfirm(false);
      router.replace("/profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar.");
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  };
  const preview = media ?? db.media.find((m) => m.id === existing?.imageId);
  return (
    <Screen back title={existing ? "Editar obra" : "Nueva obra"}>
      <Heading>{existing ? "Cuida cada detalle" : "Una nueva mirada"}</Heading>
      <Text>
        JPEG, PNG o WebP · hasta 20 MB. Se conserva la obra completa, sin
        recortarla.
      </Text>
      {preview ? (
        <ArtworkImage
          media={preview}
          alt={fields.altText || "Vista previa de la obra"}
          style={{ height: 230, borderRadius: 14 }}
        />
      ) : null}
      <Button
        label={preview ? "Cambiar imagen" : "Seleccionar imagen de la galería"}
        icon="image"
        variant="secondary"
        onPress={pick}
        disabled={busy}
      />
      <View>
        <Field
          label="Título"
          value={fields.title}
          onChangeText={(v) => patch("title", v)}
          limit={limits.title}
          placeholder="Pon nombre a tu obra"
        />
        <Field
          label="Descripción"
          value={fields.description}
          onChangeText={(v) => patch("description", v)}
          limit={limits.description}
          multiline
          placeholder="Cuenta la idea y el proceso"
        />
        <Field
          label="Técnica"
          value={fields.technique}
          onChangeText={(v) => patch("technique", v)}
          limit={limits.technique}
          placeholder="Por ejemplo: acuarela sobre papel"
        />
        <Field
          label="Año"
          value={fields.year}
          onChangeText={(v) => patch("year", v)}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Field
          label="Descripción accesible de la imagen"
          value={fields.altText}
          onChangeText={(v) => patch("altText", v)}
          limit={limits.altText}
          multiline
          placeholder="Describe formas, colores y elementos principales"
        />
        <Text style={{ marginBottom: 10 }}>Disciplina</Text>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {disciplines.map((d) => (
            <Choice
              key={d}
              label={d}
              selected={fields.discipline === d}
              onPress={() => patch("discipline", d)}
            />
          ))}
        </View>
        <Text style={{ marginBottom: 10 }}>Visibilidad en esta demo</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Choice
            label="Privada"
            selected={fields.visibility === "private"}
            onPress={() => patch("visibility", "private")}
          />
          <Choice
            label="Pública"
            selected={fields.visibility === "public"}
            onPress={() => patch("visibility", "public")}
          />
        </View>
      </View>
      <Notice>
        Guardar no añade la obra al portfolio. Selecciónala después desde su
        editor. La visibilidad pública solo afecta a esta demo local.
      </Notice>
      {error ? <Notice error>{error}</Notice> : null}
      <Button label="Guardar obra" icon="check" onPress={save} busy={busy} />
      <Button
        label="Cancelar edición"
        variant="quiet"
        onPress={() => router.back()}
        disabled={busy}
      />
      {existing ? (
        <Button
          label="Eliminar obra"
          variant="danger"
          icon="trash-2"
          onPress={() => setConfirm(true)}
          disabled={busy}
        />
      ) : null}
      <Confirm
        visible={confirm}
        title="¿Eliminar esta obra?"
        message="Se eliminará de la biblioteca y de la selección del portfolio. La imagen original de tu galería no se modifica."
        onCancel={() => setConfirm(false)}
        onConfirm={remove}
        busy={busy}
      />
    </Screen>
  );
}
