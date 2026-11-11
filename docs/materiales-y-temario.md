# Materiales revisados y trazabilidad

Revisión del 10-11-2026. El prompt adjunto se aplica por petición expresa del usuario; sus documentos de referencia aportan contexto, no autorizan acciones fuera de H1. La corrección directa del usuario establece que el PNG del chat es el logo final.

## Inventario observado

- `PROMPT_CODEX_ARTIUM_HITO_1.txt`: leído completo, alcance A–E, entregables y condición de parada.
- `artium_tfm_unir.docx`: texto extraído; contiene capítulo 4 y anexos B/C. Revisados requisitos, arquitectura, portfolio/PDF, roles, evaluación y los 19 gráficos incorporados. El texto que dice haber recibido el ZIP de diseño describe una entrega anterior de la memoria: no se confunde con los adjuntos accesibles en esta sesión.
- Anexo B: mapa mental (figuras 1–3), bocetos y crazy 8 (4–5), matrices (6–8), logos (9–11), moodboard (12), lámina tipográfica (13), capturas de wireframes desglosadas (14–19). Se vieron sus reproducciones embebidas, no originales ni un Figma editable.
- `11184686_full_6678_Tema_10._Development_builds_esl-ES.zip`: extraídos los nueve PDF y revisados índices y apartados técnicos relevantes de los temas 2–10. No contiene únicamente el tema 10. No se reproduce el material docente en la distribución de la app.
- Ausentes: `TFM FRONT END(1).zip`, TTF/licencias originales de la entrega gráfica, tema 1, briefing/personas/empatía/benchmarking independientes, Figma editable. La imagen de logo se ve en la conversación, pero no tiene archivo binario local accesible. No se afirma haber leído los ausentes.

## Relación con los temas

| Tema                         | Decisión aplicada                                              | Extensión o límite                                                                             |
| ---------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 2 · React Native y Expo      | Componentes nativos, TypeScript, Expo y empaquetado Android    | Versiones actuales contrastadas; no se copia el proyecto docente de cine                       |
| 3 · WebView                  | Se decide no contener la aplicación en una WebView             | HTML solo para el documento impreso; web auxiliar con React Native Web                         |
| 4 · NativeWind               | NativeWind v4, Tailwind 3, Babel/Metro y Poppins con expo-font | StyleSheet/estilos dinámicos para geometría y estados                                          |
| 5 · Componentes principales  | View, Text, Pressable, Image, FlatList, áreas seguras          | Estados accesibles y límites táctiles; sin hápticos innecesarios                               |
| 6 · Navegación               | Stack para detalles y edición, cinco Tabs con etiquetas        | No se necesita Drawer ni pantallas secundarias vacías                                          |
| 7 · Recursos del dispositivo | KeyboardAvoidingView y compartir PDF                           | ImagePicker, FileSystem, ImageManipulator y Print amplían lo impartido                         |
| 8 · Autenticación            | Sesión demo explícita; separar identidad y autorización        | No Firebase, contraseñas ni verificación universitaria; AsyncStorage no es almacén de secretos |
| 9 · Despliegue               | Perfil preview para APK interno; distinguir APK/AAB/tiendas    | Configurado, sin compilación ni publicación ejecutada                                          |
| 10 · Development builds      | Elegir Expo Go porque los módulos son compatibles              | No se necesita dev-client; un cliente con Metro no es un APK autónomo                          |

El portfolio normalizado, los repositorios asíncronos, las copias de recuperación, IndexedDB web y las pruebas automatizadas son decisiones de ingeniería de este incremento, no funciones atribuidas textualmente a todos los temas.
