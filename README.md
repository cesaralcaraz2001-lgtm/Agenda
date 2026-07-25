# Expediente de Estudio — Seguimiento de Oposición

Web app estática (HTML + CSS + JS puro, sin dependencias ni build) para llevar el
seguimiento diario de tu plan de estudio: bloques completados, racha, estado del
temario (T1-T20) y cumplimiento semanal.

Los datos se guardan en el `localStorage` de tu navegador — son privados,
no se envían a ningún servidor, y persisten mientras no borres los datos
del sitio en el navegador que uses.

## Publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser privado o público).
2. Sube estos 4 archivos a la raíz del repositorio: `index.html`, `style.css`, `app.js`, `README.md`.
   - Desde la web de GitHub: "Add file" → "Upload files", arrastra los archivos y haz commit.
   - O por terminal:
     ```
     git init
     git add .
     git commit -m "Primera versión del expediente de estudio"
     git branch -M main
     git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
     git push -u origin main
     ```
3. En el repositorio: **Settings → Pages**.
4. En "Build and deployment" → "Source", elige **Deploy from a branch**.
5. En "Branch", selecciona **main** y la carpeta **/(root)**. Guarda.
6. Espera 1-2 minutos. Tu app quedará publicada en:
   `https://TU_USUARIO.github.io/TU_REPO/`

## Exportar / Importar datos

En la pestaña **Evolución** hay una sección "Copia de seguridad":

- **Exportar datos**: descarga un archivo `.json` con todo tu progreso (bloques
  marcados, notas y estado del temario).
- **Importar datos**: sube ese mismo archivo desde otro navegador u ordenador
  para recuperar tu progreso ahí. Te pedirá confirmación porque sobrescribe
  los datos que hubiera en ese navegador.

Así puedes moverte de móvil a PC (o hacer una copia de seguridad periódica)
sin necesidad de ninguna base de datos ni backend.

## Mínimo del día

Además de la sesión completa de 210 minutos (los 3 bloques), cada día tiene un
**mínimo** que, si lo cumples, también cuenta el día como "conforme" aunque no
hagas la sesión completa:

1. Test del tema que toca
2. Ver y organizar los artículos más importantes
3. Leerlos

Un día cuenta como cumplido si completas **los 3 bloques completos** O **el
mínimo del día**. Esto da margen para días con menos tiempo disponible sin
romper la racha.

## Detección automática del día

Cada vez que abres la app, la pestaña "Hoy" se sitúa automáticamente en la
fecha actual (marcada con una etiqueta "HOY") — no hace falta que la muevas
manualmente. Puedes navegar a otros días con las flechas para rellenar
retroactivamente o adelantar trabajo, pero al recargar la app siempre vuelve
al día de hoy.

## Icono para el móvil

La app ya incluye icono propio (el sello dorado sobre fondo oscuro) para
cuando la añadas a la pantalla de inicio de tu móvil:

- `favicon.ico` — icono de pestaña del navegador
- `icons/apple-touch-icon.png` — icono al añadir a inicio en iPhone/iPad
- `icons/icon-192.png` y `icons/icon-512.png` — icono en Android/Chrome
- `manifest.json` — hace que, al añadirla a inicio, se abra a pantalla
  completa como una app normal (sin barra de navegador)

**Para añadirla a la pantalla de inicio (Android/Chrome):**
abre la URL → menú (⋮) → "Añadir a pantalla de inicio" / "Instalar app"

Recuerda subir también la carpeta `icons/` completa y `favicon.ico` y
`manifest.json` a la raíz del repositorio junto con los demás archivos.

## Notas

- Como los datos viven en `localStorage`, cada navegador/dispositivo tendrá su
  propio registro. Si quieres acceder desde el móvil y el ordenador con los
  mismos datos, tendrías que añadir un backend (fuera del alcance de esta
  versión estática).
- El plan cubre del 20 de julio al 31 de agosto de 2026, de lunes a sábado.
  Para cambiar fechas, temas o bloques, edita las constantes al principio de
  `app.js` (`PLAN_START`, `PLAN_END`, `WEEKS`, `TEMAS`, `BLOQUES`).
