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

Cuando el récord mejora se abre un compás extra donde la simulación se detiene,
con dos formas según lo que pasó:

- **Cambió de dueño**: el lobo entrante **parpadea varias veces** antes de tomar
  el color del alfa, y el saliente **pierde su luz** y vuelve al crema de la
  manada.
- **El mismo lobo mejoró su récord** y el alfa se movió de sitio: un **único
  guiño**, más corto, que basta para notar el desplazamiento.

Si la mejora es tan pequeña que el alfa no se mueve ni un píxel no se abre
compás alguno. Eso pasa seguido: el récord mejora unas treinta veces por
corrida, pero la mediana del desplazamiento es de 0.004 unidades del dominio, y
detenerse ahí dejaría la corrida a tirones sin nada que mostrar. Con el filtro,
la pausa acumulada baja de 34 s a unos 8 s por corrida a 1×.

La manada siempre tiene `N` miembros: el alfa es un color, no una bola aparte.

La escena no lleva rótulos fijos para no estorbar el movimiento. Al **pasar el
cursor** sobre el óptimo global o sobre el alfa aparece su etiqueta con el
valor, y el cursor cambia de forma para avisar que hay algo que consultar.

## El anillo punteado

`X_α` es la posición **recordada** del récord, no un lobo. Coincide con el lobo
alfa mientras la manada explota, porque en la ecuación 17 la distancia al alfa
del propio alfa vale cero y se queda clavado. Pero al explorar el lobo se va y
la memoria queda atrás: entonces aparece el anillo punteado, unido por una
línea al lobo que consiguió ese récord.

Importa para el algoritmo, no es decoración: **todas las ecuaciones de
movimiento usan `X_α`**, la coordenada recordada, no la posición actual del
lobo que la encontró. Durante la explotación la manada converge hacia el
anillo punteado, no hacia la bola naranja. La línea es el recordatorio de esa
distinción.

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
La generación se valida por rechazo para garantizar tres cosas:

- **un solo mínimo global**, con una ventaja mínima sobre el segundo mejor que
  depende del nivel, así nunca hay ambigüedad sobre cuál es el objetivo;
- **varios mínimos locales** lo bastante competitivos para servir de trampa;
- el óptimo global **dentro de la banda visible**, para que no quede tapado por
  las tarjetas flotantes.

El terreno se desplaza para que el mínimo global valga exactamente 0, la misma
convención de las funciones de prueba del paper.

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
donde la cuenca ya empuja a la manada, mientras el óptimo real queda
descentrado y estrecho. El terreno miente sobre dónde conviene buscar.

Medido con N = 8, T = 200 y 100 corridas por nivel:

| Nivel | Halla el global | Queda atrapado | Iteraciones p25 / mediana / p75 |
|---|---|---|---|
| Fácil | 99 % | 1 % | 4 / 6 / 12 |
| Media | 86 % | 14 % | 4 / 8 / 15 |
| Difícil | 60 % | 40 % | 5 / 11 / 23 |

## Variante de exploración

El botón de la barra alterna entre dos lecturas de la rama de exploración:

- **Literal**: reproduce el código oficial, donde la ecuación 11 asigna un
  escalar al vector completo dentro del ciclo de dimensiones.
- **Por componente**: variante didáctica donde cada ecuación actualiza solo la
  componente `j`. Separa mejor el efecto de cada dimensión.

Ambas variantes están disponibles en la demo para comparar su comportamiento.

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
