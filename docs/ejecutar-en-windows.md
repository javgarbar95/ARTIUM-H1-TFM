# Ejecutar ARTIUM H1 en Windows con Visual Studio Code

Guía de entrega del 11-11-2026. Las comprobaciones automatizadas se realizaron en Linux; estos comandos corresponden a PowerShell en Windows. No se presenta una ejecución Windows como ya probada.

## 1. Preparación

1. Instala **Node.js 24 LTS** para Windows desde https://nodejs.org/ (incluye npm). El proyecto exige Node 24, versión 24.3.0 o superior dentro de esa rama. No requiere instalar Expo CLI globalmente.
2. Instala **Visual Studio Code** desde https://code.visualstudio.com/.
3. Descarga `ARTIUM-H1-proyecto-completo.zip`. En el Explorador, pulsa **Extraer todo**; extrae en una carpeta local, por ejemplo `C:\Proyectos`. Evita trabajar dentro del ZIP o dentro de la carpeta Nexus.
4. En VS Code: **Archivo → Abrir carpeta → C:\Proyectos\artium**. En esa carpeta deben verse `package.json`, `package-lock.json`, `app`, `src`, `assets` y `docs`.
5. **Terminal → Nuevo terminal**, elige PowerShell.

```powershell
node --version
npm.cmd --version
npm.cmd ci
```

La primera instalación necesita Internet. Se usa `npm.cmd` para evitar el bloqueo de `npm.ps1` por la política de ejecución; no necesitas modificar la política de seguridad de PowerShell. Si `node` no se reconoce, reinicia VS Code tras instalar Node.

## 2. Revisión inmediata en navegador

```powershell
npm.cmd run web -- --port 8081
```

Abre `http://localhost:8081`. Mantén esa terminal abierta. Para detener el servidor pulsa **Ctrl+C**. Si el puerto está ocupado, detenlo o usa `--port 8083`; cambiar de puerto cambia el origen y los datos locales del navegador.

Selecciona **Entrar como estudiante demo** para crear obra y editar el portfolio. Docente e invitado son modos de consulta. No introduzcas contraseñas. Los datos son ficticios y se guardan en ese navegador. La impresión web permite Guardar como PDF si tu navegador lo ofrece; no es una prueba del PDF nativo.

## 3. Abrir en un móvil Android con Expo Go

Instala Expo Go compatible con **SDK 58** en Android. Conecta ordenador y móvil a la misma Wi-Fi y ejecuta:

```powershell
npm.cmd start -- --lan
```

Abre Expo Go y escanea el QR mostrado por Metro. Si Windows Firewall pregunta, permite Node en la red privada de confianza. Si no conecta, comprueba la Wi-Fi, el aislamiento de clientes y la VPN. No es necesario contratar EAS ni introducir credenciales para esta demo.

Expo Go necesita cargar el bundle desde Metro. No equivale a un APK que el tutor pueda abrir sin el ordenador. Si Expo Go indica SDK incompatible, usa la versión compatible recomendada por Expo; no actualices dependencias al azar.

## 4. Emulador Android opcional

Instala Android Studio, Android SDK Platform-Tools y un dispositivo virtual desde Device Manager. Arranca el dispositivo virtual antes del comando de Expo. En PowerShell:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator"
adb devices
npm.cmd run android
```

Si instalaste el SDK en otra carpeta, usa su ruta real en `ANDROID_HOME`. `adb devices` debe mostrar un dispositivo disponible. Windows no permite ejecutar un simulador iOS; para iOS hace falta un dispositivo o macOS/Xcode.

## 5. Comprobaciones del proyecto

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run check:versions
npx.cmd expo-doctor
npm.cmd run export:android
npm.cmd run export:web
```

El export Android genera JavaScript/Hermes y recursos: **no genera un APK**. Expo Doctor necesita acceso a servicios externos; en el entorno cloud dos checks remotos quedaron pendientes.

Pruebas de navegador: deja Metro web en una terminal y abre una segunda. Indica un Chrome instalado (ajusta la ruta si es diferente):

```powershell
$env:CHROMIUM_PATH = "$env:ProgramFiles\Google\Chrome\Application\chrome.exe"
Test-Path $env:CHROMIUM_PATH
npm.cmd run test:e2e
npm.cmd run verify:pdf
```

Si usas Edge:

```powershell
$env:CHROMIUM_PATH = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
Test-Path $env:CHROMIUM_PATH
```

`Test-Path` debe devolver `True`. La ruta `/usr/bin/chromium` de la configuración es solo el valor de reserva para Linux. `verify:pdf` genera PDF de maquetación con Chromium; la prueba Android debe ejecutarse aparte.

## 6. Logo y recuperación

El PNG final se vio en el chat pero su binario no llegó a este entorno. Para integrar el archivo exacto, sin alterarlo:

```powershell
npm.cmd run brand:logo -- "C:\Ruta\logo-final.png"
```

Reinicia Metro. No se redibuja el logo ni se sustituye por la propuesta anterior. Perfil → Restablecer datos demo requiere confirmación y conserva una copia local de metadatos. Desinstalar/borrar los datos de la app elimina el almacenamiento local.

## 7. Copia independiente en GitHub

ARTIUM está sincronizado en el repositorio privado https://github.com/javgarbar95/ARTIUM, rama `main`. No trabajes desde Nexus. Puedes clonar con `git clone https://github.com/javgarbar95/ARTIUM.git artium` en una carpeta nueva o recuperar la copia independiente `ARTIUM-H1-historial.gitbundle`. `docs/github-entrega.md` explica ambos procedimientos. Se requiere acceso autorizado a GitHub para clonar el repositorio privado; el ZIP permite ejecutar el proyecto sin usar GitHub.
