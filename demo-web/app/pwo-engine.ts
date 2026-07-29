export type Direction = "min" | "max";
export type Landscape = "sphere" | "peak" | "rugged";
export type SearchMode = "waiting" | "exploration" | "exploitation";

export type Point = {
  x: number;
  y: number;
};

export type Agent = Point & {
  id: number;
  value: number;
  effectiveValue: number;
  trail: Point[];
};

export type Alpha = Point & {
  value: number;
  effectiveValue: number;
  agentId: number;
};

export type Decision = {
  mode: SearchMode;
  iteration: number;
  rallyStrength: number;
  rallyThreshold: number;
  votes: number;
  a: number;
  alphaInfluence: number;
  explorationOne: number;
  explorationTwo: number;
};

export type SimulationState = {
  agents: Agent[];
  alpha: Alpha;
  decision: Decision;
  iteration: number;
  bestHistory: number[];
};

export type StepOptions = {
  direction: Direction;
  landscape: Landscape;
  maxIterations: number;
  random: () => number;
};

export const DOMAIN_MIN = -5;
export const DOMAIN_MAX = 5;
export const VOTE_INCREMENT = 0.04;

export function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let result = state;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function objective(
  x: number,
  y: number,
  landscape: Landscape,
): number {
  if (landscape === "peak") {
    return 16 - (x - 0.8) ** 2 - (y + 0.6) ** 2;
  }

  if (landscape === "rugged") {
    return (
      0.22 * (x ** 2 + y ** 2) +
      1.7 * Math.sin(2.1 * x) +
      1.45 * Math.cos(1.8 * y)
    );
  }

  return x ** 2 + y ** 2;
}

export function toEffectiveValue(
  value: number,
  direction: Direction,
): number {
  return direction === "min" ? value : -value;
}

function evaluatePoint(
  point: Point,
  agentId: number,
  direction: Direction,
  landscape: Landscape,
): Alpha {
  const value = objective(point.x, point.y, landscape);

  return {
    ...point,
    value,
    effectiveValue: toEffectiveValue(value, direction),
    agentId,
  };
}

function clamp(value: number): number {
  return Math.max(DOMAIN_MIN, Math.min(DOMAIN_MAX, value));
}

export function createSimulation(
  population: number,
  direction: Direction,
  landscape: Landscape,
  random: () => number,
): SimulationState {
  const agents = Array.from({ length: population }, (_, id) => {
    const x = DOMAIN_MIN + random() * (DOMAIN_MAX - DOMAIN_MIN);
    const y = DOMAIN_MIN + random() * (DOMAIN_MAX - DOMAIN_MIN);
    const value = objective(x, y, landscape);

    return {
      id,
      x,
      y,
      value,
      effectiveValue: toEffectiveValue(value, direction),
      trail: [{ x, y }],
    };
  });

  const alphaAgent = agents.reduce((best, agent) =>
    agent.effectiveValue < best.effectiveValue ? agent : best,
  );

  return {
    agents,
    alpha: {
      x: alphaAgent.x,
      y: alphaAgent.y,
      value: alphaAgent.value,
      effectiveValue: alphaAgent.effectiveValue,
      agentId: alphaAgent.id,
    },
    decision: {
      mode: "waiting",
      iteration: 0,
      rallyStrength: 0,
      rallyThreshold: 0,
      votes: 0,
      a: 2,
      alphaInfluence: VOTE_INCREMENT / 2,
      explorationOne: 0,
      explorationTwo: 0,
    },
    iteration: 0,
    bestHistory: [alphaAgent.value],
  };
}

export function stepSimulation(
  state: SimulationState,
  options: StepOptions,
): SimulationState {
  const { direction, landscape, maxIterations, random } = options;
  const snapshot = state.agents.map((agent) => ({ ...agent }));

  const currentBest = snapshot.reduce((best, agent) =>
    agent.effectiveValue < best.effectiveValue ? agent : best,
  );
  const currentAlpha = evaluatePoint(
    currentBest,
    currentBest.id,
    direction,
    landscape,
  );
  const alpha =
    currentAlpha.effectiveValue < state.alpha.effectiveValue
      ? currentAlpha
      : state.alpha;

  const progress = Math.min(state.iteration / maxIterations, 0.98);
  const a = Math.max(0.04, 2 * (1 - progress));
  const alphaInfluence = Math.abs(VOTE_INCREMENT / a);

  let votes = 0;
  for (const agent of snapshot) {
    if (agent.id === currentBest.id) {
      continue;
    }

    const comparison =
      agent.effectiveValue - alphaInfluence * alpha.effectiveValue;
    if (comparison <= alpha.effectiveValue) {
      votes += 1;
    }
  }

  const rallyStrength = votes * VOTE_INCREMENT;
  const e0 = 2 * random() - random();
  const rallyThreshold = Math.round(
    (a * e0) / alphaInfluence + random(),
  );
  const mode: SearchMode =
    rallyStrength < rallyThreshold ? "exploration" : "exploitation";

  const mean = snapshot.reduce(
    (accumulator, agent) => ({
      x: accumulator.x + agent.x / snapshot.length,
      y: accumulator.y + agent.y / snapshot.length,
    }),
    { x: 0, y: 0 },
  );

  let explorationOne = 0;
  let explorationTwo = 0;

  const movedAgents = snapshot.map((agent) => {
    let nextX = agent.x;
    let nextY = agent.y;

    if (mode === "exploration") {
      if (random() < 0.5) {
        explorationOne += 1;
        const randomAgent =
          snapshot[Math.floor(random() * snapshot.length)] ?? snapshot[0];
        const coordinates: Array<"x" | "y"> = ["x", "y"];

        for (const coordinate of coordinates) {
          const r1 = random();
          const r2 = random();
          const a1 = 2 * a * r1 - a;
          const velocity = 2 * alphaInfluence * r1 + r2;
          const distance = Math.abs(
            velocity * randomAgent[coordinate] - agent[coordinate],
          );
          const value = randomAgent[coordinate] - a1 * distance;

          if (coordinate === "x") {
            nextX = value;
          } else {
            nextY = value;
          }
        }
      } else {
        explorationTwo += 1;
        nextX =
          alpha.x -
          mean.x -
          rallyStrength * Math.abs(alpha.x - agent.x);
        nextY =
          alpha.y -
          mean.y -
          rallyStrength * Math.abs(alpha.y - agent.y);
      }
    } else {
      const coordinates: Array<"x" | "y"> = ["x", "y"];

      for (const coordinate of coordinates) {
        const r1 = random();
        const a1 = 2 * a * r1 - a;
        const a2 = rallyStrength + a * a1 * alphaInfluence;
        const distance = Math.abs(alpha[coordinate] - agent[coordinate]);
        const value = alpha[coordinate] - a2 * distance;

        if (coordinate === "x") {
          nextX = value;
        } else {
          nextY = value;
        }
      }
    }

    nextX = clamp(nextX);
    nextY = clamp(nextY);
    const value = objective(nextX, nextY, landscape);

    return {
      ...agent,
      x: nextX,
      y: nextY,
      value,
      effectiveValue: toEffectiveValue(value, direction),
      trail: [...agent.trail, { x: nextX, y: nextY }].slice(-14),
    };
  });

  const movedBest = movedAgents.reduce((best, agent) =>
    agent.effectiveValue < best.effectiveValue ? agent : best,
  );
  const movedAlpha = evaluatePoint(
    movedBest,
    movedBest.id,
    direction,
    landscape,
  );
  const nextAlpha =
    movedAlpha.effectiveValue < alpha.effectiveValue ? movedAlpha : alpha;

  return {
    agents: movedAgents,
    alpha: nextAlpha,
    decision: {
      mode,
      iteration: state.iteration + 1,
      rallyStrength,
      rallyThreshold,
      votes,
      a,
      alphaInfluence,
      explorationOne,
      explorationTwo,
    },
    iteration: state.iteration + 1,
    bestHistory: [...state.bestHistory, nextAlpha.value],
  };
}

export function landscapeLabel(landscape: Landscape): string {
  if (landscape === "peak") {
    return "Colina desplazada";
  }

  if (landscape === "rugged") {
    return "Terreno con trampas";
  }

  return "Valle Sphere";
}
