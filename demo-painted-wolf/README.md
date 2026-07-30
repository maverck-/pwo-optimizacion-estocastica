# Demo: Painted Wolf Optimization (PWO)

Demo visual interactiva para el proyecto de curso de **MII902 Optimización
Estocástica**. Comparte el sistema visual de la demo de recocido simulado, de
modo que ambas se pueden presentar seguidas y comparar.

Una manada de agentes recorre un mapa de calor visto desde arriba. Cada
iteración, los lobos votan: si la fuerza del rally `R` queda bajo el umbral `H`
la manada explora, y si no, se cierra sobre el alfa. **El rally no mueve a los
lobos, decide qué ecuación los moverá.**

PWO minimiza, así que el mejor punto es el más bajo. La paleta del mapa viene
del pelaje del licaón: negro en los valles buenos, crema en las cumbres malas.
Los paneles van en claro, como una libreta de campo sobre una foto aérea.

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

Cuando el alfa cambia de dueño se abre un compás extra: la simulación se
detiene, el lobo entrante **parpadea** antes de tomar el color del alfa y el
saliente **pierde su luz** y vuelve al crema de la manada. La manada siempre
tiene `N` miembros: el alfa es un color, no una bola aparte.

La escena no lleva rótulos fijos para no estorbar el movimiento. Al **pasar el
cursor** sobre el óptimo global o sobre el alfa aparece su etiqueta con el
valor, y el cursor cambia de forma para avisar que hay algo que consultar.

`X_α` es la posición recordada del récord, no un lobo. Coincide con el lobo
alfa mientras la manada explota, pero al explorar el lobo se va y la memoria
queda atrás. Solo entonces aparece marcada aparte, con un anillo punteado
rotulado `Xα recordado`, unido por una línea al lobo que la consiguió.

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
| 4 | `a(t) = 2(1 − t/T)`, parámetro de control de 2 a 0 | `js/pwo.js` |
| 5 | `L(t) = |c / a(t)|`, influencia del alfa | `js/pwo.js` |
| 6, 7 | Voto `F_i − L·F_α ≤ F_α` y fuerza `R = c · votos` | `js/pwo.js` |
| 8 | Umbral `H = round(a(2r₃ − r₄)/L + r₄)` | `js/pwo.js` |
| 9 | Decisión global: `R < H` explora, si no explota | `js/pwo.js` |
| 10, 11 | Exploración 1: seguir a un agente aleatorio | `js/pwo.js` |
| 12, 13 | Exploración 2: alfa menos la media poblacional | `js/pwo.js` |
| 14 a 17 | Explotación: converger hacia el alfa con `A₂` | `js/pwo.js` |
| 18 | Saturación al dominio factible | `js/pwo.js` |

`js/pwo.js` es el archivo para mostrar en clase: alrededor de 90 líneas, sin
nada de dibujo.

## Controles

| Parámetro | Significado |
|---|---|
| **N** | Tamaño de la manada: soluciones candidatas simultáneas |
| **T** | Máximo de iteraciones, criterio de parada |
| **c** | Incremento de voto: cuánto aporta cada lobo al rally |

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
La generación se valida por rechazo para garantizar tres cosas:

- **un solo mínimo global**, con al menos un 8 % del rango de ventaja sobre el
  segundo mejor, así nunca hay ambigüedad sobre cuál es el objetivo;
- **entre 2 y 4 mínimos locales** con el 55 % al 86 % de la profundidad del
  global, lo bastante competitivos para servir de trampa;
- el óptimo global **en la banda central**, para que no quede tapado por las
  tarjetas flotantes.

El terreno se desplaza para que el mínimo global valga exactamente 0, la misma
convención de las funciones de prueba del paper.

## Variante de exploración

El botón de la barra alterna entre dos lecturas de la rama de exploración:

- **Literal**: reproduce el código oficial, donde la ecuación 11 asigna un
  escalar al vector completo dentro del ciclo de dimensiones. Es lo que hay que
  conservar para reproducir el artículo al pie de la letra.
- **Por componente**: variante didáctica donde cada ecuación actualiza solo la
  componente `j`. Separa mejor el efecto de cada dimensión.

La diferencia está documentada en el informe y debe declararse al reproducir
resultados experimentales.

## Qué mirar durante la presentación

- **Anillos verde y rojo**: el resultado de la comparación de cada lobo contra
  el alfa. Los trazos hacia el alfa muestran el rally formándose.
- **Chip Explora / Explota**: el resultado de comparar `R` contra `H`. Ninguno
  de los dos es un error, son los dos modos del algoritmo.
- **Barra bajo la iteración**: `a(t)` cayendo de 2 a 0. Al bajar `a(t)`, sube
  `L(t)`, y el comportamiento cambia.
- **Destello del relevo**: el momento en que otro lobo bate el récord.
- **Franja superior del gráfico**: el modo elegido en cada iteración, útil para
  ver cuánto exploró la corrida en total.
- **Caja punteada**: el dominio factible. Fuera de ella las posiciones se
  saturan, tal como hace el código oficial.

## Verificación

El motor se contrastó contra la implementación oficial en Python del
repositorio hermano `Painted-Wolf-Optimization`, con N = 24, T = 200 y 20
corridas por función, usando las mismas funciones de prueba clásicas en ambos
lados:

| Función | Mediana en Python | Mediana en esta demo |
|---|---|---|
| Esfera | 1.83e-188 | 1.32e-185 |
| Rastrigin | 0.00 | 0.00 |
| Himmelblau | 7.12e-10 | 9.03e-10 |

En Himmelblau ambas implementaciones aterrizan en alguno de los cuatro mínimos
analíticos, lo que confirma que el puerto a JavaScript es fiel.

Sobre los terrenos generados por la demo, 40 corridas por variante:

| Variante de exploración | Mediana | Halla el óptimo global |
|---|---|---|
| Por componente | 7.3e-13 | 40 de 40 |
| Literal del paper | 2.0e-12 | 38 de 40 |

Las dos corridas perdidas de la variante literal quedan atrapadas en un mínimo
local, consecuencia del colapso sobre la recta `x₁ = x₂`.

## Estructura

```
index.html          página
css/estilo.css      estilos de la interfaz
js/pwo.js           el algoritmo (rally, exploración y explotación)
js/terreno.js       paisajes: esfera, Rastrigin y Himmelblau
js/main.js          simulación, render del canvas y controles
```
