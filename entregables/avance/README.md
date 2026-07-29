# Entregables de avance

Archivos preparados para la entrega del viernes 31 de julio de 2026:

- `PWO_Informe_Avance_Gayoso_Gonzalez.md`: borrador editable del informe en
  formato paper.
- `PWO_Presentacion_Avance_Gayoso_Gonzalez.pptx`: presentación editable de
  12 diapositivas, con notas del expositor y fuentes.
- `PWO_Guion_Presentacion_Gayoso_Gonzalez.md`: guion de 12 a 15 minutos,
  distribuido entre ambos integrantes.

Antes de enviar, el informe debe revisarse y exportarse como:

- `PWO_Informe_Avance_Gayoso_Gonzalez.pdf`

Las fuentes principales se mantienen en `docs/`. Si se modifica el informe o el
guion, se debe volver a copiar la versión aprobada a esta carpeta. La
presentación se regenera con:

```bash
node docs/presentacion/build-presentation.mjs
```
