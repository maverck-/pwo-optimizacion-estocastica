# Antecedentes para el avance del proyecto: Painted Wolf Optimization

Fecha de preparación: 28 de julio de 2026

## 1. Prioridad inmediata

La entrega prioritaria es:

- **Informe de avance en formato paper**.
- **Presentación de avance**.
- **Plazo máximo:** viernes 31 de julio de 2026 a las 19:00.
- **Medio de entrega:** correo electrónico con copia a todos.

El foco indicado por el profesor es explicar **cómo se asignan valores a las variables de decisión en el dominio de los reales**, es decir, las ecuaciones de movimiento del algoritmo. La binarización se incorpora en el informe final, no constituye el foco de este avance. Un ruteo o ejemplo numérico es bienvenido si mejora la explicación.

La Actividad 2 sigue pendiente y es una exigencia separada: compartir con el curso la comprensión del paper 1 asignado. Ese paper de lectura no debe confundirse con el paper de PWO elegido para el proyecto.

## 2. Contexto consolidado desde las clases

### Clase 1, 27 de junio

La primera clase justifica el uso de heurísticas y metaheurísticas mediante la explosión combinatoria. El proyecto debe entenderse dentro de ese problema general: buscar buenas soluciones sin enumerar exhaustivamente todo el espacio.

### Clase 2, 4 de julio

Orientaciones centrales:

- Escoger una metaheurística reciente.
- Entender cómo el algoritmo asigna valores a las variables de decisión.
- Explicar las ecuaciones de movimiento, su nomenclatura y sus parámetros.
- Evitar que la metáfora bioinspirada reemplace la explicación operacional.
- Preparar el avance y el informe final en formato paper.
- Proponer posteriormente una versión binaria aplicable a un problema como Set Covering Problem o mochila.
- Declarar el uso de IA generativa si se emplea en la redacción.

La estructura de paper discutida en clase comprende título, resumen, introducción, metodología, resultados, discusión, conclusiones y referencias. LaTeX/Overleaf se mencionó como una alternativa habitual, no como una obligación explícita.

### Clase 3, 10 de julio

El profesor distingue dos exigencias:

1. Las lecturas de papers asignadas por grupo, que corresponden a actividades de comprensión y exposición.
2. El proyecto del curso, para el cual cada grupo elige una metaheurística reciente publicada en una revista indexada.

Para el proyecto se indicó:

- Elegir una metaheurística reciente, idealmente de 2025-2027.
- Informar la elección al curso para evitar repeticiones.
- Preferir una revista de buen cuartil y un paper con código disponible.
- Elegir ecuaciones de movimiento comprensibles e implementables.
- Estudiar el algoritmo y explicarlo en un informe y una presentación de avance.
- Preparar el informe y presentación final para el 5 de septiembre.

La explicación de Pendulum Search dejó una pauta especialmente útil: una dimensión es una variable de decisión; cada variable pertenece a una solución o agente; y una ecuación de movimiento debe mostrar qué valor recibe la variable $j$ de la solución $i$ en la iteración $t+1$, a partir de información disponible en la iteración $t$.

En el cierre de la clase, el profesor volvió a insistir en que las ecuaciones de movimiento deben quedar "bien explicaditas", porque esa comprensión reduce los problemas de implementación.

### Clase 4, 18 de julio

La presentación de Sine Cosine Algorithm y la demostración de la plataforma experimental reforzaron los siguientes puntos:

- Una metaheurística poblacional recibe una población y entrega una población perturbada.
- El núcleo operativo consiste en asignar iterativamente nuevos valores a las variables de decisión.
- La asignación se evalúa mediante una función objetivo para comparar soluciones.
- El esquema computacional habitual recorre iteraciones, soluciones y dimensiones.
- La perturbación o delta cambia entre algoritmos; eso es lo que debe estudiarse.
- Las soluciones continuas deben mantenerse dentro del dominio de cada variable.
- Para funciones benchmark sin restricciones adicionales, la infactibilidad ocurre cuando una variable sale de su intervalo permitido.
- La metaheurística es independiente del problema; el problema o solver se encarga de validar, reparar y evaluar.
- Para validar una implementación se pueden usar las mismas funciones benchmark del paper y comprobar que el fitness mejora.
- La complejidad del algoritmo, el entorno experimental y los parámetros son antecedentes deseables.

La formulación más directa del profesor fue que la clave no es la metáfora del animal, sino implementar el delta y explicar cómo se vuelven a asignar valores a las variables de decisión.

## 3. Paper seleccionado

**Título:** Painted Wolf Optimization: A Novel Nature-Inspired Metaheuristic Algorithm for Real-World Optimization Problems

**Autor:** Saeid Sheikhi

**Revista:** Computers, Materials & Continua, volumen 87, número 2

**Fechas:** recibido el 17 de diciembre de 2025, aceptado el 16 de enero de 2026 y publicado el 12 de marzo de 2026

**DOI:** 10.32604/cmc.2026.077788

**Tipo de algoritmo:** metaheurística poblacional de inteligencia de enjambre para optimización continua.

**Representación:** cada lobo $i$ es una solución real de dimensión $d$:

$$
\mathbf{X}_i(t) = [X_{i,1}(t), X_{i,2}(t), \ldots, X_{i,d}(t)]
$$

Cada componente $X_{i,j}$ es el valor asignado a la variable de decisión $j$ de la solución $i$.

**Problema general:**

$$
\min_{\mathbf{x} \in \mathbb{R}^d} f(\mathbf{x})
\quad \text{sujeto a} \quad
lb_j \le x_j \le ub_j
$$

**Salida:** la mejor posición encontrada, `Alpha_pos`, y su evaluación, `Alpha_score`.

## 4. Flujo operacional de PWO

1. Inicializar $N$ soluciones aleatorias dentro del dominio.
2. Evaluar la función objetivo de cada solución.
3. Identificar la mejor solución registrada, llamada alfa.
4. Calcular la influencia dinámica del alfa.
5. Calcular la fuerza de la votación de la manada.
6. Calcular un umbral aleatorio de rally.
7. Elegir entre exploración y explotación:
   - Si la fuerza del rally es menor que el umbral, explorar.
   - Si la fuerza del rally alcanza o supera el umbral, explotar.
8. Aplicar la ecuación de movimiento correspondiente.
9. Reparar las variables que salgan de sus límites antes de evaluarlas.
10. Evaluar nuevamente y actualizar la mejor solución.
11. Repetir hasta alcanzar el número máximo de iteraciones.

## 5. Inicialización y control dinámico

### Inicialización de variables de decisión

Para cada agente $i$ y dimensión $j$:

$$
X_{i,j}(0) = lb_j + u_{i,j}(ub_j-lb_j),
\qquad u_{i,j} \sim U(0,1)
$$

Esta ecuación asigna a cada variable un valor real aleatorio dentro de su dominio.

### Parámetro de control

El paper señala que $a(t)$ decrece linealmente desde 2 hasta 0:

$$
a(t) = 2\left(1-\frac{t}{T}\right)
$$

Su función es modificar el comportamiento de búsqueda a medida que avanzan las iteraciones.

### Influencia del alfa

Con $c=\texttt{VOTE\_INCREMENT}=0.04$:

$$
L(t)=\texttt{Alpha\_influence}(t)
=
\left|\frac{c}{a(t)}\right|
$$

### Fuerza del rally

Cada agente no alfa vota si cumple:

$$
f(\mathbf{X}_i) - L(t)f(\mathbf{X}_{\alpha})
\le
f(\mathbf{X}_{\alpha})
$$

Por cada voto, la fuerza se incrementa en 0.04:

$$
R(t)=c\sum_{i\ne\alpha}
\mathbb{I}\left[
f(\mathbf{X}_i)-L(t)f(\mathbf{X}_{\alpha})
\le f(\mathbf{X}_{\alpha})
\right]
$$

### Umbral del rally

Según la ecuación 3 del paper:

$$
H(t)=
\operatorname{round}
\left(
\frac{a(t)(2r_3-r_4)}{L(t)}+r_4
\right),
\qquad r_3,r_4\sim U(0,1)
$$

La decisión global es:

- $R(t)<H(t)$: exploración.
- $R(t)\ge H(t)$: explotación.

## 6. Ecuaciones que asignan los nuevos valores reales

### Exploración, estrategia 1: seguir a un agente aleatorio

Se elige un agente aleatorio $\mathbf{X}_{rand}$. Para una dimensión $j$:

$$
D_{i,j}
=
\left|
\left(2L(t)r_1+r_2\right)X_{rand,j}
-X_{i,j}(t)
\right|
$$

$$
\mathbf{X}_i(t+1)
=
X_{rand,j}
-
\left(2a(t)r_1-a(t)\right)D_{i,j}
$$

donde $r_1,r_2\sim U(0,1)$.

Interpretación:

- $D_{i,j}$ mide una distancia perturbada entre la variable actual y la misma dimensión de un agente aleatorio.
- El factor $2a(t)r_1-a(t)$ puede ser positivo o negativo, por lo que permite moverse en ambas direcciones.
- El paper define una actualización escalar-a-vector: el escalar obtenido desde la dimensión $j$ se asigna a todo el vector del agente.
- Este mecanismo promueve exploración, aunque requiere una explicación explícita porque es menos convencional que una actualización componente a componente.

### Exploración, estrategia 2: coordinación entre alfa y media poblacional

Con probabilidad 0.5 se usa:

$$
\mathbf{X}_i(t+1)
=
\left(
\mathbf{X}_{\alpha}(t)-\operatorname{mean}(\mathbf{X}(t))
\right)
-
R(t)
\left|
\mathbf{X}_{\alpha}(t)-\mathbf{X}_i(t)
\right|
$$

Interpretación:

- Usa simultáneamente la mejor solución y el centro de la población.
- El término alfa menos media introduce una dirección global.
- La distancia al alfa, ponderada por la fuerza del rally, ajusta la posición particular de cada agente.
- Es una actualización vectorial.

### Explotación: convergencia hacia el alfa

Para cada dimensión $j$:

$$
D_{\alpha,i,j}
=
\left|
X_{\alpha,j}(t)-X_{i,j}(t)
\right|
$$

$$
A_2
=
R(t)
+
a(t)
\left(2a(t)r_1-a(t)\right)
L(t)
$$

$$
X_{i,j}(t+1)
=
X_{\alpha,j}(t)
-A_2D_{\alpha,i,j}
$$

Interpretación:

- $D_{\alpha,i,j}$ es la distancia absoluta entre la variable del agente y la misma variable de la mejor solución.
- $A_2$ controla magnitud y dirección del desplazamiento.
- El nuevo valor queda referenciado directamente al alfa.
- Al aplicarse por dimensión, esta es la ecuación más directa para mostrar cómo se asigna un valor real a $X_{i,j}(t+1)$.

## 7. Nomenclatura mínima para informe y presentación

| Símbolo | Significado |
|---|---|
| $N$ | Tamaño de la población o número de lobos |
| $T$ | Número máximo de iteraciones |
| $t$ | Iteración actual |
| $d$ | Número de variables de decisión |
| $i$ | Índice de solución o agente |
| $j$ | Índice de variable de decisión o dimensión |
| $\mathbf{X}_i(t)$ | Solución $i$ en la iteración $t$ |
| $X_{i,j}(t)$ | Valor real de la variable $j$ de la solución $i$ |
| $\mathbf{X}_{\alpha}$ | Mejor solución encontrada |
| $f(\mathbf{X}_{\alpha})$ | Mejor fitness encontrado |
| $\mathbf{X}_{rand}$ | Solución escogida aleatoriamente |
| $lb_j,ub_j$ | Límites inferior y superior de la variable $j$ |
| $a(t)$ | Parámetro de control decreciente |
| $c$ | Incremento de voto, fijado en 0.04 |
| $L(t)$ | Influencia dinámica del alfa |
| $R(t)$ | Fuerza acumulada del rally |
| $H(t)$ | Umbral que decide exploración o explotación |
| $r_1,r_2,r_3,r_4,q$ | Números aleatorios uniformes en $[0,1]$ |

## 8. Correspondencia entre paper y código oficial

El repositorio oficial fue ubicado en:

`/Users/maverick/Desarrollo/Estudio/painted-wolf-optimization/Painted-Wolf-Optimization`

Versión inspeccionada:

- Rama: `main`
- Commit: `fd0f4d0c33fdefc876e532e723e76ff5bbbdc9c4`
- Fecha del commit: 13 de marzo de 2026
- Implementaciones: Python y MATLAB

Correspondencias principales en `Python/PWO.py`:

| Concepto | Código |
|---|---|
| Inicialización real | `lb_vec + rand * (ub_vec - lb_vec)` |
| Reparación de dominio | `np.clip(Positions[i, :], lb_vec, ub_vec)` |
| Evaluación | `fitness = fobj(Positions[i, :])` |
| Selección del alfa | `if fitness < Alpha_score` |
| $a(t)$ | `2 * (1 - (t / max_iterations))` |
| $L(t)$ | `abs(VOTE_INCREMENT / a)` |
| Fuerza del rally | acumulación de `VOTE_INCREMENT` |
| Estrategia exploratoria 1 | bloque `if q < 0.5` |
| Estrategia exploratoria 2 | bloque `else` de exploración |
| Explotación | bloque `rally_strength >= rally_threshold` |

Una ejecución interna con semilla fija, función Sphere de 3 dimensiones, 20
agentes y 100 iteraciones redujo el fitness desde 4281.3964 hasta
$2.52\times10^{-92}$. Esto confirma que el código Python se ejecuta y reduce
el fitness en ese caso simple; no constituye por sí solo una validación
experimental del desempeño reportado por el paper.

## 9. Puntos técnicos que deben verificarse antes de presentar resultados

El paper y el código oficial no coinciden completamente en algunos detalles:

1. **Umbral del rally.** La ecuación 3 reutiliza $r_4$, mientras el código genera tres números aleatorios independientes: dos para `E0` y otro para el término sumado antes de redondear.
2. **Límite de $a(t)$.** El paper dice que decrece hasta cero. Python itera desde $t=0$ hasta $T-1$, por lo que no llega exactamente a cero. MATLAB itera desde 1 hasta $T$, lo que puede producir una división por cero en la última iteración.
3. **Símbolo de la ecuación 8.** El paper escribe `Linf(t)` sin definirlo explícitamente. El código usa `Alpha_influence`, por lo que la interpretación razonable es $L(t)$.
4. **Momento de evaluación.** El pseudocódigo recalcula fitness después del movimiento. El código evalúa al comienzo de la siguiente iteración; por ello, las posiciones creadas en la última actualización no se vuelven a evaluar.
5. **Actualizaciones vectoriales dentro del ciclo de dimensiones.** Las estrategias de exploración actualizan el vector completo, pero el código las ejecuta dentro del ciclo sobre $j$. La estrategia 2, aunque no depende de $j$, puede ejecutarse repetidamente.
6. **Reparación.** El código recorta los valores al dominio antes de evaluar, no inmediatamente después de generarlos.

Para el avance conviene:

- Presentar fielmente las ecuaciones publicadas.
- Mostrar cómo se reflejan en el código.
- Declarar estas diferencias como decisiones de reproducibilidad que se están verificando.
- No alterar silenciosamente el algoritmo antes de acordar una versión de referencia.

## 10. Ruteo recomendado para la presentación

Usar un ejemplo pequeño permite satisfacer directamente la invitación del profesor:

- Función: $f(\mathbf{x})=\sum_j x_j^2$.
- Dominio: por ejemplo, $[-10,10]^2$.
- Población: 3 agentes.
- Dimensiones: 2 variables.
- Mostrar una sola iteración.
- Fijar todos los números aleatorios para que el cálculo sea reproducible.

Secuencia:

1. Mostrar la matriz inicial de posiciones.
2. Calcular el fitness de cada fila.
3. Identificar el alfa.
4. Calcular $a(t)$ y $L(t)$.
5. Mostrar qué agentes votan y obtener $R(t)$.
6. Calcular $H(t)$.
7. Determinar si corresponde exploración o explotación.
8. Sustituir valores en una ecuación de movimiento.
9. Obtener $X_{i,1}(t+1)$ y $X_{i,2}(t+1)$.
10. Reparar si alguna variable sale del dominio.
11. Evaluar la nueva solución y compararla con la anterior.

La versión más clara para el primer ruteo es la explotación, porque actualiza cada dimensión de forma explícita. Luego se pueden mostrar las dos ramas de exploración en una lámina comparativa.

## 11. Estructura propuesta del informe de avance

1. **Título**
2. **Resumen**
   - Problema, PWO, objetivo del avance y estado de implementación.
3. **Palabras clave**
4. **Introducción**
   - Optimización estocástica, necesidad de balancear exploración y explotación y motivación para estudiar PWO.
5. **Antecedentes**
   - Metaheurísticas poblacionales y representación de soluciones reales.
6. **Painted Wolf Optimization**
   - Inspiración biológica resumida en un párrafo.
   - Representación de variables.
   - Inicialización y función objetivo.
   - Rally.
   - Exploración 1.
   - Exploración 2.
   - Explotación.
   - Manejo de límites.
7. **Correspondencia con la implementación**
   - Pseudocódigo y mapeo a Python/MATLAB.
8. **Ejemplo de ruteo**
   - Una iteración reproducible.
9. **Validación preliminar**
   - Ejecución en Sphere y curva de convergencia, claramente identificada como prueba de funcionamiento.
10. **Discusión**
    - Cómo las ecuaciones asignan valores.
    - Balance exploración/explotación.
    - Discrepancias paper-código y decisiones pendientes.
11. **Trabajo futuro**
    - Reproducción experimental.
    - Diseño de binarización.
    - Aplicación a un problema binario.
12. **Conclusiones**
13. **Declaración de uso de IA**
14. **Referencias**

## 12. Estructura propuesta de la presentación

1. Portada.
2. Contexto breve de PWO.
3. Representación de agentes y variables.
4. Ciclo general: inicializar, evaluar, decidir y mover.
5. Inicialización.
6. Rally: influencia, votos y umbral.
7. Exploración 1.
8. Exploración 2.
9. Explotación.
10. Ruteo: selección de la rama.
11. Ruteo: asignación y evaluación.
12. Comprobación y diferencias paper-código, como lámina opcional.
13. Cierre y camino a la binarización.

El contexto biológico debe ser breve y traducirse de inmediato a operaciones
de optimización. El mayor tiempo se destina a las variables, ecuaciones,
decisiones y sustitución numérica.

## 13. Lista de trabajo priorizada

### Imprescindible para el avance

- Cerrar la notación definitiva.
- Definir si la referencia operacional será la ecuación del paper o la implementación Python.
- Construir un ruteo numérico verificable.
- Redactar la sección de metodología con las ecuaciones 1-9.
- Preparar un diagrama simple del flujo.
- Ejecutar al menos una prueba reproducible.
- Preparar presentación e informe coherentes entre sí.
- Añadir la declaración de uso de IA.
- Revisar formato, referencias y envío con copia a todos.

### Para el informe final

- Seleccionar estrategia de binarización.
- Definir problema binario y representación.
- Diseñar factibilidad y reparación.
- Establecer protocolo experimental.
- Comparar contra baselines.
- Analizar resultados estadísticamente.

## 14. Fuentes locales revisadas

- `Transcripciones/video/clase-01_2026-06-27_resumen.md`
- `Transcripciones/fuentes/clase-02_2026-07-04_limpia.txt`
- `Transcripciones/clase-02_2026-07-04_resumen.md`
- `Transcripciones/fuentes/clase-03_2026-07-10_limpia.txt`
- `Transcripciones/fuentes/clase-03_2026-07-10.html`
- `Transcripciones/clase-03_2026-07-10_resumen.md`
- `Transcripciones/fuentes/clase-04_2026-07-18.html`
- `Planificación y exigencias - MII902.md`
- `Proyecto Curso/criterios_seleccion.md`
- `Proyecto Curso/PaintedWolfOptimization.pdf`
- Repositorio oficial clonado en `/Users/maverick/Desarrollo/Estudio/painted-wolf-optimization/Painted-Wolf-Optimization`
