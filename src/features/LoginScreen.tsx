import { useState } from "react";
import { View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import {
  Button,
  Eyebrow,
  Heading,
  Notice,
  Screen,
  Text,
} from "../components/ui";
import { useApp } from "../state/AppProvider";
import { Session } from "../domain/models";
import { colors } from "../theme/tokens";
export default function LoginScreen() {
  const { repository, run } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const enter = async (role: NonNullable<Session>["role"]) => {
    setBusy(true);
    try {
      await run(() => repository.signIn(role));
    } catch {
      setError(
        "No se pudo guardar la sesión. Comprueba el almacenamiento y reintenta.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen>
      <View style={{ paddingTop: 24, paddingBottom: 12 }}>
        <Eyebrow>COMUNIDAD CREATIVA UNIVERSITARIA</Eyebrow>
        <Heading>Tu arte merece{"\n"}su propio espacio.</Heading>
        <Text style={{ marginTop: 14, color: colors.muted }}>
          Explora nuevas miradas. Da forma a tu portfolio. Comparte tu proceso.
        </Text>
      </View>
      <View
        style={{
          backgroundColor: colors.soft,
          borderRadius: 20,
          padding: 23,
          gap: 12,
        }}
      >
        <Feather name="layers" size={30} color={colors.brand} />
        <Heading small>Un lugar para lo que creas</Heading>
        <Text style={{ fontSize: 13, color: colors.muted }}>
          Una biblioteca de obra y dos maneras de contar tu historia: Galería y
          Editorial.
        </Text>
      </View>
      <View style={{ gap: 12, marginTop: 8 }}>
        <Text style={{ fontFamily: "Poppins-SemiBold" }}>
          Elige cómo explorar
        </Text>
        <Button
          label="Entrar como estudiante demo"
          icon="edit-3"
          onPress={() => enter("student")}
          disabled={busy}
        />
        <Button
          label="Entrar como docente"
          icon="book-open"
          variant="secondary"
          onPress={() => enter("teacher")}
          disabled={busy}
        />
        <Button
          label="Explorar como invitado"
          icon="arrow-right"
          variant="quiet"
          onPress={() => enter("guest")}
          disabled={busy}
        />
      </View>
      {error ? <Notice error>{error}</Notice> : null}
      <Text style={{ fontSize: 11, textAlign: "center", color: colors.muted }}>
        Demostración local · Perfiles ficticios{"\n"}Sin contraseñas ni
        verificación universitaria.{"\n"}Las sesiones demo no son autenticación
        segura.
      </Text>
    </Screen>
  );
}
