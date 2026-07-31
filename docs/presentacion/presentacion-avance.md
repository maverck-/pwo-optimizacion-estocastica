# Guía de contenido para la presentación de avance

Esta guía organiza el contenido por láminas. No define el diseño visual de la
presentación.

Duración sugerida por el equipo: 12 a 15 minutos. En el corpus del curso no se
encontró una duración obligatoria para esta presentación de avance.

## Orientación confirmada

El profesor pidió explicar cómo el algoritmo asigna valores a las variables de
decisión mediante sus ecuaciones de movimiento en el dominio de los reales. La
binarización corresponde al informe final. Un ruteo es bienvenido cuando
facilita la explicación.

Las clases agregan cuatro criterios:

1. usar un contexto breve del algoritmo;
2. definir la nomenclatura y los parámetros;
3. mostrar la secuencia de iteraciones, agentes y dimensiones;
4. explicar el delta o perturbación que produce cada nuevo valor.

La presentación debe responder:

> Dado \(X_{i,j}(t)\), ¿cómo calcula PWO el nuevo valor
> \(X_{i,j}(t+1)\)?

## Lámina 1. Portada

**Título sugerido**

**Painted Wolf Optimization**

Asignación de valores reales mediante ecuaciones de movimiento

**Contenido**

- Maverick Gayoso y Rogelio González.
- MII902 Optimización Estocástica.
- Paper principal de Saeid Sheikhi (2026).

**Qué explicar**

En una frase, indicar que la exposición seguirá el cálculo que transforma una
población actual en una nueva población real.

**Tiempo sugerido:** 20 segundos.

## Lámina 2. Contexto breve de PWO

**Título sugerido**

**Del rally de la manada a una decisión de búsqueda**

**Contenido**

El autor se inspira en los licaones africanos o *painted wolves*. Antes de una
caza, la manada realiza un rally en el que sus integrantes expresan su
disposición a participar. PWO traduce esta conducta a una decisión entre
continuar buscando y actualizar la población con referencia en el alfa.

| Metáfora del paper | Operación en PWO |
|---|---|
| Manada | Población de soluciones |
| Rally y votos | Selección del modo de búsqueda |
| Búsqueda de presa | Exploración |
| Caza | Explotación |
| Alfa | Mejor solución registrada |

**Mensaje central**

El contexto permite entender los nombres de las fases. La explicación técnica
comienza al representar cada lobo como una solución.

**Tiempo sugerido:** 50 segundos.

## Lámina 3. Representación de una solución

**Título sugerido**

**Cada agente es un vector; cada componente, una variable**

$$
\mathbf{X}_i(t)=
[X_{i,1}(t),X_{i,2}(t),\ldots,X_{i,d}(t)]
$$

$$
F_i(t)=f(\mathbf{X}_i(t))
$$

**Nomenclatura**

- \(i\): agente o solución.
- \(j\): dimensión o variable de decisión.
- \(t\): iteración.
- \(d\): número de variables.
- \(F_i(t)\): fitness de la solución.
- \(\mathbf{X}_{\alpha}(t)\): mejor solución registrada.

**Mensaje central**

Mover un agente significa volver a asignar valores a las componentes de su
vector. La función objetivo permite comparar una asignación con otra.

**Tiempo sugerido:** 55 segundos.

## Lámina 4. Ciclo del algoritmo

**Título sugerido**

**PWO repite una secuencia de evaluación, decisión y movimiento**

```text
Inicializar población real
        ↓
Reparar y evaluar soluciones
        ↓
Actualizar el alfa
        ↓
Calcular a(t), L(t), R(t) y H(t)
        ↓
Elegir exploración o explotación
        ↓
Aplicar una ecuación de movimiento
        ↓
Obtener X_i(t+1)
        ↓
Reparar y evaluar en la iteración siguiente
```

**Mensaje central**

El rally elige la rama. Una de las ecuaciones de exploración o explotación
produce la nueva asignación.

**Tiempo sugerido:** 60 segundos.

## Lámina 5. Inicialización

**Título sugerido**

**La primera asignación respeta el dominio de cada variable**

$$
X_{i,j}(0)
=
lb_j
+
u_{i,j}(ub_j-lb_j),
\qquad
u_{i,j}\sim U(0,1)
$$

Después de inicializar:

1. se evalúa \(F_i(0)=f(\mathbf{X}_i(0))\);
2. se identifica el mejor registro;
3. se conserva su posición como \(\mathbf{X}_{\alpha}\).

**Mensaje central**

La inicialización es la primera asignación completa de valores reales. Las
implementaciones concretan así la inicialización aleatoria indicada por el
paper.

**Tiempo sugerido:** 60 segundos.

## Lámina 6. Rally

**Título sugerido**

**El rally decide qué ecuación se aplicará**

$$
a(t)=2\left(1-\frac{t}{T}\right),
\qquad
L(t)=\left|\frac{0.04}{a(t)}\right|
$$

Un agente no alfa vota si:

$$
F_i(t)-L(t)F_{\alpha}(t)
\leq
F_{\alpha}(t)
$$

La fuerza acumulada es:

$$
R(t)=0.04
\sum_{i\ne\alpha}
\mathbb{I}
\left[
F_i(t)-L(t)F_{\alpha}(t)
\leq
F_{\alpha}(t)
\right]
$$

El umbral publicado es:

$$
H(t)=
\operatorname{round}
\left(
\frac{a(t)(2r_3-r_4)}{L(t)}
+r_4
\right)
$$

La decisión global es:

$$
\begin{cases}
R(t)<H(t), & \text{exploración},\\
R(t)\geq H(t), & \text{explotación}.
\end{cases}
$$

**Mensaje central**

\(R(t)\) y \(H(t)\) no asignan todavía un valor. Seleccionan la ecuación que lo
hará.

**Tiempo sugerido:** 80 segundos.

## Lámina 7. Exploración 1

**Título sugerido**

**Una dimensión de un agente aleatorio genera la asignación**

$$
D_{i,j}^{rand}(t)=
\left|
\left(2L(t)r_1+r_2\right)X_{rand,j}(t)
-X_{i,j}(t)
\right|
$$

$$
\mathbf{X}_i(t+1)=
X_{rand,j}(t)
-
\left(2a(t)r_1-a(t)\right)
D_{i,j}^{rand}(t)
$$

**Secuencia**

1. seleccionar un agente aleatorio;
2. tomar su componente \(j\);
3. calcular la distancia perturbada;
4. obtener un escalar;
5. asignar ese resultado al vector del agente.

**Precisión**

El paper define una actualización escalar-a-vector. El código ejecuta esta
escritura dentro del ciclo de dimensiones.

**Tiempo sugerido:** 75 segundos.

## Lámina 8. Exploración 2

**Título sugerido**

**La segunda exploración combina alfa, media y posición individual**

$$
\overline{\mathbf{X}}(t)
=
\frac{1}{N}
\sum_{i=1}^{N}
\mathbf{X}_i(t)
$$

$$
\mathbf{X}_i(t+1)=
\left(
\mathbf{X}_{\alpha}(t)
-
\overline{\mathbf{X}}(t)
\right)
-
R(t)
\left|
\mathbf{X}_{\alpha}(t)-\mathbf{X}_i(t)
\right|
$$

**Secuencia**

1. calcular la media de la población;
2. restar la media al alfa;
3. calcular la distancia entre el alfa y el agente;
4. ponderarla con \(R(t)\);
5. obtener el nuevo vector.

**Mensaje central**

La ecuación actualiza simultáneamente todas las componentes. La lectura del
primer término como información global es una interpretación geométrica del
equipo.

**Tiempo sugerido:** 65 segundos.

## Lámina 9. Explotación

**Título sugerido**

**La explotación asigna cada variable con referencia en el alfa**

$$
D_{i,j}^{\alpha}(t)
=
\left|
X_{\alpha,j}(t)-X_{i,j}(t)
\right|
$$

$$
A_1(t)=2a(t)r_1-a(t)
$$

$$
A_2(t)=R(t)+a(t)A_1(t)L(t)
$$

$$
X_{i,j}(t+1)
=
X_{\alpha,j}(t)
-
A_2(t)D_{i,j}^{\alpha}(t)
$$

**Secuencia**

1. tomar el valor del alfa en la dimensión \(j\);
2. calcular la distancia respecto del agente;
3. ponderar la distancia mediante \(A_2(t)\);
4. restar la perturbación al valor del alfa.

**Mensaje central**

Esta ecuación responde directamente qué valor recibe \(X_{i,j}(t+1)\). La
referencia en el alfa no garantiza que cada movimiento individual reduzca la
distancia.

**Tiempo sugerido:** 80 segundos.

## Lámina 10. Ruteo: selección de la rama

**Título sugerido**

**El rally selecciona explotación en una población de tres agentes**

Se usa:

$$
f(\mathbf{x})=x_1^2+x_2^2,
\qquad
\mathbf{x}\in[-10,10]^2
$$

| Agente | Posición | Fitness |
|---|---:|---:|
| 1 | \((1.01,1.00)\) | \(2.0201\) |
| 2 | \((0.99,1.01)\) | \(2.0002\) |
| 3 | \((1.00,0.99)\) | \(1.9801\) |

El agente 3 es el alfa. Con \(T=10\), \(t=1\) y \(c=0.04\):

$$
a=1.8,
\qquad
L=0.022222
$$

Los agentes 1 y 2 votan:

$$
R=2(0.04)=0.08
$$

Fijando \(r_3=0.2\) y \(r_4=0.4\):

$$
H=\operatorname{round}(0.4)=0
$$

Por tanto:

$$
R=0.08\geq H=0
\quad\Rightarrow\quad
\text{explotación}
$$

**Tiempo sugerido:** 80 segundos.

## Lámina 11. Ruteo: asignación y evaluación

**Título sugerido**

**La ecuación produce dos nuevos valores reales**

Para actualizar el agente 1 se fija \(r_1=0.7\):

$$
A_1=0.72,
\qquad
A_2=0.1088
$$

Primera variable:

$$
X_{1,1}(t+1)
=
1.00-(0.1088)(0.01)
=
0.998912
$$

Segunda variable:

$$
X_{1,2}(t+1)
=
0.99-(0.1088)(0.01)
=
0.988912
$$

Nueva solución y evaluación:

$$
\mathbf{X}_1(t+1)
=
(0.998912,0.988912)
$$

$$
f(\mathbf{X}_1):
2.0201
\longrightarrow
1.975772
$$

**Cierre del ruteo**

- Ninguna variable requiere reparación.
- La nueva solución supera al alfa anterior.
- En la evaluación siguiente, el agente 1 se convierte en el nuevo alfa.

**Mensaje central**

El ejemplo muestra la decisión de la rama, la asignación variable por variable
y la evaluación de la nueva solución.

**Tiempo sugerido:** 105 segundos.

## Lámina 12. Comprobación y decisiones pendientes

Esta lámina es opcional. También puede quedar como respaldo para preguntas.

**Título sugerido**

**La implementación funciona, pero no coincide por completo con el paper**

**Comprobación**

La implementación Python oficial redujo el fitness en Sphere con una semilla
fija. Es una prueba de funcionamiento, no una demostración de superioridad.

**Diferencias relevantes**

1. El código usa un aleatorio adicional en el umbral.
2. Una tabla registra `Linf = 0.05`, mientras el método y el código usan
   \(0.04\).
3. Python evita \(a(t)=0\); MATLAB puede dividir por cero en la última
   iteración.
4. Algunas selecciones y escrituras vectoriales se repiten dentro del ciclo de
   dimensiones.

**Tiempo sugerido:** 45 segundos.

## Lámina 13. Cierre

**Título sugerido**

**Primero se fija la dinámica real; después se binariza**

**Conclusiones**

- Cada agente representa una asignación real completa.
- El rally selecciona una regla de movimiento.
- Dos ecuaciones de exploración y una de explotación generan
  \(\mathbf{X}_i(t+1)\).
- El ruteo muestra cómo se asignan y evalúan los nuevos valores.

**Siguiente etapa**

1. estabilizar la implementación continua;
2. reproducir funciones de referencia;
3. definir la binarización;
4. aplicar PWO a un problema discreto.

**Tiempo sugerido:** 35 segundos.

## Distribución sugerida

| Expositor | Láminas |
|---|---|
| Maverick Gayoso | 1 a 6 |
| Rogelio González | 7 a 11 |
| Maverick Gayoso | 12 y 13 |

La lámina 12 puede omitirse si el tiempo es limitado. En ese caso, sus puntos
principales pueden incorporarse al cierre o reservarse para preguntas.

## Contenido que conviene dejar fuera del cuerpo principal

- La historia biológica detallada del licaón.
- La comparación completa con otras metaheurísticas.
- Los resultados completos de los benchmarks del paper.
- El desarrollo de la binarización.
- La explicación exhaustiva de las discrepancias del código.

## Fuentes internas

- Paper local de PWO.
- Implementaciones oficiales en Python y MATLAB.
- `referencias/antecedentes/antecedentes_avance_pwo.md`.
- `docs/informe/informe-avance.md`.
- Transcripciones locales de las clases del 4, 10 y 18 de julio.
