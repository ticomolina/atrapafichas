# ATRAPA FICHAS

PWA estática. Funciona offline, se instala desde el navegador.

## Publicar
- **Netlify**: arrastrá la carpeta `atrapa-fichas` a app.netlify.com/drop.
- **GitHub Pages**: subí el contenido de la carpeta a un repo, Settings → Pages → rama `main`, carpeta `/ (root)`.

Tiene que ser por HTTPS (los dos lo son) para que se pueda instalar y funcione offline.

## Instalar en cada tablet
Abrí el link en Chrome → menú ⋮ → "Instalar app" / "Agregar a pantalla principal".
Una vez abierta una vez, ya anda sin internet.

## Editar temáticas y dificultad
Todo está en `datos.js` (comentado). Después de cualquier cambio:
1. Subí el número de `VERSION` en `sw.js` (ej: `atrapa-v2`).
2. Volvé a publicar.
3. En la tablet, abrí la app con internet dos veces (la primera baja la versión nueva, la segunda la usa).

## Fondos propios
Poné una imagen en `fondos/` (ej: `fondos/granja.jpg`) y en `datos.js` cambiá `imagen: null` por `imagen: "fondos/granja.jpg"`.
Agregá la ruta también a la lista `ARCHIVOS` de `sw.js` para que esté disponible offline desde el primer uso.

## Archivos
- `index.html` — pantallas
- `estilos.css` — estilo visual
- `juego.js` — lógica del juego
- `datos.js` — temáticas y curva de dificultad (lo que se edita)
- `sw.js` — offline
- `manifest.webmanifest`, `iconos/`, `fuentes/` — instalación, íconos y tipografía Fredoka
