import { Screen, Empty, Notice } from "../../src/components/ui";
export default function Messages() {
  return (
    <Screen>
      <Empty
        title="Las conversaciones llegarán"
        message="Este espacio conectará a la comunidad creativa. Su desarrollo está previsto para el siguiente hito."
        icon="message-circle"
      />
      <Notice>
        La mensajería aún no está disponible. No se pueden enviar ni recibir
        mensajes en esta demostración.
      </Notice>
    </Screen>
  );
}
