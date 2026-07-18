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

## Notas

- Como los datos viven en `localStorage`, cada navegador/dispositivo tendrá su
  propio registro. Si quieres acceder desde el móvil y el ordenador con los
  mismos datos, tendrías que añadir un backend (fuera del alcance de esta
  versión estática).
- El plan cubre del 20 de julio al 31 de agosto de 2026, de lunes a sábado.
  Para cambiar fechas, temas o bloques, edita las constantes al principio de
  `app.js` (`PLAN_START`, `PLAN_END`, `WEEKS`, `TEMAS`, `BLOQUES`).
