# Auditoría de integridad del proyecto PWO

## Alcance

Esta auditoría utiliza exclusivamente el corpus disponible en el proyecto. No
incorpora literatura, citas, datos ni verificaciones externas.

El corpus revisado comprende:

- el paper principal `referencias/paper/PaintedWolfOptimization.pdf`;
- las implementaciones Python y MATLAB del repositorio de los autores,
  conservadas en el repositorio hermano `Painted-Wolf-Optimization`;
- el notebook `experimentos/notebooks/pwo_prueba_repo.ipynb` y sus resultados
  guardados;
- el informe, la guía de presentación, el guion y la explicación intuitiva;
- el código y la documentación de `demo-painted-wolf`;
- los antecedentes y referencias bibliográficas guardados en el proyecto.

La revisión distingue el contenido del paper, las decisiones observadas en el
código, los resultados propios reproducibles y las interpretaciones del
equipo. Una referencia en la bibliografía no se considera evidencia suficiente
para describir el contenido de una obra cuyo texto no está en el corpus.

## Matriz de afirmaciones relevantes

| Afirmación revisada | Clasificación | Evidencia disponible | Tratamiento editorial |
|---|---|---|---|
| PWO es una metaheurística poblacional inspirada en el rally del licaón. | respaldada por el paper | Resumen y secciones 1 y 2 del paper principal. | Se conserva y se atribuye al autor. |
| El autor evalúa PWO en 33 funciones, problemas de ingeniería y una aplicación de ciberseguridad. | respaldada por el paper | Resumen, secciones experimentales y conclusión del paper principal. | Se presenta como evaluación reportada por el autor, no como resultado reproducido por el equipo. |
| Los resultados publicados demuestran de forma general que PWO supera a los demás algoritmos. | requiere matización | El paper informa comparaciones favorables, pero el proyecto no reproduce el protocolo experimental completo. | Se reemplaza por formulaciones atribuidas: «los autores reportan» o «el paper informa». |
| El alfa es siempre la posición actual del mejor agente de la iteración. | requiere matización | El paper describe el alfa como la mejor posición; las implementaciones conservan `Alpha_score`, `Alpha_pos` y `Alpha_index` como registro histórico. | En la explicación operacional del código, el alfa se define como la mejor solución observada hasta la iteración actual. Se distingue `Alpha_pos` de la posición actual del agente que obtuvo el registro. |
| La inicialización uniforme está dada explícitamente por una ecuación del paper. | requiere matización | El paper describe una inicialización aleatoria. La fórmula uniforme se observa en las implementaciones. | La ecuación se conserva, pero se atribuye a la implementación. |
| El parámetro de control disminuye linealmente desde 2 hasta 0. | respaldada por el paper | Sección metodológica y código. | Se conserva. Se aclara que Python y MATLAB recorren índices distintos y no alcanzan el mismo valor final de forma operativa. |
| La influencia del alfa usa un incremento de voto igual a 0.04. | requiere matización | La ecuación metodológica y ambos códigos usan 0.04; la Tabla 4 del paper informa `Linf = 0.05`. | Se usa 0.04 para explicar el código y se registra la discrepancia interna del paper. |
| Un agente vota según su fitness relativo al alfa; la votación no depende de la distancia espacial. | respaldada por el paper | Condición de voto de la sección 2.1 y código. | Se corrige «agente cercano al alfa» por «agente cuyo fitness satisface la condición». |
| La comparación entre la fuerza del rally y el umbral selecciona un modo global para toda la manada. | respaldada por el paper | Ecuaciones de rally y estructura de las implementaciones. | Se conserva. |
| La primera estrategia de exploración convierte un escalar en un vector. | respaldada por el paper | El texto del paper declara esa conversión; el código asigna el resultado al vector dentro del ciclo de dimensiones. | Se explica como lectura literal del paper y del código, sin afirmar que sea la única implementación posible. |
| La segunda estrategia aleja a la población de su media usando al alfa como referencia. | interpretación razonable | Ecuación de la segunda estrategia y código. | Se identifica como interpretación geométrica del equipo. |
| La ecuación de explotación garantiza que cada agente se acerque al alfa en cada actualización. | requiere matización | El paper denomina «convergencia» a la fase, pero la ecuación contiene coeficientes aleatorios que no garantizan una reducción individual de distancia. | Se reemplaza «converger» por «actualizar con referencia en el alfa» cuando se describe el mecanismo. |
| El umbral usa las mismas variables aleatorias en el paper y en el código. | contradice el paper | La ecuación impresa reutiliza una variable aleatoria; los códigos generan tres valores independientes. | Se documentan por separado la ecuación publicada y la realización del código. |
| El orden de evaluación, reparación y movimiento es equivalente en el pseudocódigo conceptual y en la implementación. | requiere matización | El código evalúa y repara al comienzo de cada iteración. La última población generada no se evalúa dentro del mismo ciclo. | El informe describe explícitamente el orden operacional del código. |
| La complejidad del código literal es necesariamente \(O(TNd)\). | requiere matización | La implementación recalcula la media poblacional y realiza asignaciones vectoriales dentro de ciclos por dimensión. | Se elimina la cota porque no representaba con precisión la implementación revisada. |
| La ejecución Sphere prueba la convergencia general de PWO. | requiere matización | Una ejecución sobre una función no demuestra comportamiento general. | Se presenta solo como verificación operacional y ejemplo de reducción del fitness. |
| *The Painted Wolf Decision Optimizer* es un método determinista, discreto y multicriterio relacionado técnicamente con PWO. | no verificable con el corpus | El proyecto conserva la entrada bibliográfica y figuras, pero no el texto completo de esa publicación. | Se elimina la caracterización metodológica y se mantiene únicamente que su contenido no puede compararse con el corpus actual. |
| Las estadísticas de éxito, tiempos, medianas y equivalencia Python/JavaScript de la demo están respaldadas por experimentos conservados. | no verificable con el corpus | No hay scripts, registros ni salidas que permitan reconstruir esas tablas. | Se retiran las cifras y se limita la función de la demo a la explicación didáctica. |
| La demo ofrece modos separados de minimización y maximización y representa cada agente como una bola. | contradice el código actual | La interfaz muestra lobos sobre un mapa de calor y opera como minimización. | La explicación intuitiva se ajusta a los controles y representaciones presentes en el código actual. |
| Todas las funciones de prueba del paper tienen mínimo global igual a 0. | contradice el paper | Las tablas del paper incluyen funciones con óptimos o sesgos distintos de 0. | Se indica que normalizar el terreno visual a 0 es una decisión de la demo. |
| La grilla del generador garantiza matemáticamente un único mínimo global continuo. | requiere matización | El código inspecciona una grilla de \(140\times140\) puntos y aplica refinamiento local. | Se describe como validación sobre una grilla y búsqueda de un mínimo muestreado con margen. |

## Separación de procedencias

### Afirmaciones de los autores

Corresponden a la motivación biológica, la formulación de PWO, los nombres
«exploración» y «convergencia», el diseño experimental y las conclusiones del
paper. En el informe se introducen mediante atribuciones explícitas, por
ejemplo, «los autores proponen», «el paper define» o «los autores reportan».

### Resultados reportados

Las comparaciones sobre funciones de prueba, problemas de ingeniería e
identificación de parámetros pertenecen al paper. El proyecto no contiene una
reproducción completa de esos experimentos, por lo que no se presentan como
resultados independientes del equipo.

### Interpretaciones del equipo

La lectura geométrica de la segunda estrategia, la explicación pedagógica del
rally y el análisis de posibles efectos de las discrepancias paper-código son
interpretaciones. Se conservan cuando ayudan a explicar el método, pero se
marcan como tales y no se convierten en propiedades demostradas.

### Inferencias propias

La posible sensibilidad a la realización del umbral, al alcance de las
asignaciones vectoriales y al instante de reparación se formula como hipótesis
para experimentación futura. Estas inferencias no se presentan como hallazgos
del paper.

### Resultados propios

La ejecución de Sphere con semilla `20260728`, \(N=20\), \(T=100\), \(d=3\) y
dominio \([-100,100]\) está guardada en el notebook y fue reproducida
internamente. El fitness final fue
\(2.519815240595654\times10^{-92}\). Este es un resultado propio verificable
con el corpus experimental, no un resultado respaldado o reportado por el
paper. El código MATLAB fue inspeccionado, pero no ejecutado en esta auditoría.

## Contenido no verificable con el corpus

- La formulación, objetivos y resultados de *The Painted Wolf Decision
  Optimizer*, porque su texto completo no está almacenado en el proyecto.
- Las estadísticas previamente incluidas en el README de la demo sobre pausas,
  desplazamientos, tasas de éxito y comparaciones entre Python y JavaScript,
  porque faltan protocolos, scripts y registros.
- La equivalencia estadística entre la demo JavaScript y las implementaciones
  de los autores.
- La reproducibilidad del código MATLAB en el entorno actual, porque no se
  ejecutó MATLAB.
- La reproducción independiente de las tablas experimentales del paper
  principal.

## Vacíos para una segunda etapa de validación externa

Una segunda etapa podría justificarse para:

1. obtener y revisar el texto completo de *The Painted Wolf Decision
   Optimizer* antes de afirmar una relación metodológica con PWO;
2. comprobar los metadatos bibliográficos y el estado editorial de las
   publicaciones citadas;
3. reproducir el protocolo experimental completo del paper, incluidas las
   funciones CEC y las comparaciones estadísticas;
4. ejecutar la versión MATLAB y comparar sus trayectorias con Python bajo
   semillas y condiciones controladas;
5. construir un protocolo reproducible para validar la fidelidad y el
   desempeño de la demo JavaScript;
6. aclarar con una fuente oficial o con los autores las discrepancias de
   `Linf`, del muestreo aleatorio del umbral y del alcance de las
   actualizaciones vectoriales.

Estos puntos no afectan la explicación del avance actual, siempre que el
informe mantenga separadas la formulación publicada, la implementación
observada, la interpretación del equipo y la evidencia experimental propia.
