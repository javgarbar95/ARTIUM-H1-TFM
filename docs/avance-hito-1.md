# Avance Hito 1 · 10 de noviembre de 2026

## Resultado

Implementado un incremento React Native ejecutable con cinco pestañas, Stack, datos locales y dos plantillas reales de portfolio. Ningún archivo de Nexus ha sido modificado. No se ha creado repositorio remoto, desplegado a producción ni enviado comunicaciones.

| Requisito | Implementación                                                            | Evidencia / límite                                                                        |
| --------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| RF01      | Acceso estudiante, docente, invitado; cierre; persistencia                | Pruebas de lógica y sesión web; no autenticación segura                                   |
| RF02–RF04 | Feed, búsqueda título/artista, universidad/disciplina, detalle y perfiles | Recorrido web completo a 360 y 393 px; retorno conserva filtros                           |
| RF05      | Alta/edición/borrado, importación persistente, privacidad                 | Alta y recarga reales en web; File/Directory nativo empaquetado, pendiente en dispositivo |
| RF06      | Selección propia, retirada, orden y máximo doce                           | Reglas, operaciones concurrentes, eliminación de referencias, UI web                      |
| RF07      | Galería y Editorial, introducción, tres acentos, vista previa             | Cambiar plantilla no copia ni modifica obras; cambios reflejados tras editar              |
| RF08      | HTML A4 escapado, imágenes resueltas, PDF y compartir nativo              | Implementado; PDF de maquetación revisado con Chromium. Aceptación Android pendiente      |
| RNF       | Esquema validado, hidratación, recuperación, límites y accesibilidad      | TypeScript, lint y pruebas; TalkBack y texto ampliado nativo pendientes                   |

## Diseño y decisiones

Se conserva la arquitectura de los wireframes: cinco Tabs, feed de obra, búsqueda académica, biblioteca/perfil. El editor y la exportación desarrollan lo especificado en el capítulo 4. Predominan fondos claros, Poppins, obra completa y acentos morado/azul/magenta. Las ilustraciones geométricas son recursos propios de demostración, no imágenes del moodboard.

El logo está definido por el PNG del usuario; su archivo no está materializado en el workspace. Se preparó la incorporación exacta con `npm run brand:logo`. No se usó el logo anterior del DOCX ni se dibujó otro símbolo.

`PortfolioDocument` es común para la vista móvil y el renderer HTML/PDF. Selección y orden viven en `PortfolioConfig`, mientras `Artwork` conserva el contenido. Los repositorios comprueban propiedad, incluso si se invocan desde una ruta directa. Se utilizan solo Context/hooks; no Redux.

## Pendientes para cerrar la aceptación de H1

1. Recibir el archivo PNG descargable definitivo e integrarlo con el comando preparado. Recibir originales del ZIP de diseño si se quiere contrastar con los recursos originales.
2. Ejecutar en Android con Expo Go SDK 58 o APK: importación, permisos/cancelación, copia de imagen y reinicio, PDF abierto, compartir/cancelar, galería/editorial, doce obras y fallos de imagen. Registrar evidencia nativa real.
3. Repetir los dos checks remotos de Expo Doctor cuando el entorno permita acceder a Expo/React Native Directory. Los checks locales y `expo install --check` pasan.
4. Validar TalkBack, fuente del sistema ampliada, teclado y áreas seguras en dispositivo. iOS no se declara probado.

Estas pendientes no se rellenan con resultados simulados. No se considera aprobado el criterio PDF Android con el PDF auxiliar de Chromium. La implementación se detiene aquí, sin iniciar H2.
