# Noticias IA — Dashboard

Dashboard local (HTML+CSS+JS, un solo archivo) para visualizar el resumen de noticias de IA, filtrar por foco/impacto, y preparar una **cola de publicación** para handoff a un bot de LinkedIn separado.

**Este dashboard no publica nada.** Solo guarda borradores en `localStorage` y exporta JSON.

## Live

GitHub Pages: https://javierkijano.github.io/noticias-ia/

## Cómo abrir

### Opción A — archivo directo
Abre en el navegador:

```
file:///home/box/noticias-ia/dashboard/index.html
```

(o arrastra `index.html` a Chrome/Firefox/Edge).

### Opción B — servidor local
Desde esta carpeta:

```bash
cd /home/box/noticias-ia/dashboard
python3 -m http.server 8765
```

Luego visita: http://localhost:8765/

Copias: `/workspace/noticias-ia-dashboard/` · repo git `/workspace/noticias-ia-gh/`

## Funciones

1. **Ranking** de noticias ordenado por impacto (~11 ítems con imagen + URL de fuente).
2. **Filtros** por foco (sector / producto / investigación / técnico) e impacto mínimo 1–10.
3. **Cards media-rich** — miniatura, badge de impacto, fila de origen (favicon + host) y CTA «Leer fuente».
4. **Aprende** — teaser didáctico con nota de diagrama Mermaid.
5. **Cola de publicación** — Guardar / Quitar posts y reenvíos; persiste en `localStorage` con clave `noticias-ia-dashboard-v1`.
6. **Exportar JSON** — descarga handoff para el publisher bot (`noticias-ia-cola-YYYYMMDD.json`).

## Datos seed

Incrustados en el propio `index.html` (objeto `SEED`), derivados de `muestra-resumen-ia-v2.md` + fuentes oficiales verificadas. Cada noticia incluye `imagen` (OG/CDN) y `fuente.url` clicable.
