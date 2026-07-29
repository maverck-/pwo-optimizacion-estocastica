# Criterios para la Selección de Metaheurísticas (PWO y FCO)

Este documento detalla el proceso y los criterios utilizados para seleccionar las metaheurísticas **Painted Wolf Optimization (PWO)** y **Felis Catus Optimization (FCO)** como candidatas para la Actividad 2 del curso de Optimización Estocástica.

La selección no fue aleatoria, sino el resultado de un proceso de filtrado basado en las restricciones del problema y en criterios técnicos de calidad.

## Proceso de Selección Detallado

### 1. Filtro Decisivo: La Restricción del Profesor (Novedad Extrema)

Este fue el criterio más importante y el primer filtro aplicado. La indicación explícita de buscar un paper "de 2026 o algo así" descartó inmediatamente la gran mayoría de las metaheurísticas conocidas y establecidas (e.g., GWO, WOA, PSO, etc.), ya que sus publicaciones originales son de años anteriores.

*   **Acción:** Se realizó una búsqueda enfocada exclusivamente en algoritmos publicados en los años 2025 y 2026.
*   **Resultado:** PWO (Marzo 2026) y FCO (Abril 2026) emergieron como candidatos ideales por cumplir estrictamente con este requisito de máxima actualidad.

### 2. Filtro de "Presentación": Concepto Atractivo y Complejidad Manejable

Una vez asegurada la novedad, el siguiente filtro se centró en qué tan adecuada sería la metaheurística para una presentación académica, considerando que vienes de trabajar con Simulated Annealing.

*   **Concepto Atractivo:** Ambos algoritmos se basan en comportamientos de animales. Esto es un gran plus para una presentación:
    *   **Visual y Narrativo:** Permite contar una "historia" (cómo caza un gato o un licaón), haciendo la explicación más memorable e intuitiva.
    *   **Analogía Directa:** El comportamiento del animal sirve como una analogía clara para las fases del algoritmo (exploración vs. explotación), facilitando la comprensión del público.

*   **Complejidad Manejable:**
    *   Ambos son algoritmos basados en población, lo cual es el siguiente paso lógico después de un algoritmo de trayectoria única como Simulated Annealing.
    *   Las ecuaciones matemáticas para actualizar las posiciones de los agentes, aunque más complejas que en SA, se basan en operaciones vectoriales y promedios ponderados de las mejores soluciones, lo que las mantiene dentro de un nivel de complejidad comprensible para una presentación.

### 3. Filtro Técnico: ¿Qué las Hace "Buenas" Metaheurísticas?

Finalmente, se aplicó un filtro de calidad técnica para asegurar que los algoritmos no solo fueran "nuevos y bonitos", sino también robustos desde una perspectiva de optimización.

*   **Equilibrio Explícito entre Exploración y Explotación:** Este es el pilar de una buena metaheurística. Un algoritmo debe ser capaz de buscar en nuevas regiones del espacio de soluciones (exploración) y de refinar las buenas soluciones ya encontradas (explotación).
    *   **FCO (Felis Catus Optimization):** Modela esto de forma muy clara con sus dos modos: el "modo de búsqueda" (exploración) y el "modo de rastreo" (explotación).
    *   **PWO (Painted Wolf Optimization):** Logra este equilibrio al modelar cómo la manada se dispersa para buscar (exploración) y luego converge para rodear a una presa (explotación).
    *   Esta separación clara de fases es un signo de un diseño de algoritmo sólido y un excelente punto para analizar en tu presentación.

*   **Disponibilidad de Recursos y Credibilidad Académica:**
    *   **FCO:** Fue publicado en **PLOS ONE**, una revista científica de alto impacto, lo que le otorga una fuerte credibilidad.
    *   **PWO:** Tiene una ventaja práctica invaluable: los autores **publicaron el código fuente**. Esto te permite experimentar directamente con el algoritmo, entender su implementación a fondo y verificar su comportamiento.

## Conclusión

La elección de **PWO** y **FCO** se debe a que representan el "punto dulce" perfecto para esta tarea específica. Cumplen con el requisito estricto de novedad, son conceptualmente atractivos para una presentación y están fundamentados en principios técnicos sólidos que demuestran un diseño de metaheurística moderno y eficaz.
