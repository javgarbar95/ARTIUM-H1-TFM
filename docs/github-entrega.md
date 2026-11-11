# GitHub y conservación independiente de ARTIUM

Revisión: 11-11-2026. Cuenta propietaria: `javgarbar95`.

El proyecto H1 está publicado en el repositorio **privado** https://github.com/javgarbar95/ARTIUM, rama `main`. El remoto local `origin` apunta exclusivamente a `https://github.com/javgarbar95/ARTIUM.git`.

El commit inicial recuperado es `9d1f920c3ba2da0c99a2ef1225a219d39ad89258`; una actualización posterior documenta esta publicación. El historial local y el remoto se verifican después de cada subida. No se han añadido funcionalidades H2.

Nexus mantiene su repositorio `https://github.com/javgarbar95/unir-actividad-1-nexus.git`, sin cambios. No contiene archivos de ARTIUM.

## Clonar desde Windows

Instala Git para Windows. En PowerShell, desde una carpeta distinta de Nexus y sin otra carpeta `artium` existente:

```powershell
cd C:\Proyectos
git clone https://github.com/javgarbar95/ARTIUM.git artium
cd artium
code .
```

Git Credential Manager puede solicitar inicio de sesión en el navegador. Necesitas la cuenta propietaria o acceso autorizado al repositorio privado. No envíes credenciales al chat.

En la terminal de VS Code, con Node 24 LTS:

```powershell
npm.cmd ci
npm.cmd run web -- --port 8081
```

Abre http://localhost:8081. La guía completa está en `docs/ejecutar-en-windows.md`.

## Recuperar desde la copia Git descargable

El archivo `ARTIUM-H1-historial.gitbundle` incluye el historial y permite recuperar la entrega sin acceso a GitHub. En una carpeta nueva:

```powershell
cd C:\Proyectos
git clone "C:\Descargas\ARTIUM-H1-historial.gitbundle" artium-git
cd artium-git
git remote set-url origin https://github.com/javgarbar95/ARTIUM.git
git fetch origin
git branch --set-upstream-to=origin/main main
```

Si el navegador añadió un identificador al nombre del archivo descargado, utiliza su nombre real. El ZIP de código también es completo, pero no incluye la carpeta interna `.git`; utiliza la clonación o el bundle para conservar el historial.

## Comprobar sincronización

```powershell
git status --short
git rev-parse HEAD
git ls-remote origin refs/heads/main
```

El primer comando debe quedar vacío tras clonar; los otros dos deben mostrar el mismo identificador de commit si no hay cambios posteriores. No se incluyen dependencias instaladas, cachés, tokens ni credenciales en la entrega.
