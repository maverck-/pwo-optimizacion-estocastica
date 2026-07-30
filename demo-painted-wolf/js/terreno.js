/**
 * Generador de terrenos para la demo de PWO.
 *
 * PWO minimiza: el mejor punto es el más bajo. En la metáfora, la presa está
 * en el fondo del valle más profundo y la manada baja hacia ella.
 *
 * Cada terreno es una cuenca suave con varios pozos gaussianos encima:
 *
 *   f(x, y) = 0.055 (x² + y²) − Σ dₖ exp( −‖(x,y) − cₖ‖² / 2σₖ² )
 *
 * La cuenca hace que los bordes sean malos y las gaussianas producen las
 * manchas orgánicas del mapa. La generación se valida por rechazo para
 * garantizar tres cosas:
 *
 *   1. hay UN solo mínimo global, con margen claro sobre el segundo mejor;
 *   2. hay varios mínimos locales cercanos en valor, que sirven de trampa;
 *   3. el óptimo global cae en la banda central, lejos de las tarjetas.
 *
 * Al final el terreno se desplaza para que el mínimo global valga exactamente
 * 0, que es la convención de las funciones de prueba del paper.
 */

export const DOMINIO = { lb: -5, ub: 5 };

const CURVATURA = 0.055;    // cuánto sube la cuenca hacia los bordes
const POZOS_EXTRA = [3, 5]; // rango de mínimos locales además del global
const MUESTRAS = 140;       // grilla para detectar mínimos
const SEPARACION = 1.9;     // distancia mínima entre centros de pozos
const MARGEN_GLOBAL = 0.08; // ventaja mínima del global sobre el segundo mejor
const RADIO_CENTRAL = 2.8;  // el global debe caer dentro de este radio
const TECHO_Y = 2.0;        // y máximo del global, deja libre la franja superior
const INTENTOS = 80;

let contador = 0;

function generarPozos(rng) {
  const pozos = [];

  // Pozo global: el más profundo, en la banda central
  let cx = 0;
  let cy = 0;
  do {
    cx = (rng() * 2 - 1) * RADIO_CENTRAL;
    cy = (rng() * 2 - 1) * RADIO_CENTRAL;
  } while (Math.hypot(cx, cy) > RADIO_CENTRAL || cy > TECHO_Y);
  pozos.push({ x: cx, y: cy, d: 1, s: 0.9 + rng() * 0.45 });

  // Mínimos locales: menos profundos, pero competitivos
  const extra = POZOS_EXTRA[0] + Math.floor(rng() * (POZOS_EXTRA[1] - POZOS_EXTRA[0] + 1));
  let guardia = 0;
  while (pozos.length < extra + 1 && guardia < 400) {
    guardia += 1;
    const x = (rng() * 2 - 1) * 4.2;
    const y = (rng() * 2 - 1) * 4.2;
    if (pozos.some((p) => Math.hypot(p.x - x, p.y - y) < SEPARACION)) continue;
    pozos.push({ x, y, d: 0.55 + rng() * 0.31, s: 0.7 + rng() * 0.8 });
  }

  return pozos;
}

function crudaDe(pozos) {
  return (x, y) => {
    let v = CURVATURA * (x * x + y * y);
    for (const p of pozos) {
      const dx = x - p.x;
      const dy = y - p.y;
      v -= p.d * Math.exp(-(dx * dx + dy * dy) / (2 * p.s * p.s));
    }
    return v;
  };
}

/** Mínimos locales sobre la grilla: puntos más bajos que sus ocho vecinos */
function buscarMinimos(cruda) {
  const { lb, ub } = DOMINIO;
  const paso = (ub - lb) / MUESTRAS;
  const rejilla = [];
  for (let i = 0; i <= MUESTRAS; i += 1) {
    const fila = new Float64Array(MUESTRAS + 1);
    const x = lb + paso * i;
    for (let j = 0; j <= MUESTRAS; j += 1) fila[j] = cruda(x, lb + paso * j);
    rejilla.push(fila);
  }

  let max = -Infinity;
  const minimos = [];
  for (let i = 0; i <= MUESTRAS; i += 1) {
    for (let j = 0; j <= MUESTRAS; j += 1) {
      const v = rejilla[i][j];
      if (v > max) max = v;
      if (i === 0 || j === 0 || i === MUESTRAS || j === MUESTRAS) continue;
      let esMinimo = true;
      for (let di = -1; di <= 1 && esMinimo; di += 1) {
        for (let dj = -1; dj <= 1; dj += 1) {
          if (di === 0 && dj === 0) continue;
          if (rejilla[i + di][j + dj] < v) { esMinimo = false; break; }
        }
      }
      if (esMinimo) minimos.push({ x: lb + paso * i, y: lb + paso * j, v });
    }
  }

  minimos.sort((a, b) => a.v - b.v);
  return { minimos, max };
}

/** Descenso local fino alrededor de un punto, para clavar el óptimo */
function refinar(cruda, punto) {
  let { x, y } = punto;
  let v = cruda(x, y);
  let radio = (DOMINIO.ub - DOMINIO.lb) / MUESTRAS;
  for (let vuelta = 0; vuelta < 60; vuelta += 1) {
    let mejoro = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = x + dx * radio;
      const ny = y + dy * radio;
      const nv = cruda(nx, ny);
      if (nv < v) { x = nx; y = ny; v = nv; mejoro = true; }
    }
    if (!mejoro) radio /= 2;
    if (radio < 1e-9) break;
  }
  return { x, y, v };
}

function intentar(rng) {
  const pozos = generarPozos(rng);
  const cruda = crudaDe(pozos);
  const { minimos, max } = buscarMinimos(cruda);

  if (minimos.length < 3) return null; // queremos trampas, no un valle solo

  const global = refinar(cruda, minimos[0]);
  const segundo = minimos[1].v;
  const rango = max - global.v;

  // Un único global, con ventaja clara sobre el segundo mejor
  if (segundo - global.v < MARGEN_GLOBAL * rango) return null;
  // Y ubicado en la banda central, lejos de las tarjetas flotantes
  if (Math.hypot(global.x, global.y) > RADIO_CENTRAL + 0.4) return null;
  if (global.y > TECHO_Y + 0.4) return null;

  const desplazamiento = global.v;
  const fxy = (x, y) => cruda(x, y) - desplazamiento;
  const maxVisible = max - desplazamiento;

  contador += 1;

  return {
    id: `terreno-${contador}`,
    nombre: `Terreno ${contador}`,
    fxy,
    f: (p) => fxy(p[0], p[1]),
    optimos: [[global.x, global.y]],
    // Mínimos locales, para poder señalar las trampas si se quisiera
    locales: minimos.slice(1).map((m) => [m.x, m.y]),
    max: maxVisible,
    norma: (v) => Math.min(1, Math.max(0, (v / maxVisible) ** 0.6)),
  };
}

/** Terreno nuevo, garantizando las tres condiciones de arriba */
export function crearTerreno(rng = Math.random) {
  for (let k = 0; k < INTENTOS; k += 1) {
    const t = intentar(rng);
    if (t) return t;
  }
  // Respaldo determinista: cuenca con un pozo central y dos trampas
  const pozos = [
    { x: 0, y: -0.4, d: 1, s: 1.1 },
    { x: -2.6, y: 2.2, d: 0.72, s: 1.1 },
    { x: 2.8, y: 1.6, d: 0.66, s: 0.95 },
    { x: 1.4, y: -3.2, d: 0.7, s: 1 },
  ];
  const cruda = crudaDe(pozos);
  const { max } = buscarMinimos(cruda);
  const global = refinar(cruda, { x: 0, y: -0.4 });
  const fxy = (x, y) => cruda(x, y) - global.v;
  const maxVisible = max - global.v;
  contador += 1;
  return {
    id: `terreno-${contador}`,
    nombre: `Terreno ${contador}`,
    fxy,
    f: (p) => fxy(p[0], p[1]),
    optimos: [[global.x, global.y]],
    locales: [[-2.6, 2.2], [2.8, 1.6], [1.4, -3.2]],
    max: maxVisible,
    norma: (v) => Math.min(1, Math.max(0, (v / maxVisible) ** 0.6)),
  };
}
