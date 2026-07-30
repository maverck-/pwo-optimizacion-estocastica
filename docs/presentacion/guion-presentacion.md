# Guion de presentación - avance PWO

Duración objetivo: 12 a 15 minutos.  
Distribución sugerida:

- Maverick Gayoso: diapositivas 1 a 5.
- Rogelio González: diapositivas 6 a 9.
- Maverick Gayoso: diapositivas 10 a 12.

## Diapositiva 1 - Maverick - 40 segundos

“Buenas tardes. Nuestro proyecto estudia Painted Wolf Optimization, o PWO, una
metaheurística poblacional publicada en 2026. Para este avance nos
concentraremos en la pregunta que definió el profesor: cómo el algoritmo asigna
valores a las variables de decisión en el dominio de los reales. Dejaremos la
binarización para la entrega final.

La idea de esta presentación es ir desde la representación de una solución
hasta un cálculo numérico completo de una actualización.”

Transición:

“Para eso, primero tenemos que traducir la metáfora del lobo a conceptos de
optimización.”

## Diapositiva 2 - Maverick - 55 segundos

“Cada lobo es simplemente una solución candidata. Su posición es un vector de
dimensión $d$, y cada componente del vector es una variable de decisión.

El índice $i$ identifica la solución, $j$ identifica la variable y $t$
identifica la iteración. La función objetivo recibe el vector completo y
devuelve un fitness que permite comparar asignaciones.

Por lo tanto, cuando el paper habla de mover un lobo, lo que realmente ocurre es
que se construye un nuevo vector $\mathbf{X}_i(t+1)$.”

Transición:

“La primera construcción ocurre incluso antes de comenzar a iterar.”

## Diapositiva 3 - Maverick - 60 segundos

“Cada variable se inicializa con un número uniforme dentro de su dominio. La
ecuación toma el límite inferior y agrega una fracción aleatoria del ancho del
intervalo.

Después se evalúan todas las soluciones y la de menor fitness se conserva como
alfa. El alfa no es una categoría biológica relevante para nosotros: es el mejor
vector encontrado.

Si una ecuación produce un valor fuera del dominio, el código oficial lo repara
por saturación: todo valor superior queda en el máximo y todo valor inferior en
el mínimo.”

Transición:

“Con la población evaluada, PWO todavía no mueve. Primero decide qué tipo de
movimiento realizará.”

## Diapositiva 4 - Maverick - 90 segundos

“La decisión utiliza un rally. El parámetro $a(t)$ disminuye linealmente y se
usa para calcular la influencia del alfa, que llamamos $L(t)$.

Cada agente no alfa vota cuando su fitness satisface la condición definida por
el paper. Cada voto suma 0.04 a la fuerza $R(t)$. Paralelamente se calcula un
umbral aleatorio $H(t)$.

La comparación selecciona la fase: si la fuerza es menor al umbral, la población
explora; si la fuerza alcanza o supera el umbral, explota.

La distinción importante es que ni el voto ni el umbral asignan todavía valores
a las variables. Solo escogen qué ecuación hará esa asignación.”

Transición:

“Esa elección abre tres rutas posibles.”

## Diapositiva 5 - Maverick - 55 segundos

“En exploración hay dos estrategias y se seleccionan con probabilidad 0.5. La
primera utiliza un agente aleatorio. La segunda combina el alfa con la media de
la población. En explotación, cada dimensión se actualiza directamente con
respecto al alfa.

Rogelio explicará ahora cómo cada una construye el nuevo vector.”

## Diapositiva 6 - Rogelio - 90 segundos

“La primera exploración selecciona una solución aleatoria y una dimensión
$j$. Con esa dimensión calcula una distancia perturbada.

Luego ocurre la característica más particular del algoritmo: el resultado es
un escalar, pero el paper indica que se asigna al vector completo. Es decir, la
información de una dimensión puede redefinir todas las variables del agente.

Esto promueve movimientos amplios, pero también es un punto que debemos mirar
con cuidado al reproducir el algoritmo, porque el código ejecuta la escritura
vectorial dentro del ciclo de dimensiones.”

Transición:

“La segunda exploración sí trabaja directamente con vectores.”

## Diapositiva 7 - Rogelio - 70 segundos

“Esta ecuación tiene dos componentes. El primero es el alfa menos la media de la
población y entrega una dirección global. El segundo es la distancia absoluta
entre el alfa y el agente, ponderada por la fuerza del rally.

Así, todos los agentes reciben información de la mejor solución y del centro de
la población, pero el resultado sigue dependiendo de la posición particular de
cada uno.”

Transición:

“Cuando el rally decide explotar, la asignación es más directa.”

## Diapositiva 8 - Rogelio - 80 segundos

“Para cada variable $j$ calculamos primero su distancia al valor correspondiente
del alfa. Después calculamos $A_2$, que combina fuerza del rally, el parámetro
de control y un número aleatorio.

Finalmente, al valor del alfa le restamos la distancia ponderada. Esta ecuación
responde de forma explícita la pregunta del avance: el nuevo valor de
$X_{i,j}$ es el valor del alfa en la misma dimensión menos una perturbación.

La operación se repite para cada variable.”

Transición:

“Veamos una iteración con números fijos.”

## Diapositiva 9 - Rogelio - 110 segundos

“Usamos la función Sphere de dos dimensiones. El agente que actualizaremos es
$(1.01,1.00)$, con fitness 2.0201, y el alfa es
$(1.00,0.99)$, con fitness 1.9801.

Fijamos los números aleatorios para que el cálculo sea reproducible. El rally
selecciona explotación y obtenemos $A_2=0.1088$.

En la primera dimensión la distancia al alfa es 0.01. Al multiplicarla por
$A_2$ y restarla a 1.00, el nuevo valor es 0.998912.

En la segunda dimensión la distancia también es 0.01. Restando la perturbación
a 0.99, obtenemos 0.988912.

La nueva solución tiene fitness 1.975772. Por lo tanto, mejora al agente
original y también al alfa previo. Ninguna variable sale del dominio.”

Transición:

“Además del cálculo manual, ejecutamos el código entregado por el autor.”

## Diapositiva 10 - Maverick - 70 segundos

“Probamos la implementación Python oficial en Sphere con tres dimensiones, 20
agentes, 100 iteraciones y una semilla fija.

El mejor fitness bajó desde aproximadamente 4281 hasta
$2.52\times10^{-92}$. La prueba confirma que el código se ejecuta y converge
en este caso sencillo.

No usamos este resultado para afirmar que PWO es superior. Es una sola semilla,
una sola función y todavía no estamos reproduciendo el protocolo experimental
del artículo.”

Transición:

“Al contrastar la ejecución con el paper encontramos aspectos que debemos
resolver.”

## Diapositiva 11 - Maverick - 90 segundos

“El artículo, el pseudocódigo y las dos implementaciones no coinciden en todos
los detalles.

Por ejemplo, el código usa un número aleatorio adicional al calcular el umbral.
Python evita que $a(t)$ llegue a cero, mientras MATLAB puede dividir por cero
en la última iteración. Además, la población generada en la última actualización
no vuelve a evaluarse y las operaciones vectoriales están dentro del ciclo de
dimensiones.

Para este avance usamos el paper como formulación académica y Python como
referencia operacional. No corregiremos silenciosamente estas diferencias: cada
decisión quedará registrada y probada.”

Transición:

“Con esto podemos precisar qué está terminado y qué sigue.”

## Diapositiva 12 - Maverick - 65 segundos

“El avance deja definida la representación, la inicialización, el rally y las
tres ecuaciones de movimiento. También deja un ruteo verificable, una ejecución
preliminar y una lista de decisiones de reproducibilidad.

El siguiente paso es estabilizar la versión continua, reproducir un conjunto de
funciones benchmark y recién entonces incorporar una estrategia de
binarización y un problema discreto.

La conclusión principal es sencilla: antes de transformar PWO al dominio
binario, necesitamos fijar con precisión cómo asigna valores en el dominio real.
Esa base queda establecida en este avance.”

## Preguntas previsibles

### ¿Por qué eligieron este algoritmo?

“Porque fue publicado en 2026, tiene ecuaciones continuas identificables y
dispone de código oficial en Python y MATLAB, lo que permite contrastar fórmula
e implementación.”

### ¿PWO es realmente diferente de Grey Wolf Optimizer?

“El autor declara mecanismos distintos: rally de votación, influencia dinámica
del alfa y dos estrategias probabilísticas de exploración. En este avance no
evaluamos todavía si esa novedad se traduce en una ventaja experimental.”

### ¿Por qué no binarizaron todavía?

“El foco explícito del avance es la asignación en reales. Binarizar antes de
estabilizar esa dinámica trasladaría ambigüedades del algoritmo continuo a la
versión discreta.”

### ¿Qué versión van a implementar?

“El paper es la especificación académica y Python la referencia operacional.
Prepararemos variantes controladas para las discrepancias identificadas y las
compararemos con semillas y presupuestos de evaluación equivalentes.”

### ¿El resultado de Sphere demuestra superioridad?

“No. Solo demuestra funcionamiento en un caso controlado. La superioridad exige
múltiples funciones, algoritmos comparadores, repeticiones y análisis
estadístico.”

### ¿El otro Painted Wolf Decision Optimizer es el mismo algoritmo?

“No. Es un marco determinista para decisión multicriterio discreta, publicado
por otros autores. Nuestro PWO es la metaheurística continua y estocástica de
Sheikhi.”

