import { router } from "expo-router";
import { Button, Empty, Screen } from "../src/components/ui";
export default function NotFound() {
  return (
    <Screen>
      <Empty
        title="Este espacio no existe"
        message="Vuelve al inicio para seguir explorando."
      />
      <Button label="Volver al inicio" onPress={() => router.replace("/")} />
    </Screen>
  );
}
