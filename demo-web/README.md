# PWO · Laboratorio visual

Demo interactiva para comprender el funcionamiento general de Painted Wolf
Optimization (PWO) y su relación con:

- una manada de lobos;
- varias pelotas recorriendo un paisaje;
- el equilibrio entre exploración y explotación;
- la solución alfa;
- la comparación entre fuerza de rally \(R\) y umbral \(H\);
- problemas de minimización y maximización.

## Uso local

Requiere Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

La aplicación quedará disponible en la dirección indicada por Next.js,
normalmente `http://localhost:3000`.

## Interacción

La pantalla completa es la simulación. Los paneles flotantes muestran la
decisión colectiva y los valores necesarios para interpretar cada iteración:

- arriba a la izquierda: comparación entre rally `R` y umbral `H`;
- arriba a la derecha: alfa histórico y curva del mejor valor;
- abajo a la izquierda: reproducción, velocidad, paso, reinicio y ayuda;
- abajo al centro: metáfora, objetivo, paisaje y población.

Atajos: `espacio` inicia o pausa, `R` reinicia, `V` cambia la velocidad e `I`
abre la guía de lectura.

## Verificación

```bash
npm run lint
npm run build
```

## Despliegue en Vercel

1. Crear un nuevo proyecto en Vercel.
2. Seleccionar como directorio raíz `demo-web`.
3. Vercel detectará Next.js automáticamente.
4. No se requieren variables de entorno ni servicios externos.

## Alcance didáctico

La simulación conserva la lógica principal de PWO: población, alfa histórico,
rally, umbral y elección entre exploración y explotación.

Para facilitar la visualización, la primera estrategia de exploración se
presenta como una actualización por componente. El código oficial asigna en esa
rama un escalar al vector completo dentro del ciclo de dimensiones. Esta
diferencia está documentada en el informe del proyecto y debe considerarse al
reproducir resultados experimentales.

La opción de maximización usa la transformación:

\[
\max f(x)
\quad\Longleftrightarrow\quad
\min -f(x).
\]

Como el rally depende de los valores del fitness, toda adaptación a
maximización debe declarar la transformación y estudiar su sensibilidad al
signo y la escala.
