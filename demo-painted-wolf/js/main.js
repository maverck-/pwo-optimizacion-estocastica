/**
 * Orquestación de la demo de PWO: simulación, render y controles.
 *
 * El algoritmo vive en pwo.js y los paisajes en terreno.js. Aquí solo se
 * dibuja el estado y se conectan los controles.
 *
 * La escena es un mapa de calor visto desde arriba. Se usa la paleta del
 * pelaje del licaón: negro en los valles buenos y crema en las cumbres malas,
 * porque PWO minimiza. Cada iteración se anima entre la posición previa y la
 * nueva, y el rally se muestra como líneas desde los votantes hacia el alfa.
 */
import { crearManada, iterarPWO, VOTO } from './pwo.js';
import { crearTerreno, DIFICULTADES, DOMINIO } from './terreno.js';

// ————— Constantes —————

const DIM = 2;
const BANDAS = 15;          // niveles del mapa de calor, da aspecto topográfico
const PASO_MAPA = 3;        // píxeles por muestra al construir el mapa
// Iteraciones por segundo a 1×. Como los multiplicadores escalan esta base,
// bajarla alarga todas las velocidades en la misma proporción.
const VEL_BASE = 0.9;

// Cada iteración se lee en tres tiempos: la manada evalúa y vota quieta, luego
// se mueve, y al final se asienta. Ese último compás deja notar el cambio de
// posición antes de que empiece la iteración siguiente.
// El reparto favorece al desplazamiento, que es lo que cuesta seguir: casi la
// mitad de la iteración se va en el recorrido.
const FASE_VOTO = 0.34;
const FASE_MOV = 0.82;

// Compás extra cuando el alfa cambia de dueño: la simulación se detiene, el
// candidato parpadea y el alfa saliente pierde su luz. Se acorta con la
// velocidad para que a 20× no frene la corrida.
const RELEVO_SEG = 1.1;

// Compás corto cuando el récord mejora sin cambiar de dueño: un solo parpadeo,
// porque si no el cambio de posición del alfa pasaba desapercibido.
const MEJORA_SEG = 0.45;

// El récord mejora unas treinta veces por corrida, pero casi siempre por
// milésimas: el alfa se desplaza menos de un píxel. Bajo este umbral no se abre
// compás, porque no habría nada que ver y la corrida quedaría a tirones.
const DESPLAZAMIENTO_VISIBLE = 0.05;
const MULTIPLICADORES = [1, 2, 5, 20];

// Paleta del pelaje: de los valles buenos (negro) a las cumbres malas (crema)
const PELAJE = [
  [0.00, [13, 11, 9]],
  [0.22, [44, 31, 20]],
  [0.45, [107, 66, 29]],
  [0.68, [171, 113, 51]],
  [0.85, [211, 165, 104]],
  [1.00, [238, 226, 206]],
];

// Colores del modo. Los de la escena van sobre el mapa oscuro; los del
// gráfico, sobre la tarjeta de papel, así que necesitan más cuerpo.
const COLOR_EXPLORA = [143, 180, 227];
const COLOR_EXPLOTA = [255, 156, 63];
const GRAFICO_EXPLORA = [52, 104, 159];
const GRAFICO_EXPLOTA = [224, 162, 74];
const GRAFICO_CURVA = 'rgba(194,98,10,0.95)';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ————— Estado —————

// N por defecto en 8 y no en 24: con manadas grandes la muestra inicial ya cae
// cerca del óptimo (23 % de las veces con N = 24) y la corrida se resuelve en
// dos o tres iteraciones, sin que se alcance a ver el algoritmo trabajar.
const params = { n: 8, T: 200, c: VOTO, dif: 1 };

let paisaje = crearTerreno(params.dif);
// Rama de exploración. Por defecto la variante por componente, porque la
// literal del paper colapsa a los agentes sobre la recta x₁ = x₂ y eso se lee
// como un error. El botón E activa la literal para mostrar justamente eso.
let literal = false;

let est = null;              // estado de la manada (pwo.js)
let ultima = null;           // resultado de la última iteración
let previas = [];            // posiciones al inicio de la iteración en curso
let actuales = [];           // posiciones al final de la iteración en curso
let tintes = [];             // tinte fijo por agente, para el pelaje moteado

let historial = [];          // { mejor, modo } por iteración
let mejorInicial = 1;        // normaliza la curva de convergencia
let alfaAnterior = null;     // { indice, pos, costo } del alfa que perdió el puesto
let pausaRelevo = 0;         // segundos que restan del compás de relevo
let relevoTotal = 0;         // duración de ese compás, para calcular el progreso
let tipoRelevo = null;       // 'cambio' si el alfa cambió de dueño, 'mejora' si solo se movió

let modo = 'listo';          // listo | ejecucion | pausado | detenido
let velIndice = 0;
let faseIter = 0;            // avance dentro de la iteración actual, 0 a 1
let tPrevio = performance.now();

let mapa = null;             // canvas fuera de pantalla con el terreno
let mapaClave = '';          // firma del mapa cacheado

let raton = null;            // { x, y } sobre la escena, para las etiquetas al pasar
let cursorActual = '';       // evita reescribir el estilo del cursor cada cuadro

// ————— DOM —————

const $ = (id) => document.getElementById(id);
const escena = $('escena');
const ctx = escena.getContext('2d');
const grafico = $('grafico');
const gtx = grafico.getContext('2d');

const dom = {
  iter: $('d-iter'), a: $('d-a'), gauge: $('gauge-fill'),
  evalR: $('eval-r'), evalH: $('eval-h'), evalModo: $('eval-modo'),
  votos: $('d-votos'), l: $('d-l'), alfa: $('d-alfa'),
  paisaje: $('d-paisaje'),
  play: $('btn-play'), iconoPlay: $('icono-play'), iconoPausa: $('icono-pausa'),
  vel: $('btn-vel'), variante: $('btn-variante'),
};

// ————— Utilidades —————

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const mezcla = (a, b, t) => a + (b - a) * t;
const suavizar = (t) => t * t * (3 - 2 * t);

/** Trunca en vez de redondear: 0.9998 se muestra 0.999 y no 1.000 */
function recortar(v, dec = 4) {
  if (!Number.isFinite(v)) return '—';
  const f = 10 ** dec;
  return (Math.trunc(v * f + Math.sign(v) * 1e-9) / f).toFixed(dec);
}

function colorPelaje(v) {
  const t = clamp(v, 0, 1);
  for (let i = 1; i < PELAJE.length; i += 1) {
    const [p1, c1] = PELAJE[i - 1];
    const [p2, c2] = PELAJE[i];
    if (t <= p2) {
      const u = (t - p1) / (p2 - p1 || 1);
      return [
        Math.round(mezcla(c1[0], c2[0], u)),
        Math.round(mezcla(c1[1], c2[1], u)),
        Math.round(mezcla(c1[2], c2[2], u)),
      ];
    }
  }
  return PELAJE[PELAJE.length - 1][1];
}

/** Color del modo vigente, para líneas y acentos de la escena */
function colorModo(alfa = 1) {
  const c = ultima?.modo === 'exploracion' ? COLOR_EXPLORA : COLOR_EXPLOTA;
  return `rgba(${c[0]},${c[1]},${c[2]},${alfa})`;
}

// ————— Simulación —————

function reiniciar({ nuevoPaisaje = false } = {}) {
  if (nuevoPaisaje) {
    paisaje = crearTerreno(params.dif);
    mapaClave = '';
  }

  est = crearManada(params.n, DIM, DOMINIO.lb, DOMINIO.ub);
  ultima = null;
  previas = est.posiciones.map((p) => p.slice());
  actuales = est.posiciones.map((p) => p.slice());
  tintes = est.posiciones.map(() => 0.55 + Math.random() * 0.45);
  historial = [];
  mejorInicial = 1;
  alfaAnterior = null;
  pausaRelevo = 0;
  relevoTotal = 0;
  tipoRelevo = null;
  faseIter = 0;
  fijarVelocidad(0); // toda corrida nueva parte lenta, a 1×
  cambiarModo('listo');
  dom.paisaje.textContent = paisaje.nombre;
  actualizarHUD();
}

function ejecutarIteracion() {
  const alfaAntes = est.alfaIndice;
  const costoAntes = est.alfaCosto;
  const posAntes = est.alfaPos.slice();

  ultima = iterarPWO(est, paisaje.f, {
    T: params.T,
    c: params.c,
    lb: DOMINIO.lb,
    ub: DOMINIO.ub,
    literal,
  });

  previas = ultima.previas;
  actuales = est.posiciones.map((p) => p.slice());

  // Compás para que el cambio del alfa se note. Tres casos:
  // cambió de dueño (parpadeo largo y el saliente se apaga), el mismo lobo
  // mejoró y el alfa se movió (un único guiño), o la mejora es tan pequeña que
  // el alfa no se movió en pantalla (no se abre compás).
  if (est.alfaCosto < costoAntes) {
    const primera = !Number.isFinite(costoAntes);
    const corrido = Math.hypot(
      est.alfaPos[0] - posAntes[0],
      est.alfaPos[1] - posAntes[1],
    );

    if (primera || corrido >= DESPLAZAMIENTO_VISIBLE) {
      const cambioDueno = primera || est.alfaIndice !== alfaAntes;
      tipoRelevo = cambioDueno ? 'cambio' : 'mejora';
      alfaAnterior = cambioDueno && !primera
        ? { indice: alfaAntes, pos: posAntes, costo: costoAntes }
        : null;
      relevoTotal = (cambioDueno ? RELEVO_SEG : MEJORA_SEG) / MULTIPLICADORES[velIndice];
      pausaRelevo = relevoTotal;
    }
  }

  if (historial.length === 0) mejorInicial = Math.max(est.alfaCosto, 1e-9);
  historial.push({ mejor: est.alfaCosto, modo: ultima.modo });

  if (est.t >= params.T) cambiarModo('detenido');
}

function fijarVelocidad(indice) {
  velIndice = indice;
  dom.vel.textContent = `${MULTIPLICADORES[velIndice]}×`;
}

function cicloVelocidad() {
  fijarVelocidad((velIndice + 1) % MULTIPLICADORES.length);
}

function cambiarModo(nuevo) {
  modo = nuevo;
  // classList y no .hidden: los SVG no son HTMLElement y lo ignoran
  const corriendo = nuevo === 'ejecucion';
  dom.iconoPlay.classList.toggle('oculto', corriendo);
  dom.iconoPausa.classList.toggle('oculto', !corriendo);
}

function alternar() {
  if (modo === 'ejecucion') cambiarModo('pausado');
  else if (modo === 'detenido') { reiniciar(); cambiarModo('ejecucion'); }
  else cambiarModo('ejecucion');
}

// ————— Geometría de la escena —————

function medidas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = escena.clientWidth;
  const h = escena.clientHeight;
  if (escena.width !== Math.round(w * dpr) || escena.height !== Math.round(h * dpr)) {
    escena.width = Math.round(w * dpr);
    escena.height = Math.round(h * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const escala = (Math.min(w, h) * 0.78) / (DOMINIO.ub - DOMINIO.lb);
  return { W: w, H: h, escala, cx: w / 2, cy: h / 2 };
}

const aPantalla = (p, g) => [g.cx + p[0] * g.escala, g.cy - p[1] * g.escala];

// ————— Mapa de calor —————

function construirMapa(g) {
  const clave = `${paisaje.id}|${Math.round(g.W)}x${Math.round(g.H)}|${Math.round(g.escala)}`;
  if (mapaClave === clave && mapa) return mapa;

  const w = Math.max(1, Math.ceil(g.W / PASO_MAPA));
  const h = Math.max(1, Math.ceil(g.H / PASO_MAPA));
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const octx = off.getContext('2d');
  const img = octx.createImageData(w, h);
  const datos = img.data;

  for (let py = 0; py < h; py += 1) {
    const y = -((py * PASO_MAPA - g.cy) / g.escala);
    for (let px = 0; px < w; px += 1) {
      const x = (px * PASO_MAPA - g.cx) / g.escala;
      const v = paisaje.norma(paisaje.fxy(x, y));
      // Cuantizar en bandas da el aspecto de curvas de nivel
      const banda = Math.min(1, Math.floor(v * BANDAS) / (BANDAS - 1));
      const [r, gg, b] = colorPelaje(banda);
      const k = (py * w + px) * 4;
      datos[k] = r;
      datos[k + 1] = gg;
      datos[k + 2] = b;
      datos[k + 3] = 255;
    }
  }

  octx.putImageData(img, 0, 0);
  mapa = off;
  mapaClave = clave;
  return mapa;
}


// ————— Etiqueta que aparece al pasar el cursor —————

const FUENTE_ETIQUETA = '13px "Geist Mono", ui-monospace, Menlo, monospace';
const FUENTE_VALOR = '600 16px "Geist Mono", ui-monospace, Menlo, monospace';

function dibujarTag(etiqueta, valor, cx, cy, W) {
  ctx.font = FUENTE_ETIQUETA;
  const anchoEtiqueta = ctx.measureText(etiqueta).width;
  ctx.font = FUENTE_VALOR;
  const anchoValor = valor ? ctx.measureText(valor).width : 0;
  const ancho = anchoEtiqueta + anchoValor + 24;
  const alto = 28;
  // No se sale por los costados de la pantalla
  const x = clamp(cx - ancho / 2, 8, Math.max(8, W - ancho - 8));
  const y = cy - alto;

  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, ancho, alto, 8);
  else ctx.rect(x, y, ancho, alto);
  ctx.fillStyle = 'rgba(12,10,8,0.86)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(242,233,221,0.32)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = FUENTE_ETIQUETA;
  ctx.fillStyle = 'rgba(242,233,221,0.88)';
  ctx.fillText(etiqueta, x + 12, y + alto / 2 + 0.5);
  if (valor) {
    ctx.font = FUENTE_VALOR;
    ctx.fillStyle = 'rgba(242,233,221,1)';
    ctx.fillText(valor, x + 12 + anchoEtiqueta, y + alto / 2 + 0.5);
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
}

/**
 * Flecha del origen al destino del salto. La punta queda antes del destino,
 * para que no la tape el lobo al llegar. Si el salto es muy corto se dibuja
 * solo un punto: una flecha con la punta más larga que el cuerpo confunde.
 */
function dibujarFlecha(ax, ay, bx, by, color, radio) {
  const dx = bx - ax;
  const dy = by - ay;
  const largo = Math.hypot(dx, dy);

  if (largo < radio * 1.2) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  const ux = dx / largo;
  const uy = dy / largo;
  const punta = Math.min(9, largo * 0.28);
  // El cuerpo termina donde empieza la punta, y la punta antes del lobo
  const fin = largo - radio * 0.9;
  const px = ax + ux * fin;
  const py = ay + uy * fin;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(px - ux * punta * 0.6, py - uy * punta * 0.6);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px - ux * punta + uy * punta * 0.45, py - uy * punta - ux * punta * 0.45);
  ctx.lineTo(px - ux * punta - uy * punta * 0.45, py - uy * punta + ux * punta * 0.45);
  ctx.closePath();
  ctx.fill();

  // Punto tenue en el origen, para no perder de dónde salió
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(ax, ay, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

const bajoElCursor = (px, py, radio) =>
  raton !== null && Math.hypot(raton.x - px, raton.y - py) <= radio;

// ————— Render de la escena —————

function dibujar() {
  const g = medidas();
  const { W, H } = g;

  ctx.drawImage(construirMapa(g), 0, 0, W, H);

  // Viñeta: concentra la atención en el centro
  const vin = ctx.createRadialGradient(g.cx, g.cy, Math.min(W, H) * 0.32, g.cx, g.cy, Math.max(W, H) * 0.78);
  vin.addColorStop(0, 'rgba(8,7,5,0)');
  vin.addColorStop(1, 'rgba(8,7,5,0.82)');
  ctx.fillStyle = vin;
  ctx.fillRect(0, 0, W, H);

  // Caja del dominio factible: fuera de ella las posiciones se saturan.
  // Va en blanco y discreta: delimita sin competir con la manada.
  const [x0, y0] = aPantalla([DOMINIO.lb, DOMINIO.ub], g);
  const lado = (DOMINIO.ub - DOMINIO.lb) * g.escala;

  ctx.save();
  ctx.strokeStyle = 'rgba(242,233,221,0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 6]);
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 4;
  ctx.strokeRect(x0, y0, lado, lado);
  ctx.restore();

  // Escuadras en las esquinas, para leer la frontera de un vistazo
  const esq = Math.min(20, lado * 0.045);
  ctx.strokeStyle = 'rgba(242,233,221,0.5)';
  ctx.lineWidth = 1.5;
  for (const [ex, ey, sx, sy] of [
    [x0, y0, 1, 1],
    [x0 + lado, y0, -1, 1],
    [x0, y0 + lado, 1, -1],
    [x0 + lado, y0 + lado, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(ex + sx * esq, ey);
    ctx.lineTo(ex, ey);
    ctx.lineTo(ex, ey + sy * esq);
    ctx.stroke();
  }

  // Rótulo del dominio: texto blanco tenue, sin píldora, con sombra para que
  // se lea igual sobre los valles oscuros y sobre las cumbres claras
  ctx.save();
  ctx.font = '11.5px "Geist Mono", ui-monospace, Menlo, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 5;
  ctx.fillStyle = 'rgba(242,233,221,0.62)';
  ctx.fillText(
    `dominio factible  [${DOMINIO.lb}, ${DOMINIO.ub}]²`,
    x0 + esq + 8,
    y0 + lado - 11,
  );
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  // Puntos que muestran su etiqueta al pasar el cursor por encima
  const hover = [];

  // Óptimos globales conocidos del paisaje
  for (const o of paisaje.optimos) {
    const [ox, oy] = aPantalla(o, g);
    hover.push({ x: ox, y: oy, r: 16, etiqueta: 'Óptimo Global: ', valor: '0.0000' });
    ctx.strokeStyle = 'rgba(242,233,221,0.5)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(ox, oy, 9, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ox - 14, oy);
    ctx.lineTo(ox - 4, oy);
    ctx.moveTo(ox + 4, oy);
    ctx.lineTo(ox + 14, oy);
    ctx.moveTo(ox, oy - 14);
    ctx.lineTo(ox, oy - 4);
    ctx.moveTo(ox, oy + 4);
    ctx.lineTo(ox, oy + 14);
    ctx.stroke();
  }
  // Sin rótulo: la cruz basta y no estorba el movimiento de la manada

  if (!est) return;

  const radio = clamp(Math.min(W, H) * 0.0075, 5, 9);
  const fase = reduceMotion ? 1 : clamp(faseIter, 0, 1);

  /** Cuánto se distingue el X_alfa recordado del lobo que lo consiguió:
      0 cuando están encima, 1 cuando ya están claramente separados */
  const separacion = (mx, my, lx, ly) =>
    clamp((Math.hypot(mx - lx, my - ly) - radio * 1.6) / (radio * 2.6), 0, 1);

  /** Anillo punteado del récord recordado, unido al lobo que lo encontró */
  const dibujarRecordado = (mx, my, lx, ly, op) => {
    if (op <= 0.02) return;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = `rgba(255,196,107,${0.75 * op})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(mx, my, radio * 1.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(mx, my);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  // Tres tiempos por iteración: votar quieto, moverse y asentarse
  const votando = fase < FASE_VOTO;
  const pVoto = votando ? fase / FASE_VOTO : 1;
  const pMov = suavizar(clamp((fase - FASE_VOTO) / (FASE_MOV - FASE_VOTO), 0, 1));

  // Compás de relevo del alfa: 0 al abrirse, 1 al cerrarse
  const enCompas = pausaRelevo > 0 && relevoTotal > 0;
  const pRelevo = enCompas ? clamp(1 - pausaRelevo / relevoTotal, 0, 1) : 1;
  const enRelevo = enCompas && tipoRelevo === 'cambio';
  const enMejora = enCompas && tipoRelevo === 'mejora';

  const enDominio = (q) => [
    clamp(q[0], DOMINIO.lb, DOMINIO.ub),
    clamp(q[1], DOMINIO.lb, DOMINIO.ub),
  ];

  // Posición mostrada: quieta en la previa mientras vota, luego avanza
  const vistas = est.posiciones.map((_, i) => {
    const a = enDominio(previas[i] ?? actuales[i]);
    const b = enDominio(actuales[i] ?? previas[i]);
    return [mezcla(a[0], b[0], pMov), mezcla(a[1], b[1], pMov)];
  });

  const [alfaX, alfaY] = aPantalla(enDominio(est.alfaPos), g);
  const votantes = ultima ? new Set(ultima.votantes) : null;

  // Tiempo 1: cada agente compara su F contra el alfa. Quien cumple la
  // condición del voto lanza un trazo verde que avanza hacia el alfa.
  if (ultima && votando) {
    ctx.lineWidth = 1.5;
    for (const i of ultima.votantes) {
      const [vx, vy] = aPantalla(vistas[i], g);
      const ex = mezcla(vx, alfaX, pVoto);
      const ey = mezcla(vy, alfaY, pVoto);
      ctx.strokeStyle = 'rgba(159,214,138,0.55)';
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }

  // Tiempo 2: una flecha por agente apuntando a DONDE VA, no a de dónde viene.
  // Las tres ecuaciones asignan una coordenada absoluta, no un paso: PWO no
  // tiene velocidad ni desplazamiento acumulado. Por eso la flecha se dibuja
  // completa desde el inicio del movimiento, anunciando el destino, y el lobo
  // recorre después. El color dice qué ecuación lo movió.
  if (ultima && !votando) {
    for (let i = 0; i < vistas.length; i += 1) {
      const [ax, ay] = aPantalla(enDominio(previas[i]), g);
      const [bx, by] = aPantalla(enDominio(actuales[i]), g);
      dibujarFlecha(ax, ay, bx, by, colorModo(0.34), radio);
    }
  }

  // El alfa es un color que lleva uno de los lobos, no una bola aparte: la
  // manada siempre tiene N miembros, ninguno aparece ni desaparece.
  const hayAlfa = Number.isFinite(est.alfaCosto);
  const iAlfa = hayAlfa ? est.alfaIndice : -1;
  const iSaliente = enRelevo && alfaAnterior ? alfaAnterior.indice : -1;

  // Relevo de dueño: varios parpadeos y el color se enciende de a poco.
  // Mejora del mismo lobo: un solo guiño, se apaga y vuelve.
  let parpadeo = 1;
  if (enRelevo && pRelevo < 0.66) parpadeo = 0.3 + 0.7 * Math.abs(Math.sin(pRelevo * 11));
  else if (enMejora) parpadeo = 1 - 0.8 * Math.sin(pRelevo * Math.PI);

  const encendido = enRelevo ? clamp(pRelevo / 0.7, 0, 1) : 1;
  const luzSaliente = enRelevo ? 1 - pRelevo : 0;

  const CREMA = (i) => [232 * tintes[i], 214 * tintes[i], 186 * tintes[i]];
  const NARANJO = [255, 196, 107];

  // Halo del alfa, detrás de la manada
  if (iAlfa >= 0) {
    const [hx, hy] = aPantalla(vistas[iAlfa], g);
    const hr = radio * (6 + (enRelevo ? (1 - pRelevo) * 4 : 0));
    const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
    halo.addColorStop(0, `rgba(255,156,63,${0.42 * parpadeo * encendido})`);
    halo.addColorStop(1, 'rgba(255,156,63,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(hx - hr, hy - hr, hr * 2, hr * 2);

    if (enRelevo) {
      ctx.strokeStyle = `rgba(255,244,214,${0.8 * (1 - pRelevo)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, radio * (1.6 + pRelevo * 4.5), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // La manada
  for (let i = 0; i < vistas.length; i += 1) {
    const [vx, vy] = aPantalla(vistas[i], g);
    const esAlfa = i === iAlfa;

    let color = CREMA(i);
    let escala = 1;
    let opacidad = 0.95;

    if (esAlfa) {
      // Entrante: parte crema, parpadea y termina en el naranjo del alfa
      color = color.map((c, k) => mezcla(c, NARANJO[k], encendido));
      escala = mezcla(1, 1.45, encendido);
      opacidad = parpadeo;
    } else if (i === iSaliente) {
      // Saliente: pierde su luz y vuelve al crema de la manada
      color = color.map((c, k) => mezcla(c, NARANJO[k], luzSaliente));
      escala = mezcla(1, 1.45, luzSaliente);
    }

    ctx.beginPath();
    ctx.arc(vx, vy, radio * escala, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.round(color[0])},${Math.round(color[1])},${Math.round(color[2])},${opacidad})`;
    ctx.fill();
    ctx.strokeStyle = 'rgba(12,10,8,0.85)';
    ctx.lineWidth = esAlfa ? 2 : 1.6;
    ctx.stroke();

    // Mientras se vota, el anillo dice el resultado de la comparación:
    // verde cumple F_i − L·F_alfa ≤ F_alfa, rojo no alcanza
    if (ultima && votando && !esAlfa) {
      const vota = votantes.has(i);
      ctx.strokeStyle = vota ? 'rgba(159,214,138,0.85)' : 'rgba(224,122,106,0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(vx, vy, radio + 3.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  if (iAlfa >= 0) {
    const [ax, ay] = aPantalla(vistas[iAlfa], g);

    // El X_alfa recordado del alfa saliente se apaga junto con el relevo,
    // en vez de esfumarse de golpe cuando cambia el récord
    if (enRelevo && alfaAnterior) {
      const [vax, vay] = aPantalla(enDominio(alfaAnterior.pos), g);
      const [vlx, vly] = aPantalla(vistas[alfaAnterior.indice], g);
      const op = separacion(vax, vay, vlx, vly) * (1 - pRelevo);
      dibujarRecordado(vax, vay, vlx, vly, op);
    }

    // X_alfa es la posición recordada del récord. Coincide con el lobo alfa
    // mientras explota, pero al explorar el lobo se va y la memoria queda.
    // El anillo aparece y se va con la separación, sin cortes bruscos.
    const visible = separacion(alfaX, alfaY, ax, ay);
    dibujarRecordado(alfaX, alfaY, ax, ay, visible);

    // Solo se puede consultar cuando ya se distingue de la bola del alfa
    if (visible > 0.35) {
      hover.push({
        x: alfaX,
        y: alfaY,
        r: radio * 2,
        etiqueta: 'Xα recordado: ',
        valor: recortar(est.alfaCosto, 4),
      });
    }

    hover.push({
      x: ax,
      y: ay,
      r: radio * 2.4,
      etiqueta: enRelevo ? 'Xα nuevo: ' : 'Xα: ',
      valor: recortar(est.alfaCosto, 4),
    });
  }

  // Etiqueta del punto bajo el cursor, encima de todo lo demás. Se busca desde
  // el final para que el alfa gane cuando ya está sobre el óptimo global.
  const apuntado = hover.findLast((p) => bajoElCursor(p.x, p.y, p.r));
  if (apuntado) dibujarTag(apuntado.etiqueta, apuntado.valor, apuntado.x, apuntado.y - 14, W);

  const cursor = apuntado ? 'pointer' : 'default';
  if (cursor !== cursorActual) {
    escena.style.cursor = cursor;
    cursorActual = cursor;
  }
}

// ————— Curva de convergencia —————

function dibujarGrafico() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = grafico.clientWidth;
  const h = grafico.clientHeight;
  if (grafico.width !== Math.round(w * dpr) || grafico.height !== Math.round(h * dpr)) {
    grafico.width = Math.round(w * dpr);
    grafico.height = Math.round(h * dpr);
  }
  gtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  gtx.clearRect(0, 0, w, h);

  const n = historial.length;
  if (n < 2) return;

  // Franja superior: modo elegido en cada iteración
  const anchoFranja = w / n;
  for (let i = 0; i < n; i += 1) {
    const c = historial[i].modo === 'exploracion' ? GRAFICO_EXPLORA : GRAFICO_EXPLOTA;
    gtx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},0.8)`;
    gtx.fillRect(i * anchoFranja, 0, Math.max(anchoFranja, 1), 5);
  }

  // Curva del mejor valor, normalizada al primer mejor conocido
  const py = (v) => {
    const u = clamp(v / mejorInicial, 0, 1);
    return h - 5 - u * (h - 14);
  };

  gtx.strokeStyle = GRAFICO_CURVA;
  gtx.lineWidth = 1.6;
  gtx.beginPath();
  for (let i = 0; i < n; i += 1) {
    const x = (i / (n - 1)) * w;
    const y = py(historial[i].mejor);
    if (i === 0) gtx.moveTo(x, y);
    else gtx.lineTo(x, y);
  }
  gtx.stroke();
}

// ————— HUD —————

function actualizarHUD() {
  if (!est) return;

  dom.iter.textContent = `${est.t}/${params.T}`;

  const a = ultima ? ultima.a : 2 * (1 - est.t / params.T);
  const L = ultima ? ultima.L : Math.abs(params.c / (a || 1));
  dom.a.textContent = a.toFixed(4);
  dom.l.textContent = L.toFixed(4);
  dom.gauge.style.transform = `scaleX(${clamp(a / 2, 0, 1)})`;

  dom.alfa.textContent = Number.isFinite(est.alfaCosto) ? recortar(est.alfaCosto, 4) : '—';

  if (ultima) {
    dom.evalR.textContent = ultima.R.toFixed(3);
    dom.evalH.textContent = String(ultima.H);
    dom.votos.textContent = `${ultima.votantes.length} / ${params.n - 1}`;
    const explora = ultima.modo === 'exploracion';
    dom.evalModo.textContent = explora ? 'Explora' : 'Explota';
    dom.evalModo.className = `veredicto ${explora ? 'veredicto-explora' : 'veredicto-explota'}`;
  }
}

// ————— Bucle principal —————

function cuadro(ahora) {
  const dt = Math.min((ahora - tPrevio) / 1000, 0.1);
  tPrevio = ahora;

  if (modo === 'ejecucion') {
    if (pausaRelevo > 0) {
      // Compás de relevo: la simulación queda detenida y solo corre la animación
      pausaRelevo = Math.max(0, pausaRelevo - dt);
    } else {
      faseIter += dt * VEL_BASE * MULTIPLICADORES[velIndice];
      let guardia = 0;
      while (faseIter >= 1 && modo === 'ejecucion' && guardia < 200) {
        faseIter -= 1;
        ejecutarIteracion();
        guardia += 1;
        if (pausaRelevo > 0) break; // deja que el relevo se vea antes de seguir
      }
      if (modo !== 'ejecucion') faseIter = 1;
    }
  }

  dibujar();
  dibujarGrafico();
  actualizarHUD();
  requestAnimationFrame(cuadro);
}

// ————— Controles —————

function actualizarProgresoSlider(input) {
  const min = Number(input.min);
  const max = Number(input.max);
  const pct = ((Number(input.value) - min) / (max - min)) * 100;
  input.style.setProperty('--range-progreso', `${pct}%`);
}

function fijarVariante(nueva) {
  literal = nueva;
  dom.variante.classList.toggle('activo', literal);
  dom.variante.title = literal
    ? 'Exploración literal del paper: el escalar se asigna al vector, los agentes caen sobre x₁ = x₂ (E)'
    : 'Exploración por componente, variante didáctica (E)';
}

function conectarControles() {
  const enlazar = (id, salida, formato, aplicar) => {
    const input = $(id);
    const out = $(salida);
    actualizarProgresoSlider(input);
    input.addEventListener('input', () => {
      const v = parseFloat(input.value);
      out.textContent = formato(v);
      actualizarProgresoSlider(input);
      aplicar(v);
    });
  };

  enlazar('in-n', 'out-n', (v) => String(v), (v) => { params.n = v; reiniciar(); });
  enlazar('in-t', 'out-t', (v) => String(v), (v) => { params.T = v; reiniciar(); });
  enlazar('in-c', 'out-c', (v) => v.toFixed(3), (v) => { params.c = v; });
  enlazar(
    'in-dif',
    'out-dif',
    (v) => DIFICULTADES[v].nombre,
    (v) => { params.dif = v; reiniciar({ nuevoPaisaje: true }); },
  );

  dom.play.addEventListener('click', alternar);
  dom.vel.addEventListener('click', cicloVelocidad);

  // Posición del cursor sobre la escena, para mostrar etiquetas al pasar
  escena.addEventListener('mousemove', (e) => {
    const caja = escena.getBoundingClientRect();
    raton = { x: e.clientX - caja.left, y: e.clientY - caja.top };
  });
  escena.addEventListener('mouseleave', () => { raton = null; });
  $('btn-reiniciar').addEventListener('click', () => reiniciar());
  $('btn-paisaje').addEventListener('click', () => reiniciar({ nuevoPaisaje: true }));
  dom.variante.addEventListener('click', () => { fijarVariante(!literal); reiniciar(); });

  // Panel de simbología: se cierra al hacer clic fuera, con Escape o el botón
  const btnInfo = $('btn-info');
  const simbolos = $('simbolos');
  const fijarSimbolos = (abierto) => {
    simbolos.classList.toggle('oculto', !abierto);
    btnInfo.setAttribute('aria-expanded', String(abierto));
  };
  btnInfo.addEventListener('click', (e) => {
    e.stopPropagation();
    fijarSimbolos(simbolos.classList.contains('oculto'));
  });
  document.addEventListener('click', (e) => {
    if (!simbolos.classList.contains('oculto') && !simbolos.contains(e.target)) {
      fijarSimbolos(false);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return;
    if (e.key === 'Escape') fijarSimbolos(false);
    if (e.code === 'Space') { e.preventDefault(); alternar(); }
    if (e.key === 'r' || e.key === 'R') reiniciar();
    if (e.key === 'n' || e.key === 'N') reiniciar({ nuevoPaisaje: true });
    if (e.key === 'v' || e.key === 'V') cicloVelocidad();
    if (e.key === 'e' || e.key === 'E') { fijarVariante(!literal); reiniciar(); }
  });
}

// ————— Arranque —————

fijarVariante(literal);
reiniciar();
conectarControles();
requestAnimationFrame((t) => { tPrevio = t; requestAnimationFrame(cuadro); });
