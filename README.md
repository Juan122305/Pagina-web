# Fresh Harvest — sitio web

Sitio estático para Agroalimentos Fresh Harvest.

## Estructura

- `index.html` — página principal.
- `src/input.css`, `src/script.js` — fuentes (Tailwind CSS v4 + [motion](https://motion.dev)).
- `dist/styles.css`, `dist/script.js` — build compilado y minificado (referenciado por `index.html`).
- `assets/img/` — imágenes del sitio.

## Desarrollo

```bash
npm install
npm run build   # compila dist/styles.css y dist/script.js
npm run dev     # recompila CSS en modo watch
```

Después de editar `src/input.css` o `src/script.js`, ejecuta `npm run build` y confirma los cambios en `dist/` junto con el resto del commit.

Para previsualizar localmente: `python3 -m http.server 8000` y abre `http://localhost:8000`.
