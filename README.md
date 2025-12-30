# La Web del Videojuego

Blog de videojuegos con integracion de Bluesky.

## Stack

- **11ty 3.x** - Generador de sitios estaticos
- **CSS minimal** - Sin frameworks, con soporte dark/light mode
- **Bluesky API** - Integracion de posts filtrados por tematica gaming
- **GitHub Actions** - Rebuild automatico diario

## Desarrollo local

```bash
npm install
npm start
```

El sitio estara disponible en `http://localhost:8080`

## Build

```bash
npm run build
```

Los archivos generados estaran en `_site/`

## Estructura

```
src/
  _data/
    bluesky.js       # Fetch de posts de Bluesky (filtrado por keywords)
    site.js          # Configuracion del sitio
    unifiedFeed.js   # Utilidad para mezclar posts y Bluesky
  _includes/
    base.njk         # Layout principal
    post.njk         # Layout de articulos
    article-card.njk # Tarjeta de articulo
    bluesky-card.njk # Tarjeta de post de Bluesky
  posts/             # Articulos en Markdown
  css/style.css      # Estilos (dark/light mode)
  *.njk              # Paginas (index, articulos, analisis, sobre, 404)
```

## Deploy

El sitio se despliega automaticamente via GitHub Actions cuando:
- Se hace push a `main`
- Diariamente a las 8:00 UTC (para actualizar posts de Bluesky)
