import "../global.css";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "../src/state/AppProvider";
import {
  Button,
  Confirm,
  Heading,
  Notice,
  Screen,
  Text,
} from "../src/components/ui";
function Navigation() {
  const { db, error, loading, reload, repository, run } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [resetError, setResetError] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        <ActivityIndicator color="#6436C9" />
        <Text>Recuperando tu espacio…</Text>
      </View>
    );
  if (!db)
    return (
      <Screen>
        <Heading>Vamos a recuperar tu espacio</Heading>
        <Notice error>{error}</Notice>
        <Button label="Reintentar lectura" onPress={reload} />
        <Button
          label="Restablecer demo"
          variant="secondary"
          onPress={() => setConfirm(true)}
        />
        {resetError ? <Notice error>{resetError}</Notice> : null}
        <Confirm
          visible={confirm}
          title="¿Restablecer los datos?"
          message="Los datos actuales se copiarán a una clave de recuperación y se cargará la demo inicial. No se sobrescriben sin esta confirmación."
          onCancel={() => setConfirm(false)}
          busy={busy}
          onConfirm={async () => {
            setBusy(true);
            try {
              await run(() => repository.reset());
              setConfirm(false);
            } catch {
              setResetError(
                "No se pudo guardar la copia de recuperación. Tus datos no se han reemplazado.",
              );
            } finally {
              setBusy(false);
            }
          }}
        />
      </Screen>
    );
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FAF9FC" },
      }}
    >
      <Stack.Protected guard={!db.session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!db.session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="artwork/[id]" />
        <Stack.Screen name="artwork/new" />
        <Stack.Screen name="artwork/edit/[id]" />
        <Stack.Screen name="artist/[id]" />
        <Stack.Screen name="portfolio/editor" />
        <Stack.Screen name="portfolio/preview" />
      </Stack.Protected>
    </Stack>
  );
}
export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
  });
  if (!loaded && !error)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator color="#6436C9" />
      </View>
    );
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AppProvider>
        <Navigation />
      </AppProvider>
    </SafeAreaProvider>
  );
}
