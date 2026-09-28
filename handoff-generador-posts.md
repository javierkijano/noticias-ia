# Handoff: Noticias IA → Generador de posts de IA

## Roles
- **Noticias IA**: fuentes, digest, ranking, dashboard, cola/export JSON.
- **Generador de posts de IA** (id `2ed7eaff-c592-410a-8ca3-ce890d438063`): propuestas LinkedIn (copy + covers) desde noticias **seleccionadas**.

## Contrato de entrada (JSON sugerido)
```json
{
  "schema": "noticias-ia-seleccion-v1",
  "plataforma": "linkedin",
  "items": [
    {
      "id": "n1",
      "titulo": "...",
      "porQueImporta": "...",
      "fuente": { "nombre": "...", "url": "https://..." },
      "focos": ["producto"],
      "impacto": 9,
      "pedido": "post|reenvio|didactico"
    }
  ]
}
```

## Contrato de salida
Por ítem: tipo, copy completo, imagen (path/URL), plantilla A–E, alt, concepto visual, URL si reenvío.
