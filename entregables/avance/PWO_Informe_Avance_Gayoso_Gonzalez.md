# Painted Wolf Optimization: análisis de las ecuaciones de movimiento en el dominio continuo

**Maverick Gayoso, Rogelio González**

Magíster en Ingeniería Informática, Pontificia Universidad Católica de
Valparaíso  
MII902 Optimización Estocástica  
Profesor: Dr. Broderick Crawford Labrín

## Resumen

Painted Wolf Optimization (PWO) es una metaheurística poblacional estocástica
propuesta en 2026 e inspirada en la exploración cooperativa, la jerarquía y el
rally previo a la caza de los licaones africanos. El presente informe de avance
estudia el mecanismo continuo del algoritmo y, en particular, la forma en que
asigna nuevos valores reales a las variables de decisión. Cada agente representa
una solución candidata y cada dimensión de su posición corresponde a una
variable del problema. En cada iteración, PWO evalúa la población, identifica la
mejor solución o alfa y calcula una fuerza de rally. La comparación de esa fuerza
con un umbral estocástico selecciona una de tres reglas de movimiento: dos
estrategias de exploración y una de explotación. El trabajo formaliza estas
reglas con una nomenclatura común, presenta un ruteo numérico de una iteración y
contrasta la formulación publicada con la implementación oficial en Python y
MATLAB. La prueba preliminar sobre la función Sphere confirma que el código
Python puede reducir el fitness en un escenario controlado, aunque no constituye
una reproducción completa de los resultados del artículo. El análisis también
identifica diferencias entre paper, pseudocódigo y código que deben resolverse
antes de la fase experimental. La binarización y la aplicación a un problema
discreto se reservan para el informe final.

**Palabras clave:** optimización estocástica, metaheurística poblacional,
Painted Wolf Optimization, ecuación de movimiento, exploración, explotación.

## 1. Introducción

Los problemas de optimización reales pueden presentar espacios de búsqueda de
gran tamaño, funciones no convexas, múltiples óptimos locales o restricciones
que vuelven impracticable la enumeración exhaustiva. Las metaheurísticas
abordan estos escenarios mediante reglas generales de búsqueda que intentan
obtener soluciones de buena calidad con un costo computacional razonable. En
los métodos poblacionales, varias soluciones candidatas exploran
simultáneamente el espacio y comparten información durante el proceso.

Painted Wolf Optimization (PWO) fue presentado por Sheikhi en 2026 como una
metaheurística poblacional inspirada en el comportamiento social y de caza del
licaón africano [1]. El artículo propone un rally de votación para decidir si la
población continúa explorando o converge hacia la mejor solución conocida.
Además de funciones benchmark, el autor reporta aplicaciones en problemas de
diseño de ingeniería y en el entrenamiento de un sistema de detección de
intrusiones. Estos resultados son antecedentes del método, pero todavía no han
sido reproducidos independientemente en este proyecto.

El objetivo de este avance es responder una pregunta operacional:

> ¿Cómo obtiene PWO el valor de la variable $j$ de la solución $i$ en la
> iteración $t+1$?

La pregunta obliga a separar la metáfora biológica de la mecánica de
optimización. En este informe, un lobo es una solución, una posición es un
vector de valores reales, una dimensión es una variable de decisión y el
movimiento es una asignación iterativa. Sobre esa base se estudian la
inicialización, el rally, las tres reglas de actualización y el manejo del
dominio.

Las contribuciones de este avance son:

1. una notación unificada para las variables y parámetros de PWO;
2. una explicación paso a paso de las ecuaciones que generan valores reales;
3. un ruteo numérico reproducible de una actualización de explotación;
4. un mapeo entre ecuaciones y código oficial;
5. una lista de diferencias que deben resolverse antes de la experimentación
   final.

## 2. Antecedentes y alcance

### 2.1 Metaheurísticas poblacionales

Sea un problema de minimización con $d$ variables reales:

$$
\min_{\mathbf{x}\in\mathbb{R}^{d}} f(\mathbf{x})
$$

sujeto a:

$$
lb_j \leq x_j \leq ub_j,
\qquad j=1,\ldots,d.
$$

Un algoritmo poblacional mantiene $N$ soluciones:

$$
\mathbf{X}(t)=
\left[
\mathbf{X}_1(t),
\mathbf{X}_2(t),
\ldots,
\mathbf{X}_N(t)
\right]^\top.
$$

Cada agente es un vector:

$$
\mathbf{X}_i(t)=
\left[
X_{i,1}(t),
X_{i,2}(t),
\ldots,
X_{i,d}(t)
\right].
$$

El elemento $X_{i,j}(t)$ es el valor real de la variable $j$ de la
solución $i$ en la iteración $t$. La población se evalúa mediante
$f(\mathbf{X}_i(t))$. En un problema de minimización, la solución alfa es la
de menor fitness observado.

### 2.2 Trabajo seleccionado

El trabajo principal es *Painted Wolf Optimization: A Novel Nature-Inspired
Metaheuristic Algorithm for Real-World Optimization Problems*, publicado el 12
de marzo de 2026 [1]. La selección se justificó por su actualidad, la
disponibilidad de código oficial en Python y MATLAB [2] y la presencia explícita
de ecuaciones de movimiento en el dominio continuo.

Existe otra publicación posterior que utiliza el mismo animal y el acrónimo
PWO: *The Painted Wolf Decision Optimizer*, de Zakeri, Konstantas y Chatterjee
[3]. Ese trabajo propone un marco determinista para decisión multicriterio
discreta. No es una versión del algoritmo de Sheikhi ni la binarización que
desarrollará este proyecto. En lo sucesivo, **PWO** se refiere exclusivamente a
la metaheurística continua y estocástica de Sheikhi.

### 2.3 Alcance del avance

Este informe se concentra en el dominio de los reales. No se propone todavía
una función de transferencia binaria, un operador discreto ni una estrategia de
reparación para problemas combinatorios. La fase experimental también es
preliminar: se verifica que una implementación se ejecuta y mejora una función
sencilla, pero no se pretende validar aún la superioridad estadística reportada
por el autor.

## 3. Método Painted Wolf Optimization

### 3.1 Inicialización de la población

Para cada agente $i$ y cada variable $j$, PWO genera una posición aleatoria
dentro del dominio:

$$
X_{i,j}(0)
=
lb_j
+
u_{i,j}(ub_j-lb_j),
\qquad
u_{i,j}\sim U(0,1).
\tag{1}
$$

Esta es la primera asignación de valores a las variables. Si los límites son
escalares, se repiten en todas las dimensiones; si son vectores, cada variable
utiliza su propio intervalo.

Después de inicializar, el algoritmo evalúa:

$$
F_i(t)=f(\mathbf{X}_i(t)).
\tag{2}
$$

La mejor solución hasta el momento se define como:

$$
\alpha(t)
=
\arg\min_i F_i(t),
\qquad
\mathbf{X}_{\alpha}(t)=\mathbf{X}_{\alpha(t)}(t).
\tag{3}
$$

El código conserva el mejor valor histórico en `Alpha_score` y su vector en
`Alpha_pos`.

### 3.2 Parámetro de control e influencia del alfa

El artículo señala que el parámetro $a(t)$ decrece linealmente desde 2 hasta
0:

$$
a(t)
=
2\left(1-\frac{t}{T}\right),
\tag{4}
$$

donde $T$ es el máximo de iteraciones.

Con una constante de voto
$c=\texttt{VOTE\_INCREMENT}=0.04$, la influencia del alfa es:

$$
L(t)
=
\left|
\frac{c}{a(t)}
\right|.
\tag{5}
$$

Este valor participa tanto en la votación como en las ecuaciones de
movimiento. A medida que $a(t)$ disminuye, $L(t)$ aumenta. Por ello no debe
interpretarse $a(t)$ aisladamente como un simple tamaño de paso: el
comportamiento resulta de su interacción con el resto de los términos.

### 3.3 Rally y selección del modo de búsqueda

Cada agente no alfa emite un voto si:

$$
F_i(t)-L(t)F_{\alpha}(t)
\leq
F_{\alpha}(t).
\tag{6}
$$

La fuerza del rally es:

$$
R(t)
=
c
\sum_{i\neq\alpha}
\mathbb{I}
\left[
F_i(t)-L(t)F_{\alpha}(t)
\leq F_{\alpha}(t)
\right].
\tag{7}
$$

El umbral publicado es:

$$
H(t)
=
\operatorname{round}
\left(
\frac{a(t)(2r_3-r_4)}{L(t)}
+r_4
\right),
\qquad
r_3,r_4\sim U(0,1).
\tag{8}
$$

La decisión es global para la iteración:

$$
\begin{cases}
R(t)<H(t), & \text{exploración},\\
R(t)\geq H(t), & \text{explotación}.
\end{cases}
\tag{9}
$$

Cuando corresponde explorar, un nuevo número aleatorio
$q\sim U(0,1)$ selecciona una de dos estrategias con probabilidad 0.5.

### 3.4 Exploración 1: seguimiento de un agente aleatorio

Se selecciona aleatoriamente una solución
$\mathbf{X}_{rand}(t)$. Para cada dimensión $j$, se calcula:

$$
D_{i,j}^{rand}(t)
=
\left|
\left(2L(t)r_1+r_2\right)X_{rand,j}(t)
-X_{i,j}(t)
\right|,
\tag{10}
$$

con $r_1,r_2\sim U(0,1)$.

Luego:

$$
\mathbf{X}_i(t+1)
=
X_{rand,j}(t)
-
\left(2a(t)r_1-a(t)\right)
D_{i,j}^{rand}(t).
\tag{11}
$$

La ecuación 11 es particular porque produce un escalar a partir de la dimensión
$j$ y lo asigna al vector completo $\mathbf{X}_i$. El paper describe
explícitamente esta actualización escalar-a-vector como un mecanismo para que
la información de una dimensión influya en la dirección global de búsqueda.
Operacionalmente, esto significa que, en esa actualización, todas las variables
del agente reciben el mismo valor escalar. Esta característica debe conservarse
si se pretende reproducir literalmente el artículo.

### 3.5 Exploración 2: coordinación con alfa y media poblacional

La segunda estrategia usa el alfa y la media de la población:

$$
\mathbf{X}_i(t+1)
=
\left(
\mathbf{X}_{\alpha}(t)
-
\overline{\mathbf{X}}(t)
\right)
-
R(t)
\left|
\mathbf{X}_{\alpha}(t)-\mathbf{X}_i(t)
\right|,
\tag{12}
$$

donde:

$$
\overline{\mathbf{X}}(t)
=
\frac{1}{N}
\sum_{i=1}^{N}\mathbf{X}_i(t).
\tag{13}
$$

La resta $\mathbf{X}_{\alpha}-\overline{\mathbf{X}}$ introduce una dirección
global entre la mejor solución y el centro de la población. El segundo término
ajusta cada componente según la distancia absoluta del agente al alfa,
ponderada por la fuerza del rally.

### 3.6 Explotación: convergencia hacia el alfa

Cuando $R(t)\geq H(t)$, PWO actualiza cada variable en dirección al alfa:

$$
D_{i,j}^{\alpha}(t)
=
\left|
X_{\alpha,j}(t)-X_{i,j}(t)
\right|,
\tag{14}
$$

$$
A_1(t)=2a(t)r_1-a(t),
\tag{15}
$$

$$
A_2(t)
=
R(t)
+
a(t)A_1(t)L(t),
\tag{16}
$$

$$
X_{i,j}(t+1)
=
X_{\alpha,j}(t)
-
A_2(t)D_{i,j}^{\alpha}(t).
\tag{17}
$$

La ecuación 17 muestra directamente la asignación requerida:

1. se toma el valor de la variable $j$ de la mejor solución;
2. se calcula la distancia entre ese valor y el del agente;
3. se pondera la distancia mediante $A_2(t)$;
4. se resta la perturbación al valor del alfa.

La actualización se repite para todas las dimensiones y agentes.

### 3.7 Factibilidad y reparación del dominio

Las ecuaciones pueden producir valores fuera del intervalo permitido. La
implementación oficial utiliza saturación:

$$
X_{i,j}
\leftarrow
\min
\left(
ub_j,
\max(lb_j,X_{i,j})
\right).
\tag{18}
$$

Si una variable excede el límite superior, se reemplaza por $ub_j$; si cae
por debajo del límite inferior, se reemplaza por $lb_j$. Para las funciones
continuas sin otras restricciones, esta operación recupera la factibilidad.

### 3.8 Pseudocódigo operacional

```text
Inicializar N soluciones reales dentro de [lb, ub]
Inicializar Alpha_score = infinito

Para t = 1, ..., T:
    Reparar cada solución dentro de [lb, ub]
    Evaluar el fitness de cada solución
    Actualizar Alpha_pos y Alpha_score

    Calcular a(t), L(t), R(t) y H(t)

    Para cada agente i:
        Si R(t) < H(t):
            Generar q
            Si q < 0.5:
                aplicar exploración con agente aleatorio
            En otro caso:
                aplicar exploración con alfa y media
        En otro caso:
            Para cada variable j:
                aplicar explotación hacia el alfa

Retornar Alpha_pos y Alpha_score
```

La estructura dominante es $T\times N\times d$, además del costo de evaluar
la función objetivo. Sin considerar la complejidad interna de $f$, el costo
temporal del movimiento es $O(TNd)$ y la memoria principal es $O(Nd)$.

## 4. Ruteo numérico de una iteración

Se considera la función Sphere:

$$
f(\mathbf{x})=x_1^2+x_2^2,
\qquad
\mathbf{x}\in[-10,10]^2.
\tag{19}
$$

La población inicial es:

| Agente | $\mathbf{X}_i(t)$ | Fitness |
|---|---:|---:|
| 1 | $(1.01,1.00)$ | $2.0201$ |
| 2 | $(0.99,1.01)$ | $2.0002$ |
| 3 | $(1.00,0.99)$ | $1.9801$ |

El agente 3 es el alfa:

$$
\mathbf{X}_{\alpha}(t)=(1.00,0.99).
$$

Se fija $T=10$, $t=1$ y $c=0.04$:

$$
a(t)=2\left(1-\frac{1}{10}\right)=1.8,
$$

$$
L(t)=\frac{0.04}{1.8}=0.022222.
$$

La condición de voto equivale a:

$$
F_i(t)\leq
(1+L(t))F_{\alpha}(t)
=
2.024102.
$$

Los agentes 1 y 2 votan, por lo que:

$$
R(t)=2(0.04)=0.08.
$$

Para hacer el ejemplo reproducible se fijan $r_3=0.2$ y $r_4=0.4$:

$$
2r_3-r_4=0,
\qquad
H(t)=\operatorname{round}(0.4)=0.
$$

Como $R(t)=0.08\geq H(t)=0$, se selecciona explotación.

Para actualizar el agente 1 se fija $r_1=0.7$:

$$
A_1
=
2(1.8)(0.7)-1.8
=
0.72,
$$

$$
A_2
=
0.08
+
(1.8)(0.72)(0.022222)
=
0.1088.
$$

Primera variable:

$$
D_{1,1}^{\alpha}
=
|1.00-1.01|
=
0.01,
$$

$$
X_{1,1}(t+1)
=
1.00-(0.1088)(0.01)
=
0.998912.
$$

Segunda variable:

$$
D_{1,2}^{\alpha}
=
|0.99-1.00|
=
0.01,
$$

$$
X_{1,2}(t+1)
=
0.99-(0.1088)(0.01)
=
0.988912.
$$

La nueva solución es:

$$
\mathbf{X}_1(t+1)
=
(0.998912,0.988912).
$$

Su fitness es:

$$
f(\mathbf{X}_1(t+1))
=
1.975772.
$$

El valor mejora tanto el fitness previo del agente 1, $2.0201$, como el
fitness del alfa previo, $1.9801$. En la siguiente evaluación, el agente 1
pasaría a ser la mejor solución. Ninguna variable requiere reparación porque
ambas permanecen en $[-10,10]$.

## 5. Verificación preliminar y reproducibilidad

### 5.1 Prueba de funcionamiento

Se ejecutó la implementación Python oficial con:

- función Sphere;
- dimensión $d=3$;
- dominio $[-100,100]^3$;
- 20 agentes;
- 100 iteraciones;
- semilla NumPy 20260728.

El mejor fitness registrado disminuyó desde $4281.3964$ en la primera
iteración hasta $2.5198\times10^{-92}$ en la iteración 100. La curva del mejor
valor fue monótona no creciente porque `Alpha_score` conserva el mejor valor
histórico.

Este resultado solo demuestra que el código Python se ejecuta y converge en una
función sencilla con una semilla concreta. No permite afirmar que PWO supere a
otros métodos ni reproduce el conjunto de experimentos del artículo.

### 5.2 Diferencias entre paper y código

La inspección del paper y del repositorio oficial identificó los siguientes
puntos:

1. **Umbral del rally.** La ecuación 8 usa dos números aleatorios y reutiliza
   $r_4$. Python y MATLAB generan dos números para `E0` y un tercer número
   independiente para el término sumado antes de redondear.
2. **Último valor de $a(t)$.** Python recorre $t=0,\ldots,T-1$, por lo que
   $a(t)$ no llega exactamente a cero. MATLAB recorre
   $t=1,\ldots,T$, haciendo $a(T)=0$ y exponiendo la última iteración a una
   división por cero.
3. **Símbolo de la ecuación de explotación.** El paper escribe
   $\mathrm{Linf}(t)$ en una ecuación sin definirlo. El código utiliza
   `Alpha_influence`, interpretado aquí como $L(t)$.
4. **Momento de evaluación.** El pseudocódigo evalúa después del movimiento.
   Las implementaciones evalúan al comienzo de la iteración siguiente; por ello,
   la última población generada no vuelve a evaluarse.
5. **Actualización vectorial dentro del ciclo de dimensiones.** Las dos ramas de
   exploración escriben el vector completo dentro del ciclo sobre $j$. La
   segunda estrategia no utiliza $j$, pero puede ejecutarse repetidamente.
6. **Reparación.** Los límites se aplican antes de evaluar, no inmediatamente
   después de cada movimiento.

Estas diferencias no se corrigen silenciosamente en el avance. Para mantener
trazabilidad, las ecuaciones publicadas constituyen la formulación académica y
la versión Python se utiliza como referencia operacional. La versión definitiva
del proyecto deberá declarar cada decisión de implementación.

## 6. Discusión

PWO combina una decisión poblacional con tres perturbaciones diferentes. La
fuerza y el umbral del rally no asignan directamente valores a las variables;
seleccionan la regla que realizará esa asignación. La primera regla de
exploración se apoya en una solución aleatoria y puede separar la búsqueda de la
mejor solución actual. La segunda combina información global, mediante alfa y
la media, con la distancia individual. La explotación actualiza cada variable
respecto del alfa y es la regla más fácil de seguir en un ruteo manual.

La actualización escalar-a-vector de la primera exploración distingue a PWO de
esquemas convencionales que actualizan cada dimensión de forma independiente.
Al mismo tiempo, plantea una pregunta de reproducibilidad porque el código
ejecuta esa escritura dentro del ciclo de dimensiones. La experimentación futura
deberá comparar al menos la interpretación literal del código con una versión
que ejecute cada actualización vectorial una vez por agente.

El rally también merece análisis. Debido a la división por $L(t)$, el umbral
puede tomar valores de gran magnitud, positivos o negativos. Además, el valor de
`Alpha_score` participa directamente en la condición de voto, por lo que el
comportamiento puede variar si la función objetivo admite valores negativos o
si se transforma su escala. Esto sugiere que la sensibilidad del mecanismo no
depende únicamente de la geometría de las posiciones, sino también de la escala
del fitness.

Estas observaciones no invalidan el método, pero delimitan el trabajo requerido
para una reproducción rigurosa. Antes de binarizar PWO conviene estabilizar una
especificación continua, probarla sobre funciones de referencia y registrar
semillas, parámetros y número de evaluaciones.

## 7. Trabajo futuro

Para el informe final se proponen cuatro etapas:

1. **Estabilización continua.** Elegir y documentar una interpretación del
   umbral, del calendario de $a(t)$ y de las actualizaciones vectoriales.
2. **Reproducción.** Comparar resultados básicos con el código oficial sobre
   funciones Sphere, Rastrigin, Ackley y un subconjunto de las funciones usadas
   en el artículo.
3. **Binarización.** Transformar las posiciones reales en probabilidades o
   decisiones binarias mediante una función de transferencia y una regla de
   muestreo.
4. **Problema discreto.** Definir función objetivo, factibilidad y reparación
   para un problema como Set Covering Problem o mochila, y comparar contra
   baselines.

La binarización deberá preservar la separación entre metaheurística y problema:
PWO generará perturbaciones; el mecanismo binario representará decisiones; y el
solver evaluará y reparará soluciones según las restricciones específicas.

## 8. Conclusiones

El avance permitió traducir PWO desde su metáfora biológica a un proceso de
asignación de valores. Cada lobo corresponde a una solución real, el alfa es la
mejor solución histórica y el rally selecciona entre dos movimientos de
exploración y uno de explotación. Las ecuaciones 11, 12 y 17 son el núcleo que
genera $\mathbf{X}_i(t+1)$.

El ruteo muestra que la actualización de explotación puede seguirse variable por
variable y producir una mejora verificable. La ejecución preliminar confirma el
funcionamiento del código Python en Sphere. Sin embargo, el contraste entre
paper, pseudocódigo, Python y MATLAB revela diferencias que deben resolverse
antes de presentar resultados experimentales comparativos.

Por tanto, el resultado principal del avance no es todavía una versión binaria
ni una afirmación de superioridad, sino una comprensión operacional y trazable
del mecanismo continuo. Esta base permite abordar la implementación,
reproducción y binarización con decisiones explícitas.

## Declaración de uso de inteligencia artificial

Se utilizaron herramientas de inteligencia artificial generativa como apoyo
para organizar antecedentes, estructurar borradores y revisar la claridad del
texto. Las ecuaciones, referencias, cifras, discrepancias técnicas y resultados
numéricos fueron contrastados con el paper seleccionado, el código oficial y
cálculos reproducibles. Los autores son responsables de la revisión final y del
contenido presentado.

## Referencias

[1] S. Sheikhi, “Painted Wolf Optimization: A Novel Nature-Inspired
Metaheuristic Algorithm for Real-World Optimization Problems,” *Computers,
Materials & Continua*, vol. 87, no. 2, 2026.
<https://doi.org/10.32604/cmc.2026.077788>.

[2] S. Sheikhi, “Painted-Wolf-Optimization: official Python and MATLAB source
code,” GitHub, 2026.
<https://github.com/saeidsheikhi/Painted-Wolf-Optimization>.

[3] S. Zakeri, D. Konstantas, and P. Chatterjee, “The Painted Wolf Decision
Optimizer,” *Computers*, vol. 15, no. 7, art. 452, 2026.
<https://doi.org/10.3390/computers15070452>.

