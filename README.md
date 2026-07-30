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
- Guion de exposición.
- Plazo: viernes 31 de julio de 2026, 19:00.

## Estructura

```text
.
├── demo-painted-wolf/    # Demo visual e interactiva de PWO
├── docs/
│   ├── informe/          # Fuente Markdown del paper
│   └── presentacion/     # Contenido y guion
├── entregables/avance/   # Archivos listos para enviar
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

Este repositorio reúne la reproducción en Python y MATLAB, las pruebas, la demo
interactiva y los entregables del curso.

## Documentos principales

- `docs/informe/informe-avance.md`
- `docs/presentacion/presentacion-avance.md`
- `docs/presentacion/guion-presentacion.md`
- `docs/presentacion/build-presentation.mjs`
- `docs/explicacion-intuitiva-pwo.md`
- `docs/plan-entrega-avance.md`

La presentación editable y las copias listas para revisión se encuentran en
`entregables/avance/`.

## Demo web interactiva

`demo-painted-wolf/` contiene una demo independiente que muestra la manada
sobre un mapa de calor visto desde arriba: el alfa histórico, la votación del
rally, la comparación entre `R` y `H`, y la elección entre exploración y
explotación. Comparte el sistema visual de la demo de recocido simulado de la
Actividad 1, de modo que ambas se pueden presentar seguidas.

No usa dependencias ni build. Al usar módulos ES necesita un servidor, no basta
abrir el archivo:

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
