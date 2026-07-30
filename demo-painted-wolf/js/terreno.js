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
const MUESTRAS = 140;       // grilla para detectar mínimos
const RADIO_CENTRAL = 3.0;  // el global debe caer dentro de este radio
const TECHO_Y = 2.0;        // y máximo del global, deja libre la franja superior
const INTENTOS = 120;

/**
 * Niveles de dificultad. Lo que se controla es el FONDO de cada pozo, no su
 * amplitud: la profundidad se compensa por la cuenca (`d = fondo + curvatura·r²`)
 * para que un pozo lejano del centro no quede castigado por estar lejos. Sin
 * esa corrección la cuenca decidía las profundidades reales y no el diseño.
 *
 *   sGlobal  ancho del pozo global: estrecho es más difícil de encontrar
 *   fondoLoc fondo de los mínimos locales, como fracción del global
 *   extra    cuántos mínimos locales acompañan
 *   radio    a qué distancia del centro se coloca el global
 *   margen   ventaja mínima exigida al global sobre el segundo mejor
 *   senuelo  pozo ancho y profundo junto al centro, donde la cuenca ayuda
 */
export const DIFICULTADES = [
  {
    id: 'facil',
    nombre: 'Fácil',
    sGlobal: [0.95, 1.40],
    fondoLoc: [0.45, 0.70],
    extra: [2, 3],
    radio: [0, 2.2],
    separacion: 2.1,
    margen: 0.12,
    senuelo: false,
  },
  {
    id: 'media',
    nombre: 'Media',
    sGlobal: [0.70, 1.00],
    fondoLoc: [0.70, 0.88],
    extra: [3, 5],
    radio: [0.8, 2.6],
    separacion: 1.7,
    margen: 0.05,
    senuelo: false,
  },
  {
    id: 'dificil',
    nombre: 'Difícil',
    sGlobal: [0.42, 0.62],
    fondoLoc: [0.86, 0.96],
    extra: [5, 8],
    radio: [1.9, 3.0],
    separacion: 1.2,
    margen: 0.015,
    senuelo: true,
  },
];

let contador = 0;

const entre = (rng, [a, b]) => a + rng() * (b - a);

/** Profundidad que deja el fondo del pozo al nivel pedido, pese a la cuenca */
const profundidad = (fondo, x, y) => fondo + CURVATURA * (x * x + y * y);

function generarPozos(cfg, rng) {
  const pozos = [];

  // Pozo global: el de fondo más bajo, dentro de la banda visible
  let cx = 0;
  let cy = 0;
  let guardiaG = 0;
  do {
    const r = entre(rng, cfg.radio);
    const ang = rng() * Math.PI * 2;
    cx = r * Math.cos(ang);
    cy = r * Math.sin(ang);
    guardiaG += 1;
  } while ((Math.hypot(cx, cy) > RADIO_CENTRAL || cy > TECHO_Y) && guardiaG < 200);
  pozos.push({ x: cx, y: cy, d: profundidad(1, cx, cy), s: entre(rng, cfg.sGlobal) });

  // Señuelo: pozo ancho junto al centro. La cuenca tira hacia allá, así que
  // atrae a la manada mientras el óptimo real queda fuera del centro.
  if (cfg.senuelo) {
    let sx = 0;
    let sy = 0;
    let guardiaS = 0;
    do {
      sx = (rng() * 2 - 1) * 1.1;
      sy = (rng() * 2 - 1) * 1.1;
      guardiaS += 1;
    } while (Math.hypot(sx - cx, sy - cy) < cfg.separacion && guardiaS < 200);
    const fondo = entre(rng, cfg.fondoLoc);
    pozos.push({ x: sx, y: sy, d: profundidad(fondo, sx, sy), s: 1.3 + rng() * 0.45 });
  }

  // Mínimos locales
  const extra = Math.round(entre(rng, cfg.extra));
  let guardia = 0;
  while (pozos.length < extra + 1 && guardia < 600) {
    guardia += 1;
    const x = (rng() * 2 - 1) * 4.2;
    const y = (rng() * 2 - 1) * 4.2;
    if (pozos.some((p) => Math.hypot(p.x - x, p.y - y) < cfg.separacion)) continue;
    const fondo = entre(rng, cfg.fondoLoc);
    pozos.push({ x, y, d: profundidad(fondo, x, y), s: 0.65 + rng() * 0.8 });
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

function envolver(cruda, minimos, max, global, cfg) {
  const desplazamiento = global.v;
  const fxy = (x, y) => cruda(x, y) - desplazamiento;
  const maxVisible = max - desplazamiento;
  contador += 1;
  return {
    id: `terreno-${contador}`,
    nombre: `${cfg.nombre} · ${contador}`,
    dificultad: cfg.id,
    fxy,
    f: (p) => fxy(p[0], p[1]),
    optimos: [[global.x, global.y]],
    // Mínimos locales, para poder señalar las trampas si se quisiera
    locales: minimos.slice(1).map((m) => [m.x, m.y]),
    max: maxVisible,
    norma: (v) => Math.min(1, Math.max(0, (v / maxVisible) ** 0.6)),
  };
}

function intentar(cfg, rng) {
  const pozos = generarPozos(cfg, rng);
  const cruda = crudaDe(pozos);
  const { minimos, max } = buscarMinimos(cruda);

  if (minimos.length < 3) return null; // queremos trampas, no un valle solo

  const global = refinar(cruda, minimos[0]);
  const segundo = minimos[1].v;
  const rango = max - global.v;

  // Un único global, con ventaja clara sobre el segundo mejor
  if (segundo - global.v < cfg.margen * rango) return null;
  // Y ubicado en la banda visible, lejos de las tarjetas flotantes
  if (Math.hypot(global.x, global.y) > RADIO_CENTRAL + 0.4) return null;
  if (global.y > TECHO_Y + 0.4) return null;

  return envolver(cruda, minimos, max, global, cfg);
}

/**
 * Terreno nuevo del nivel pedido, garantizando un único mínimo global con
 * margen sobre el segundo mejor, mínimos locales que sirvan de trampa, y el
 * óptimo dentro de la banda visible.
 */
export function crearTerreno(dificultad = 1, rng = Math.random) {
  const cfg = DIFICULTADES[clampIndice(dificultad)];
  for (let k = 0; k < INTENTOS; k += 1) {
    const t = intentar(cfg, rng);
    if (t) return t;
  }
  // Respaldo determinista: un pozo con tres trampas alrededor
  const pozos = [
    { x: 0.6, y: -0.9, d: profundidad(1, 0.6, -0.9), s: 0.9 },
    { x: -2.6, y: 1.8, d: profundidad(0.85, -2.6, 1.8), s: 1.1 },
    { x: 2.8, y: 1.4, d: profundidad(0.8, 2.8, 1.4), s: 0.95 },
    { x: 1.2, y: -3.4, d: profundidad(0.82, 1.2, -3.4), s: 1 },
  ];
  const cruda = crudaDe(pozos);
  const { minimos, max } = buscarMinimos(cruda);
  const global = refinar(cruda, { x: 0.6, y: -0.9 });
  return envolver(cruda, minimos.length ? minimos : [global], max, global, cfg);
}

export function clampIndice(i) {
  return Math.min(DIFICULTADES.length - 1, Math.max(0, Math.round(i)));
}
