# Pruebas H1 · Resultados reales

Fecha: **10 de noviembre de 2026**, zona de referencia Europe/Madrid. Entorno: Codex Cloud Linux, Node 24.22.1, npm 11.9.0, Chromium 155 con Playwright 1.64.1. Sin Android SDK, ADB, emulador ni entorno iOS. Proyecto local en `/workspace/work/artium`.

## Ejecutado

| Comprobación                                           | Resultado observado                                                                                                                        |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Instalación reproducible `npm ci --no-audit --no-fund` | Correcta, 839 paquetes instalados; lockfile conservado                                                                                     |
| `npm run typecheck`                                    | Correcto, cero errores                                                                                                                     |
| `npm run lint`                                         | Correcto, cero errores/advertencias con el parser instalado y TypeScript 5.9.3                                                             |
| `npm test`                                             | 11 pruebas aprobadas                                                                                                                       |
| `EXPO_OFFLINE=1 npm run check:versions`                | Dependencias actualizadas según matriz del SDK; advertencia explícita de validación offline                                                |
| `npx expo-doctor`                                      | 18/20 aprobadas; dos comprobaciones externas bloqueadas, no se cuentan como aprobadas                                                      |
| `EXPO_OFFLINE=1 npm run export:android`                | Bundle Hermes/activos exportados; no es APK ni ejecución Android                                                                           |
| `EXPO_OFFLINE=1 npm run export:web`                    | Bundle web y activos exportados                                                                                                            |
| `npm run test:e2e`                                     | 4 escenarios aprobados en Chromium, 25,5 s en la ejecución completa registrada                                                             |
| `npm run verify:pdf`                                   | Dos PDF A4 auxiliares con doce obras y textos máximos, sin desbordamientos medidos en el layout                                            |
| `pdfinfo` / `pdftotext` / renderizado PNG de PDFs      | Galería: 7 páginas; Editorial: 13. Confirmados los 12 marcadores finales; abiertas las páginas de obra renderizadas para inspección visual |
| `npm run android -- --port 8082`                       | No ejecutable: SDK ausente, `CommandError: spawn adb ENOENT`                                                                               |
| `git status --short` en Nexus                          | Sin cambios: el proyecto existente no fue modificado                                                                                       |

Logs directos finales: `evidencias/comprobaciones-locales.txt` y `evidencias/empaquetado.txt`. Los PDF de evidencias fueron generados con **Chromium**, no con expo-print en móvil. No se usan como aceptación Android.

## Cobertura de las 11 pruebas de dominio/repositorio/PDF

- No se escriben semillas antes de hidratar; restauración de sesión, metadatos e imagen referenciada.
- Invitado/docente no pueden crear, eliminar o configurar; estudiante no puede editar/eliminar obra ajena. Obra privada inaccesible a consulta.
- Selección rechaza obras ajenas, inexistentes, repetidas y más de doce.
- Subir/bajar respeta extremos y no muta el array original.
- Cambiar plantilla/retirar selección conserva biblioteca; edición se refleja en PortfolioDocument y borrado limpia referencias.
- Escrituras concurrentes serializadas; el error de almacenamiento no se confirma como éxito.
- Datos corruptos o esquema desconocido preservados hasta reset explícito, con copia previa.
- HTML escapado, orden, autoría, solo seleccionadas; rechazo de imagen ausente/URI inválida.
- Portfolio vacío y doce obras, portada + 6/12 páginas respectivamente.
- Campos y límites, normalización de saltos/espacios.
- Los tres acentos superan 4,5:1 sobre blanco.

## Recorridos web reales

Los dos recorridos de anchura **360×852 y 393×852** incluyen acceso demo, feed, búsqueda «Órbita» + UPV, obra y perfil ajeno, retorno manteniendo filtros, cero resultados y limpieza. Alta desde selector de archivo, validación vacía, datos, guardado privado, recarga y persistencia en IndexedDB. Confirmación de que la nueva obra no se incluye automáticamente; selección, subir, Editorial, acento azul, guardar, vista previa e impresión del navegador. Se inspecciona el documento preparado (tres obras, cuatro páginas, orden). Se recarga y se comprueba la imagen. Invitado bloqueado por rutas directas a alta/editor. Mensajes indica pendiente. Sin errores JS de página observados en esos recorridos.

Otros escenarios: datos corruptos, cancelación de restablecer y recuperación confirmada; editar obra seleccionada y observar actualización; cancelar borrado y confirmar después; limpiar selección y botón de PDF deshabilitado; imagen inaccesible con estado explícito y reintento de exportación.

Capturas reales: `inicio-360.png`, `inicio-393.png`, `portfolio-360.png`, `portfolio-393.png`, `mensajes-360.png`, `mensajes-393.png`. Todas proceden de la **ejecución web auxiliar**. No son wireframes, imágenes generadas ni capturas Android.

## Incidencias corregidas

- Configuración de apariencia NativeWind: `darkMode: class` resolvió la excepción al iniciar web.
- TypeScript 7 no exponía el API esperado por `ts-api-utils`; se fijó TypeScript 5.9.3 y se instaló el parser ESLint explícito. Typecheck y lint final correctos.
- La prueba de texto largo detectó desbordamiento en Galería. El bloque de imagen ahora usa el espacio restante de la ficha, mantiene `contain` y deja visible el texto completo. Se regeneraron los dos PDF y se verificaron.

## Límites y pendientes de aceptación

- Expo Doctor: no pudo consultar el esquema remoto Expo (`exp.host`, `EAI_AGAIN`) ni React Native Directory (respuesta de servidor no disponible). La instalación online inicial también encontró una denegación de la política de red. Se usó `expo install` con matriz SDK local para continuar, sin evadir esa política. Repetir los dos checks remotos en un entorno con acceso.
- Android: falta SDK/ADB; el comando de arranque falló explícitamente. Falta recorrer en dispositivo toda la secuencia, abrir el PDF generado por expo-print, revisar imágenes y texto, compartir y cancelar. El empaquetado Android no demuestra comportamiento nativo.
- iOS: no hay simulador/macOS; ni ejecución ni permisos ni impresión probados. Se prepara incrustación temporal de imágenes para la limitación de archivos locales en WKWebView.
- Galería nativa: pendientes permiso denegado/limitado, cancelación real, formato no admitido, falta de espacio y reinicio tras copia. La rama web sí probó selección real de archivo y persistencia.
- Accesibilidad: etiquetas y objetivos de 48 unidades o más en controles principales, imágenes con texto alternativo, texto escalable por defecto, áreas seguras y teclado implementados. Contraste de acentos verificado por prueba. Pendientes TalkBack/VoiceOver, texto del sistema ampliado y teclado/gestos nativos. La revisión web no acredita esas pruebas.
- El PNG definitivo no se recibió como archivo binario; su integración exacta está preparada, no verificada. No se afirma que el logo esté ya incorporado.

**Conclusión de aceptación:** H1 implementado y comprobable, con aceptación móvil pendiente. No se declara H1 totalmente validado ni se avanza a H2.
