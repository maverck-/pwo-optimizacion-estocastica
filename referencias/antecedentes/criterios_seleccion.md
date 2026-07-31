# Criterios usados para seleccionar Painted Wolf Optimization

Este documento resume por qué Painted Wolf Optimization (PWO) fue escogido para
el proyecto de MII902. La selección del algoritmo del proyecto es distinta de
la Actividad 2, que corresponde a la comprensión y exposición de un paper
asignado por el profesor.

## 1. Actualidad del trabajo

El profesor solicitó escoger una metaheurística publicada recientemente. En las
clases se mencionaron trabajos de 2025 a 2027 como referencia temporal.

PWO cumple este criterio:

- el paper fue publicado el 12 de marzo de 2026;
- el artículo está disponible en el corpus del proyecto;
- el repositorio de los autores contiene implementaciones en Python y MATLAB.

## 2. Ecuaciones de movimiento identificables

El criterio técnico principal fue que el algoritmo permitiera explicar cómo se
asignan valores a las variables de decisión. PWO define:

1. una decisión de rally entre exploración y explotación;
2. dos estrategias de exploración;
3. una actualización de explotación por dimensión.

Esta separación permite estudiar la representación de cada solución, la
nomenclatura, los parámetros y el cálculo de
\(\mathbf{X}_i(t+1)\).

## 3. Continuidad con Simulated Annealing

La Actividad 1 trabajó con Simulated Annealing, un algoritmo de trayectoria que
mantiene una solución activa. PWO permite avanzar hacia una metaheurística
poblacional:

| Aspecto | Simulated Annealing | PWO |
|---|---|---|
| Soluciones activas | Una | Varias |
| Decisión principal | Aceptar o rechazar un vecino | Explorar o explotar |
| Referencia | Estado actual y mejor registro | Alfa y población |
| Control dinámico | Temperatura | Rally y parámetros de movimiento |

La comparación aporta continuidad pedagógica, pero no implica que ambos
algoritmos sean equivalentes.

## 4. Disponibilidad de código

El repositorio oficial permite:

- ejecutar una versión concreta del método;
- contrastar las ecuaciones con Python y MATLAB;
- identificar diferencias entre paper, pseudocódigo y código;
- preparar pruebas reproducibles antes de modificar el algoritmo.

La disponibilidad del código no elimina la necesidad de verificar su
correspondencia con la formulación publicada.

## 5. Contexto comprensible

La inspiración en la manada, el rally y la caza permite introducir de forma
breve las fases del algoritmo. Este contexto resulta útil cuando se traduce de
inmediato a población, soluciones, variables y ecuaciones. No reemplaza la
explicación operacional solicitada por el profesor.

## Decisión

PWO fue seleccionado porque combina actualidad, código disponible y ecuaciones
de movimiento que pueden analizarse en el dominio real. Estas características
permiten preparar el avance, estabilizar una implementación continua y dejar la
binarización para la etapa final del proyecto.

Una versión anterior de estos antecedentes también mencionaba Felis Catus
Optimization como candidato. El corpus actual no conserva su paper ni una
verificación equivalente, por lo que este documento no formula afirmaciones
técnicas o editoriales sobre ese método.
