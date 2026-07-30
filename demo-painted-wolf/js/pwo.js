/**
 * Núcleo del algoritmo Painted Wolf Optimization (PWO).
 * Independiente del dibujo: ejecuta UNA iteración del bucle principal.
 *
 * Sigue la numeración de ecuaciones del informe de avance del proyecto,
 * que a su vez sigue el código oficial en Python (Alpha_score histórico,
 * convención de minimización, c = VOTE_INCREMENT = 0.04).
 *
 *   ec. 3   alfa = argmin F_i, conservado a lo largo de la corrida
 *   ec. 4   a(t) = 2 (1 − t/T)                    parámetro de control
 *   ec. 5   L(t) = |c / a(t)|                     influencia del alfa
 *   ec. 6   vota i si  F_i − L·F_alfa ≤ F_alfa
 *   ec. 7   R(t) = c · (número de votos)          fuerza del rally
 *   ec. 8   H(t) = round( a(t)(2r₃ − r₄)/L(t) + r₄ )   umbral estocástico
 *   ec. 9   R < H → exploración ;  R ≥ H → explotación
 *   ec. 10-11  exploración 1: seguir a un agente aleatorio
 *   ec. 12-13  exploración 2: alfa menos la media poblacional
 *   ec. 14-17  explotación: converger hacia el alfa
 *
 * La decisión del rally es GLOBAL para la iteración: el rally no mueve a los
 * lobos, decide qué ecuación los moverá.
 */

export const VOTO = 0.04; // c, VOTE_INCREMENT del código oficial

/** Manada inicial: N posiciones uniformes dentro del dominio (ec. 1) */
export function crearManada(n, dim, lb, ub, rng = Math.random) {
  const posiciones = [];
  for (let i = 0; i < n; i += 1) {
    const x = new Array(dim);
    for (let j = 0; j < dim; j += 1) x[j] = lb + rng() * (ub - lb);
    posiciones.push(x);
  }
  return {
    posiciones,
    costos: new Array(n).fill(Infinity),
    alfaPos: posiciones[0].slice(),
    alfaCosto: Infinity,
    alfaIndice: 0,
    t: 0,
  };
}

function media(posiciones, dim) {
  const m = new Array(dim).fill(0);
  for (const p of posiciones) for (let j = 0; j < dim; j += 1) m[j] += p[j];
  for (let j = 0; j < dim; j += 1) m[j] /= posiciones.length;
  return m;
}

/**
 * Una iteración completa: evaluar, votar, decidir y mover.
 *
 * @param est      estado devuelto por crearManada, se modifica en el sitio
 * @param f        función objetivo, recibe el vector de posición
 * @param opciones { T, c, lb, ub, rng, literal }
 *
 * `literal = true` reproduce el código oficial, donde las dos ramas de
 * exploración asignan un valor al vector completo dentro del ciclo de
 * dimensiones (la ecuación 11 es explícitamente escalar a vector).
 * `literal = false` usa la variante didáctica por componente, que separa
 * mejor el efecto de cada dimensión. La diferencia está documentada en el
 * informe y debe declararse al reproducir resultados.
 */
export function iterarPWO(est, f, opciones) {
  const { T, c = VOTO, lb, ub, rng = Math.random, literal = true } = opciones;
  const N = est.posiciones.length;
  const dim = est.posiciones[0].length;

  // ————— Evaluación, saturación y alfa histórico (ec. 2, 3, 18) —————
  for (let i = 0; i < N; i += 1) {
    const x = est.posiciones[i];
    for (let j = 0; j < dim; j += 1) x[j] = Math.min(ub, Math.max(lb, x[j]));
    const fit = f(x);
    est.costos[i] = fit;
    if (fit < est.alfaCosto) {
      est.alfaCosto = fit;
      est.alfaPos = x.slice();
      est.alfaIndice = i;
    }
  }

  // ————— Parámetro de control e influencia del alfa (ec. 4, 5) —————
  const a = 2 * (1 - est.t / T);
  const L = a !== 0 ? Math.abs(c / a) : 0;

  // ————— Votación y fuerza del rally (ec. 6, 7) —————
  const votantes = [];
  let R = 0;
  for (let i = 0; i < N; i += 1) {
    if (i === est.alfaIndice) continue;
    if (est.costos[i] - L * est.alfaCosto <= est.alfaCosto) {
      R += c;
      votantes.push(i);
    }
  }

  // ————— Umbral estocástico (ec. 8) —————
  const r3 = rng();
  const r4 = rng();
  const E0 = 2 * r3 - r4;
  const H = L !== 0 ? Math.round((a * E0) / L + rng()) : 0;

  // ————— Decisión global de la iteración (ec. 9) —————
  const modo = R < H ? 'exploracion' : 'explotacion';

  // ————— Movimiento —————
  const previas = est.posiciones.map((p) => p.slice());

  for (let i = 0; i < N; i += 1) {
    for (let j = 0; j < dim; j += 1) {
      const r1 = rng();
      const r2 = rng();
      const A1 = 2 * a * r1 - a; // ec. 15

      if (modo === 'exploracion') {
        const q = rng();
        if (q < 0.5) {
          // Exploración 1: seguir a un agente aleatorio (ec. 10, 11)
          const xr = est.posiciones[Math.floor(rng() * N)].slice();
          const vel = 2 * L * r1 + r2;
          const D = Math.abs(vel * xr[j] - est.posiciones[i][j]);
          const nuevo = xr[j] - A1 * D;
          if (literal) est.posiciones[i].fill(nuevo); // escalar asignado al vector
          else est.posiciones[i][j] = nuevo;
        } else {
          // Exploración 2: alfa menos la media poblacional (ec. 12, 13)
          const m = media(est.posiciones, dim);
          if (literal) {
            for (let k = 0; k < dim; k += 1) {
              est.posiciones[i][k] =
                est.alfaPos[k] - m[k] - R * Math.abs(est.alfaPos[k] - est.posiciones[i][k]);
            }
          } else {
            est.posiciones[i][j] =
              est.alfaPos[j] - m[j] - R * Math.abs(est.alfaPos[j] - est.posiciones[i][j]);
          }
        }
      } else {
        // Explotación: converger hacia el alfa (ec. 14, 16, 17)
        const D = Math.abs(est.alfaPos[j] - est.posiciones[i][j]);
        const A2 = R + a * A1 * L;
        est.posiciones[i][j] = est.alfaPos[j] - A2 * D;
      }
    }
  }

  est.t += 1;

  return { a, L, R, H, modo, votantes, previas, r3, r4 };
}
