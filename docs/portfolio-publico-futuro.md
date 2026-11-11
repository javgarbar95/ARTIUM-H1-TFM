# Portfolio público · Diseño futuro, sin implementar

## Acceso

Página HTTPS bajo la ruta `/p/slug`, consultable sin instalar Artium. Dominio aún no elegido. El slug será estable; no se ha creado una URL, deep link, QR ni botón Copiar enlace con destino ficticio.

## Separación de borrador y publicación

El propietario edita `Artwork` y `PortfolioConfig` como borrador privado. **Publicar** o **Actualizar publicación** valida la selección y crea una instantánea inmutable versionada. Cambiar una obra local no actualiza silenciosamente lo publicado. La URL estable resuelve la última versión publicada; **Retirar publicación** impide nuevas consultas, sin prometer borrar PDF ya distribuidos.

Modelo previsto: `PortfolioPublication { ownerId, slug, publishedVersion, status, publishedAt }` y `PublicPortfolioSnapshot { version, profilePublic, config, artworksPublic, mediaUrls }`.

## Autorización y campos permitidos

Autenticación real del propietario mediante servicio por decidir; autorización verificada en servidor para escritura, sustitución y retirada. Nunca confiar en el rol del cliente demo. Lectura anónima solo de snapshots cuyo estado sea publicado. Almacén de imágenes remoto con permisos y URLs adecuados para esas instantáneas; originales/borradores privados.

Lista permitida: nombre artístico elegido, introducción, plantilla, acento, orden, títulos, técnicas, años, descripciones, textos accesibles e imágenes expresamente aprobadas. No copiar todo el User ni emails, IDs internos, tokens, datos académicos privados, rutas locales o claves de sesión. Una obra privada requerirá consentimiento explícito antes de convertirse en contenido público.

## Flujo y consistencia

Subir imágenes → validar ownership/formatos → crear snapshot y referencias versionadas → actualizar puntero publicado en transacción → devolver URL HTTPS real. Mostrar fallos/reintento sin dejar una publicación incompleta. Colisiones de slug se resuelven en servidor. Eliminar una obra del borrador no elimina por accidente una imagen de una versión publicada; aplicar política de retención por referencias.

Se estudiarán caché, retirada, accesibilidad web, límites de abuso, derechos de imágenes y privacidad cuando este hito esté autorizado. No hay implementación o despliegue en H1.
