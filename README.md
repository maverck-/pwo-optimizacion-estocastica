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
├── demo-web/             # Laboratorio visual e interactivo de PWO
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

## Repositorio oficial de referencia

El código de los autores se conserva sin modificaciones en el repositorio
hermano:

```text
../Painted-Wolf-Optimization
```

Este repositorio no reemplaza ni modifica esa fuente. Aquí se documentarán las
decisiones de reproducción, las pruebas, las adaptaciones y los entregables del
curso.

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

`demo-web/` contiene una aplicación Next.js independiente que permite observar
el movimiento de la población, el alfa histórico, la transición entre
exploración y explotación, y el papel de `R` y `H`. También permite alternar
entre las analogías de lobos y pelotas, y comparar minimización con
maximización.

Para ejecutarla localmente:

```bash
cd demo-web
npm install
npm run dev
```

Para publicarla en Vercel, importa este repositorio y configura `demo-web` como
**Root Directory**. No requiere variables de entorno.

## Estado

La fuente de verdad académica es el paper copiado en
`referencias/paper/PaintedWolfOptimization.pdf`. Cuando el paper y el código
oficial difieren, la discrepancia debe documentarse explícitamente.
