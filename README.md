# PWO - Optimización Estocástica

Repositorio de trabajo del proyecto de curso de MII902 Optimización Estocástica.

El proyecto estudia **Painted Wolf Optimization (PWO)**, la metaheurística
poblacional continua propuesta por Saeid Sheikhi en 2026. El foco inmediato es
explicar cómo las ecuaciones de movimiento asignan nuevos valores reales a las
variables de decisión. La binarización y la aplicación a un problema discreto
se desarrollarán para la entrega final.

## Autores

- Maverick Gayoso
- Rogelio González

## Entrega de avance

- Informe en formato paper.
- Presentación.
- Plazo: viernes 31 de julio de 2026, 19:00.

La guía de contenido y el guion son documentos de apoyo para preparar la
presentación; no constituyen entregables adicionales indicados por el profesor.

## Estructura

```text
.
├── demo-painted-wolf/    # Demo visual e interactiva de PWO
├── docs/
│   ├── informe/          # Fuente Markdown del paper
│   └── presentacion/     # Guía por láminas y guion
├── entregables/avance/   # Copias y borradores de entrega
├── experimentos/        # Ejecuciones y resultados reproducibles
├── figuras/              # Recursos visuales propios o derivados
├── referencias/
│   ├── antecedentes/     # Copias de antecedentes del curso
│   └── paper/            # Paper seleccionado
├── src/                  # Implementación y utilidades
└── tests/                # Pruebas automatizadas
```

## Código de referencia

El código publicado por los autores está disponible en el repositorio hermano:

```text
../Painted-Wolf-Optimization
```

Este repositorio reúne los experimentos de reproducción, la demo interactiva,
la documentación técnica y los entregables del curso.

## Documentos principales

- `docs/informe/informe-avance.md`
- `docs/presentacion/presentacion-avance.md`
- `docs/presentacion/guion-presentacion.md`
- `docs/explicacion-intuitiva-pwo.md`
- `docs/auditoria-integridad-corpus.md`
- `docs/plan-entrega-avance.md`

La guía organiza el contenido por láminas. El guion desarrolla la explicación
oral y el informe conserva el análisis con estructura académica. Las copias de
trabajo para la entrega se encuentran en `entregables/avance/`.

## Demo web interactiva

`demo-painted-wolf/` muestra la manada sobre un mapa de calor, el alfa
histórico, la votación del rally, la comparación entre `R` y `H`, y la elección
entre exploración y explotación.

No requiere instalación ni proceso de build. Como usa módulos ES, debe
ejecutarse desde un servidor local:

```bash
cd demo-painted-wolf
python3 -m http.server 8000
```

El detalle de la correspondencia con las ecuaciones del informe está en
`demo-painted-wolf/README.md`.

## Referencias principales

- Artículo: [Painted Wolf Optimization: A Novel Nature-Inspired Metaheuristic
  Algorithm for Real-World Optimization
  Problems](https://doi.org/10.32604/cmc.2026.077788).
- Código de los autores:
  [saeidsheikhi/Painted-Wolf-Optimization](https://github.com/saeidsheikhi/Painted-Wolf-Optimization).
