# Demo: Painted Wolf Optimization (PWO)

Demo visual interactiva para el proyecto de curso de **MII902 Optimización
Estocástica**.

Una manada de agentes recorre un mapa de calor visto desde arriba. Cada
iteración, los lobos votan: si la fuerza del rally `R` queda bajo el umbral `H`
la manada explora; en caso contrario, se actualiza con referencia en el alfa.
**El rally no mueve a los lobos, decide qué ecuación los moverá.**

$$
R < H \quad\Rightarrow\quad \text{exploración}
$$

$$
R \geq H \quad\Rightarrow\quad \text{explotación}
$$

PWO minimiza, así que el mejor punto es el más bajo.

## Los tres tiempos de cada iteración

La animación separa lo que en el código ocurre de golpe, para que se pueda
narrar paso a paso:

1. **Votar.** La manada se queda quieta. Cada lobo compara su `F` contra el
   alfa: anillo verde si cumple `F_i − L·F_α ≤ F_α` y aporta al rally, anillo
   rojo si no alcanza. Los votantes lanzan un trazo hacia el alfa.
2. **Mover.** Una línea por lobo con su desplazamiento en esta iteración, con
   el color del modo elegido: frío si exploró, cálido si explotó.
3. **Asentarse.** Una pausa breve con todo quieto, para alcanzar a leer el
   cambio antes de la iteración siguiente.

Cuando el récord mejora, la simulación agrega una pausa breve:

- **Cambió el agente que posee el récord**: el nuevo alfa parpadea antes de
  adoptar su color y el agente anterior vuelve al estilo de la manada.
- **El mismo agente mejoró su récord**: se muestra un único destello breve.

Si el desplazamiento del alfa no alcanza un píxel, la pausa se omite porque el
cambio no puede apreciarse en pantalla.

La manada siempre tiene `N` miembros: el alfa es un color, no una bola aparte.

La escena no lleva rótulos fijos para no estorbar el movimiento. Al **pasar el
cursor** sobre el óptimo global o sobre el alfa aparece su etiqueta con el
valor, y el cursor cambia de forma para avisar que hay algo que consultar.

## El anillo punteado

`X_α` es la posición **recordada** del récord, no un lobo. El código también
conserva el índice del agente que obtuvo ese récord. Cuando la posición actual
de ese agente coincide con `X_α`, su distancia de explotación es cero. Si el
agente exploró después de obtener el récord, su posición actual puede diferir
del registro. En ese caso aparece el anillo punteado, unido por una línea al
lobo que consiguió el récord.

La distinción afecta el algoritmo: la condición de voto usa el fitness
histórico `F_α`, mientras la segunda exploración y la explotación usan la
posición `X_α`. La primera exploración toma como referencia un agente
aleatorio. Durante la explotación, la manada usa la coordenada recordada y no
la posición actual del agente que la encontró.

El anillo aparece y se va de forma gradual según cuánto se haya separado el
lobo, y cuando cambia el récord el anillo viejo se apaga junto con el compás
del relevo en vez de desaparecer de golpe.

## Cómo ejecutar

Usa módulos ES, así que necesita un servidor (no funciona abriendo el archivo
directo). Desde esta carpeta:

```bash
python3 -m http.server 8000
```

y abrir <http://localhost:8000>.

## Correspondencia con el informe de avance

La numeración es la del informe del proyecto, que sigue al código oficial en
Python (`Alpha_score` histórico, convención de minimización, `c = 0.04`).

| Ecuación | Qué hace | Dónde |
|---|---|---|
| 2, 3 | Evaluar la manada y actualizar el alfa histórico | `js/pwo.js` |
| 4 | `a(t) = 2(1 − t/T)`, parámetro de control que disminuye hacia 0 | `js/pwo.js` |
| 5 | `L(t) = |c / a(t)|`, influencia del alfa | `js/pwo.js` |
| 6, 7 | Voto `F_i − L·F_α ≤ F_α` y fuerza `R = c · votos` | `js/pwo.js` |
| 8 | Umbral de la demo: `H = round(a(2r₃ − r₄)/L + r₅)` | `js/pwo.js` |
| 9 | Decisión global: `R < H` explora, si no explota | `js/pwo.js` |
| 10, 11 | Exploración 1: seguir a un agente aleatorio | `js/pwo.js` |
| 12, 13 | Exploración 2: alfa menos la media poblacional | `js/pwo.js` |
| 14 a 17 | Explotación: actualizar posiciones con referencia en el alfa y `A₂` | `js/pwo.js` |
| 18 | Saturación al dominio factible | `js/pwo.js` |

`js/pwo.js` contiene el núcleo del algoritmo sin las operaciones de dibujo.

## Controles

| Parámetro | Significado |
|---|---|
| **N** | Tamaño de la manada: soluciones candidatas simultáneas |
| **T** | Máximo de iteraciones, criterio de parada |
| **c** | Incremento de voto: cuánto aporta cada lobo al rally |
| **Terreno** | Nivel de dificultad del paisaje: Fácil, Media o Difícil |

Barra inferior izquierda: **Play/Pausa**, **velocidad 1× / 2× / 5× / 20×**
(toda corrida nueva parte en 1× para seguir el paso a paso con calma),
**Reiniciar**, **nuevo terreno**, **variante de exploración** y
**simbología**.

Teclado: `espacio` inicia o pausa, `R` reinicia, `N` genera un terreno nuevo,
`V` cambia la velocidad, `E` cambia la variante e `I` abre la simbología.

## Terrenos

Cada terreno se genera al azar como una cuenca suave con pozos gaussianos
encima:

```
f(x,y) = 0.055 (x² + y²) − Σ dₖ · exp( −‖(x,y) − cₖ‖² / 2σₖ² )
```

La cuenca hace que los bordes sean malos y las gaussianas producen los valles.
La generación se valida por rechazo sobre una grilla de muestreo para buscar
tres propiedades:

- un mínimo muestreado con una ventaja sobre el segundo mejor que depende del
  nivel;
- **varios mínimos locales** lo bastante competitivos para servir de trampa;
- el óptimo global **dentro de la banda visible**, para que no quede tapado por
  las tarjetas flotantes.

El terreno se desplaza para que el mínimo refinado que utiliza la demo valga
0. Esta normalización facilita la lectura visual; no reproduce la escala de
todas las funciones de prueba del paper.

Lo que se controla es el **fondo** de cada pozo y no su amplitud: la
profundidad se compensa por la cuenca con `d = fondo + 0.055·r²`, de modo que un
pozo lejano del centro no queda castigado por estar lejos. Sin esa corrección
la cuenca decidía las profundidades reales en vez del diseño.

### Los tres niveles

| Nivel | Pozo global | Fondo de los locales | Locales | Señuelo central |
|---|---|---|---|---|
| Fácil | ancho, cerca del centro | 45 % a 70 % del global | 2 a 3 | no |
| Media | intermedio | 70 % a 88 % | 3 a 5 | no |
| Difícil | estrecho, descentrado | 86 % a 96 % | 5 a 8 | sí |

El nivel Difícil agrega un **señuelo**: un pozo ancho y profundo junto al centro,
donde la cuenca favorece la búsqueda, mientras el mínimo objetivo queda
descentrado y estrecho.

## Variante de exploración

El botón de la barra alterna entre dos lecturas de la rama de exploración:

- **Literal**: conserva la estructura y el alcance de las asignaciones del
  código oficial, donde la ecuación 11 escribe un escalar sobre el vector
  completo dentro del ciclo de dimensiones. No implica equivalencia numérica
  exacta entre JavaScript y Python.
- **Por componente**: variante didáctica donde cada ecuación actualiza solo la
  componente `j`. Separa mejor el efecto de cada dimensión.

Ambas variantes están disponibles en la demo para comparar su comportamiento.

## Qué mirar durante la presentación

- **Anillos verde y rojo**: el resultado de la comparación de cada lobo contra
  el alfa. Los trazos hacia el alfa muestran el rally formándose.
- **Chip Explora / Explota**: el resultado de comparar `R` contra `H`. Ninguno
  de los dos es un error, son los dos modos del algoritmo.
- **Barra bajo la iteración**: `a(t)` disminuye desde 2 hacia 0. En la
  realización de la demo no alcanza exactamente 0. Al bajar `a(t)`, sube
  `L(t)` y cambia su interacción con los demás términos.
- **Destello del relevo**: el momento en que otro lobo bate el récord.
- **Franja superior del gráfico**: el modo elegido en cada iteración, útil para
  ver cuánto exploró la corrida en total.
- **Caja punteada**: el dominio factible. Fuera de ella las posiciones se
  saturan, tal como hace el código oficial.

## Alcance de la demo

El motor sigue la estructura de la implementación Python: alfa histórico,
minimización, voto de 0.04 y evaluación al comienzo de cada iteración. La
variante literal conserva las escrituras vectoriales dentro del ciclo de
dimensiones; la variante por componente modifica esa decisión con fines
didácticos.

El repositorio no conserva registros ni scripts que respalden una comparación
estadística entre el motor JavaScript y las implementaciones de los autores.
Por ello, la demo se utiliza para explicar el movimiento y no como evidencia de
equivalencia numérica o desempeño.

## Estructura

```
index.html          página
css/estilo.css      estilos de la interfaz
js/pwo.js           el algoritmo (rally, exploración y explotación)
js/terreno.js       generación y evaluación de los terrenos
js/main.js          simulación, render del canvas y controles
```
