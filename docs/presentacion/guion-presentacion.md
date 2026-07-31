# Guion de presentación de avance: Painted Wolf Optimization

Duración estimada: 12 a 15 minutos.

Distribución sugerida:

- Maverick Gayoso: láminas 1 a 6.
- Rogelio González: láminas 7 a 11.
- Maverick Gayoso: láminas 12 y 13.

La lámina 12 es opcional y puede reservarse para preguntas.

## Lámina 1. Portada

**Tiempo sugerido: 20 segundos**

“Buenas tardes. Presentaremos Painted Wolf Optimization, o PWO. Nos
concentraremos en cómo el algoritmo transforma una población actual en una
nueva población mediante ecuaciones de movimiento en el dominio real.”

**Transición**

“Comencemos con el comportamiento que da origen al algoritmo.”

## Lámina 2. Contexto breve de PWO

**Tiempo sugerido: 50 segundos**

“El autor se inspira en los licaones africanos, también llamados painted
wolves. Antes de una caza, la manada realiza un rally en el que sus integrantes
expresan su disposición a participar. La influencia del alfa modifica esta
decisión colectiva.

PWO traduce esa conducta a una decisión de búsqueda. La manada es la población,
el rally decide entre exploración y explotación, y el alfa representa la mejor
solución registrada.

Este contexto permite entender los nombres de las fases. Ahora debemos
traducir cada lobo a una representación matemática.”

**Transición**

“En PWO, cada agente es una solución candidata.”

## Lámina 3. Representación

**Tiempo sugerido: 55 segundos**

“Cada agente \(i\) se representa mediante un vector de dimensión \(d\). Cada
componente \(X_{i,j}(t)\) es el valor de la variable de decisión \(j\) en la
iteración \(t\).

La función objetivo evalúa el vector completo y entrega un fitness. Así se
comparan las asignaciones y se conserva la mejor observada, denominada alfa.

Cuando el paper habla de mover un lobo, la operación matemática es construir
un nuevo vector \(\mathbf{X}_i(t+1)\).”

**Transición**

“Veamos en qué momento del algoritmo se construye ese vector.”

## Lámina 4. Ciclo del algoritmo

**Tiempo sugerido: 60 segundos**

“PWO comienza con una población real. Al inicio de cada iteración repara las
variables fuera del dominio, evalúa las soluciones y actualiza el alfa.

Luego calcula los parámetros del rally y decide si la población explorará o
explotará. La rama elegida aplica una ecuación de movimiento y genera
\(\mathbf{X}_i(t+1)\).

Los nuevos vectores se reparan y evalúan al comenzar la iteración siguiente.
Por tanto, el proceso separa tres acciones: evaluar, seleccionar una regla y
asignar nuevos valores.”

**Transición**

“La primera asignación ocurre cuando se genera la población inicial.”

## Lámina 5. Inicialización

**Tiempo sugerido: 60 segundos**

“Para cada agente y cada dimensión se genera un número uniforme entre cero y
uno. Ese número se escala al intervalo definido por los límites de la variable.

Así, cada \(X_{i,j}(0)\) recibe un valor real dentro de su dominio. Después se
evalúan todos los vectores y el menor fitness se registra como
`Alpha_score`; su posición se conserva como `Alpha_pos`.

El paper indica una inicialización aleatoria y las implementaciones la
concretan mediante esta ecuación uniforme.”

**Transición**

“Con la población evaluada, el rally selecciona la ecuación de movimiento.”

## Lámina 6. Rally

**Tiempo sugerido: 80 segundos**

“El parámetro \(a(t)\) disminuye con las iteraciones y permite calcular la
influencia \(L(t)\). Cada agente no alfa vota cuando su fitness cumple la
condición del paper. Cada voto suma 0.04 a la fuerza \(R(t)\).

También se calcula un umbral estocástico \(H(t)\). Si \(R(t)\) es menor que
\(H(t)\), la población explora. Si \(R(t)\) alcanza o supera el umbral,
explota.

La comparación es global para la iteración. Sin embargo, ni \(R(t)\) ni
\(H(t)\) producen directamente un nuevo valor. Solo seleccionan la ecuación
que lo hará.”

**Transición**

“Rogelio explicará las tres ecuaciones que pueden generar la nueva población.”

## Lámina 7. Exploración 1

**Tiempo sugerido: 75 segundos**

“La primera exploración selecciona un agente aleatorio y una dimensión \(j\).
Con esa componente calcula una distancia perturbada.

Luego combina la distancia con \(a(t)\) y un número aleatorio. El resultado es
un escalar que el paper asigna al vector completo del agente.

Esta actualización escalar-a-vector es la característica más particular de la
rama. El código realiza la escritura dentro del ciclo de dimensiones, por lo
que una componente del agente aleatorio puede redefinir todas las variables del
agente actual.”

**Transición**

“La segunda exploración trabaja directamente con vectores.”

## Lámina 8. Exploración 2

**Tiempo sugerido: 65 segundos**

“Primero se calcula la media de la población. Luego se resta esa media al alfa.
La ecuación también calcula la distancia absoluta entre el alfa y el agente, y
la pondera mediante la fuerza del rally.

Al restar ambos términos se obtiene directamente
\(\mathbf{X}_i(t+1)\). Todas las variables se actualizan en una operación
vectorial.

Interpretamos la diferencia entre alfa y media como información global de la
población. Esta lectura es una interpretación geométrica del equipo basada en
la ecuación publicada.”

**Transición**

“Cuando el rally selecciona explotación, el cálculo se expresa por variable.”

## Lámina 9. Explotación

**Tiempo sugerido: 80 segundos**

“Para la variable \(j\), primero se calcula la distancia entre el valor del
agente y el valor correspondiente del alfa. Después se construyen \(A_1\) y
\(A_2\), que combinan el parámetro de control, la fuerza del rally, la
influencia y un número aleatorio.

Finalmente, \(X_{i,j}(t+1)\) recibe el valor del alfa en esa dimensión menos
la distancia ponderada por \(A_2\).

Esta ecuación responde directamente la pregunta central: muestra qué valor
recibe cada variable en la iteración siguiente. La referencia en el alfa no
garantiza que cada movimiento individual reduzca la distancia.”

**Transición**

“Sigamos ahora una actualización completa con números fijos.”

## Lámina 10. Ruteo: selección de la rama

**Tiempo sugerido: 80 segundos**

“Usamos Sphere en dos dimensiones y una población de tres agentes. El agente 3,
con posición \((1.00,0.99)\) y fitness 1.9801, es el alfa.

Fijamos \(T=10\), \(t=1\) y la constante de voto en 0.04. Obtenemos
\(a=1.8\) y \(L=0.022222\).

Los agentes 1 y 2 cumplen la condición de voto, por lo que \(R=0.08\).
Fijando \(r_3=0.2\) y \(r_4=0.4\), el umbral publicado da \(H=0\).

Como \(R\) es mayor o igual que \(H\), la iteración selecciona explotación.
Hasta aquí hemos elegido la ecuación; ahora calcularemos los valores.”

**Transición**

“Actualizaremos las dos variables del agente 1.”

## Lámina 11. Ruteo: asignación y evaluación

**Tiempo sugerido: 105 segundos**

“Fijamos \(r_1=0.7\). Con ese valor obtenemos \(A_1=0.72\) y
\(A_2=0.1088\).

Para la primera variable, la distancia entre 1.01 y el valor 1.00 del alfa es
0.01. Multiplicamos esa distancia por \(A_2\) y la restamos a 1.00. El nuevo
valor es 0.998912.

Para la segunda variable, la distancia entre 1.00 y el valor 0.99 del alfa
también es 0.01. La misma operación produce 0.988912.

La nueva solución es \((0.998912,0.988912)\). Ambas variables permanecen en el
intervalo permitido, por lo que no requieren reparación.

Al evaluarla en Sphere, el fitness pasa de 2.0201 a 1.975772. En la evaluación
siguiente, este agente reemplazaría al alfa anterior.

El ruteo muestra el ciclo completo: evaluar, seleccionar una rama, asignar cada
variable, comprobar el dominio y volver a evaluar.”

**Transición**

“Antes de cerrar, podemos señalar qué queda por resolver en la implementación.”

## Lámina 12. Comprobación y decisiones pendientes

**Tiempo sugerido: 45 segundos**

“La implementación Python oficial redujo el fitness en Sphere con una semilla
fija. Esta prueba confirma funcionamiento en un caso sencillo, pero no
demuestra superioridad frente a otros algoritmos.

También encontramos diferencias entre el paper y el código: el umbral no usa
exactamente los mismos aleatorios, existe una discrepancia entre 0.04 y 0.05,
Python y MATLAB tratan de forma distinta el último valor de \(a(t)\), y algunas
escrituras se repiten dentro del ciclo de dimensiones.

Estas diferencias deben resolverse antes de fijar una implementación de
referencia.”

**Transición**

“Con esto podemos delimitar la siguiente etapa del proyecto.”

## Lámina 13. Cierre

**Tiempo sugerido: 35 segundos**

“PWO representa cada solución como un vector real. El rally selecciona una
regla y las dos estrategias de exploración o la explotación generan
\(\mathbf{X}_i(t+1)\).

El ruteo mostró cómo se asignan y evalúan los nuevos valores. El siguiente paso
será estabilizar esta dinámica continua y, sobre esa base, definir la
binarización para un problema discreto.”

## Preguntas previsibles

### ¿Por qué el rally no es una ecuación de movimiento?

“Porque \(R(t)\) y \(H(t)\) seleccionan una rama, pero no producen directamente
\(X_{i,j}(t+1)\). La asignación aparece en una de las ecuaciones de exploración
o explotación.”

### ¿Por qué el ruteo usa explotación?

“Porque esta ecuación expresa la actualización para cada dimensión y permite
seguir qué valor recibe cada variable. Las dos ramas de exploración se explican
antes del ejemplo.”

### ¿La nueva solución siempre mejora?

“No. Las ecuaciones proponen nuevas posiciones y la función objetivo determina
su calidad. En el ejemplo la solución mejora, pero no existe garantía de mejora
individual.”

### ¿Qué ocurre si una variable sale del dominio?

“La implementación aplica saturación: reemplaza el valor por el límite inferior
o superior correspondiente.”

### ¿Por qué no se incluye la binarización?

“Porque el profesor reservó la binarización para el informe final. Este avance
se concentra en comprender la dinámica real.”

### ¿Sphere demuestra que PWO es superior?

“No. Solo comprueba que la implementación se ejecuta y reduce el fitness en un
caso controlado.”

### ¿Qué versión se implementará?

“El paper contiene la formulación publicada y el código muestra una ejecución
concreta con algunas diferencias. Se compararán variantes controladas antes de
fijar una versión.”
