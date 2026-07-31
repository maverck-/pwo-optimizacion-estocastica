# Explicación intuitiva de Painted Wolf Optimization

## 1. La idea en una frase

Painted Wolf Optimization (PWO) mantiene varias soluciones candidatas y, en
cada iteración, selecciona entre buscar en otras zonas o actualizar la
población con referencia en la mejor solución encontrada.

No es un lobo real resolviendo el problema. El lobo es una metáfora para una
solución matemática.

## 2. Contexto del algoritmo

El paper se inspira en los licaones africanos. Antes de una caza, la manada
realiza un rally en el que sus integrantes expresan su disposición a
participar. El autor convierte esa decisión colectiva en una comparación
matemática: un rally bajo el umbral mantiene la exploración y uno que alcanza
el umbral activa la explotación.

El contexto ayuda a recordar las fases, pero no explica por sí solo el
algoritmo. La operación relevante es cómo cada ecuación transforma los valores
de una solución.

## 3. Relación entre los lobos y el algoritmo

| Metáfora | Significado matemático |
|---|---|
| Lobo | Una solución candidata |
| Posición del lobo | Valores de las variables de decisión |
| Terreno | Función objetivo |
| Calidad de una posición | Fitness de la solución |
| Manada | Población de soluciones |
| Lobo alfa | Agente que obtuvo el mejor registro histórico |
| Rally | Decisión entre exploración y explotación |
| Movimiento | Nueva asignación de valores |

Si un problema tiene dos variables, cada lobo posee una posición:

$$
\mathbf{X}_i(t)=(x_{i,1},x_{i,2}).
$$

La función objetivo evalúa esa posición. En un problema de minimización, el
menor valor observado se conserva como registro alfa. El código guarda por
separado el vector histórico `Alpha_pos` y el índice del agente que lo obtuvo;
si ese agente explora después, ambas posiciones pueden dejar de coincidir.

## 4. Analogía de las pelotas

La analogía usada para recocido simulado también sirve, con una diferencia:
ahora no hay una sola pelota, sino varias.

Imaginemos un conjunto de pelotas sobre un paisaje:

1. cada pelota está en una posición distinta;
2. la altura representa el valor de la función objetivo;
3. la pelota que encuentra el punto más bajo conocido es el alfa;
4. el grupo decide si se dispersa o se concentra alrededor del alfa;
5. después de moverse, las posiciones se vuelven a evaluar.

En recocido simulado, una pelota propone un movimiento y decide si lo acepta.
En PWO, primero se decide qué regla de movimiento utilizará la población.

| Aspecto | Recocido simulado | PWO |
|---|---|---|
| Soluciones activas | Una | Varias |
| Decisión principal | Aceptar o rechazar un vecino | Explorar o explotar |
| Referencia | Estado actual y mejor histórico | Alfa y población |
| Control dinámico | Temperatura | Rally y parámetros de movimiento |

## 5. ¿Qué hacen $R$ y $H$?

$R$ es la fuerza del rally y $H$ es un umbral estocástico. Su comparación
selecciona el modo global de la iteración:

$$
R < H
\quad\Rightarrow\quad
\text{exploración},
$$

$$
R \geq H
\quad\Rightarrow\quad
\text{explotación}.
$$

Una forma sencilla de recordarlo es:

> El rally no mueve a los lobos; decide qué ecuación los moverá.

$R$ y $H$ no determinan por sí solos cuánto se desplaza cada agente. La
distancia final también depende de:

- la distancia entre el agente y el alfa;
- el parámetro dinámico $a(t)$;
- la influencia del alfa $L(t)$;
- los números aleatorios de la ecuación seleccionada.

Durante la exploración, los agentes pueden seguir referencias alternativas y
visitar otras regiones. Durante la explotación, cada variable se actualiza con
el valor correspondiente del alfa como referencia. El paper describe esta rama
como convergencia, pero la ecuación no garantiza que cada movimiento individual
reduzca la distancia.

## 6. Ejemplo sencillo

Supongamos que se minimiza:

$$
f(x,y)=x^2+y^2.
$$

Tres agentes se encuentran en:

$$
\mathbf{X}_1=(1.01,1.00),\qquad
\mathbf{X}_2=(0.99,1.01),\qquad
\mathbf{X}_3=(1.00,0.99).
$$

Sus valores son:

$$
f(\mathbf{X}_1)=2.0201,\quad
f(\mathbf{X}_2)=2.0002,\quad
f(\mathbf{X}_3)=1.9801.
$$

El tercer agente es el alfa porque tiene el menor valor. Si el rally selecciona
explotación, los demás agentes actualizan sus variables usando la posición del
alfa como referencia. Esto no significa que todos se copien exactamente: la
distancia al alfa se combina con parámetros dinámicos y valores aleatorios.

## 7. ¿PWO solo puede minimizar?

No. El paper y el repositorio oficial están escritos con la convención de
minimización:

- `Alpha_score` comienza en infinito;
- una solución reemplaza al alfa cuando su fitness es menor;
- las funciones de prueba se plantean como problemas de minimización.

Esto proviene de la formulación del paper y del código oficial. No es una
limitación fundamental de las metaheurísticas ni una exigencia particular del
profesor.

Una forma práctica de maximizar $f$ es minimizar su negativo:

$$
\max f(\mathbf{x})
\quad\Longleftrightarrow\quad
\min g(\mathbf{x}),
\qquad
g(\mathbf{x})=-f(\mathbf{x}).
$$

También se puede modificar directamente el comparador:

- inicializar el mejor valor en $-\infty$;
- reemplazar al alfa cuando aparezca un fitness mayor.

Sin embargo, PWO utiliza los valores del fitness en la condición de voto. Por
eso, la transformación no solo cambia qué solución se considera mejor: también
puede modificar la dinámica del rally. Una versión para maximización debe
documentar la transformación y comprobar la sensibilidad al signo y a la
escala de la función objetivo.

## 8. Demo web

La demo interactiva muestra:

- la manada sobre un mapa de calor;
- el mejor vector histórico $\mathbf{X}_{\alpha}$ y el agente que lo obtuvo;
- la formación del rally y los valores de $R$ y $H$;
- la selección entre exploración y explotación;
- el desplazamiento de cada agente en una iteración;
- terrenos con tres niveles de dificultad;
- la comparación entre la actualización literal del código y una variante por
  componente.

La demo sirve para seguir la mecánica del algoritmo. No constituye evidencia de
desempeño ni reemplaza experimentos con semillas, parámetros y resultados
registrados.
