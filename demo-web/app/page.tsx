"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createRandom,
  createSimulation,
  Direction,
  DOMAIN_MAX,
  DOMAIN_MIN,
  Landscape,
  landscapeLabel,
  objective,
  SimulationState,
  stepSimulation,
} from "./pwo-engine";
import {
  colorForValue,
  hexToRgb,
  TERRAIN_PALETTE as PALETTE,
} from "./terrain-palette";

type Metaphor = "wolves" | "balls";

const MAX_ITERATIONS = 120;
const INITIAL_SEED = 20260728;
const INITIAL_POPULATION = 11;
const SPEEDS = [
  { label: "1×", delay: 850 },
  { label: "5×", delay: 220 },
  { label: "20×", delay: 70 },
  { label: "100×", delay: 18 },
];

const COLORS = {
  ink: "#f2ead9",
  muted: "#b8ac97",
  alpha: "#f28a52",
  alphaDark: "#6d321f",
  explore: "#8fc5b2",
  exploit: "#e9b56d",
  trail: "rgba(242, 234, 217, 0.38)",
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function mapX(x: number, width: number): number {
  return ((x - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * width;
}

function mapY(y: number, height: number): number {
  return height - ((y - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN)) * height;
}

function formatValue(value: number): string {
  if (
    Math.abs(value) >= 1000 ||
    (Math.abs(value) > 0 && Math.abs(value) < 0.001)
  ) {
    return value.toExponential(3);
  }

  return value.toFixed(4);
}

function drawBall(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  isCurrentLeader: boolean,
) {
  context.save();
  context.translate(x, y);
  context.shadowColor = "rgba(8, 18, 16, 0.6)";
  context.shadowBlur = 9;
  context.beginPath();
  context.arc(0, 0, isCurrentLeader ? 9 : 6.5, 0, Math.PI * 2);
  context.fillStyle = isCurrentLeader ? COLORS.alpha : COLORS.ink;
  context.fill();
  context.lineWidth = isCurrentLeader ? 2.5 : 1.25;
  context.strokeStyle = isCurrentLeader ? COLORS.alphaDark : "#17332d";
  context.stroke();
  context.restore();
}

function drawWolf(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  isCurrentLeader: boolean,
) {
  context.save();
  context.translate(x, y);
  context.scale(isCurrentLeader ? 1.08 : 0.82, isCurrentLeader ? 1.08 : 0.82);
  context.shadowColor = "rgba(8, 18, 16, 0.65)";
  context.shadowBlur = 8;

  context.beginPath();
  context.moveTo(-8, -4);
  context.lineTo(-10, -13);
  context.lineTo(-2, -8);
  context.quadraticCurveTo(0, -11, 2, -8);
  context.lineTo(10, -13);
  context.lineTo(8, -4);
  context.quadraticCurveTo(8, 5, 0, 9);
  context.quadraticCurveTo(-8, 5, -8, -4);
  context.closePath();
  context.fillStyle = isCurrentLeader ? COLORS.alpha : COLORS.ink;
  context.fill();
  context.lineWidth = isCurrentLeader ? 2.4 : 1.35;
  context.strokeStyle = isCurrentLeader ? COLORS.alphaDark : "#17332d";
  context.stroke();

  context.shadowBlur = 0;
  context.beginPath();
  context.arc(-3, -2, 1.05, 0, Math.PI * 2);
  context.arc(3, -2, 1.05, 0, Math.PI * 2);
  context.fillStyle = "#17332d";
  context.fill();
  context.restore();
}

function drawArrow(
  context: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
) {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const distance = Math.hypot(toX - fromX, toY - fromY);
  if (distance < 5) {
    return;
  }

  context.save();
  context.strokeStyle = color;
  context.fillStyle = color;
  context.lineWidth = 1.35;
  context.beginPath();
  context.moveTo(fromX, fromY);
  context.lineTo(toX, toY);
  context.stroke();
  context.translate(toX, toY);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(-7, -3.5);
  context.lineTo(-7, 3.5);
  context.closePath();
  context.fill();
  context.restore();
}

function drawAlphaMarker(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  value: number,
  canvasWidth: number,
) {
  context.save();
  context.beginPath();
  context.arc(x, y, 22, 0, Math.PI * 2);
  context.strokeStyle = COLORS.alpha;
  context.lineWidth = 2;
  context.setLineDash([5, 5]);
  context.stroke();
  context.setLineDash([]);

  const label = `α*  ${formatValue(value)}`;
  context.font =
    '600 12px "Avenir Next", Avenir, "Trebuchet MS", sans-serif';
  const labelWidth = context.measureText(label).width + 20;
  const labelX = clamp(x - labelWidth / 2, 10, canvasWidth - labelWidth - 10);
  const labelY = y < 58 ? y + 30 : y - 43;

  context.fillStyle = "rgba(14, 28, 25, 0.86)";
  context.beginPath();
  context.roundRect(labelX, labelY, labelWidth, 27, 7);
  context.fill();
  context.strokeStyle = "rgba(242, 138, 82, 0.6)";
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = COLORS.ink;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(label, labelX + labelWidth / 2, labelY + 14);
  context.restore();
}

function comparisonSymbol(simulation: SimulationState): string {
  if (simulation.decision.mode === "waiting") {
    return "—";
  }
  return simulation.decision.mode === "exploration" ? "<" : "≥";
}

function PlayIcon({ paused }: { paused: boolean }) {
  return paused ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  );
}

function StepIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 5h3v14H6V5zm5 1 8 6-8 6V6z" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 3h5v5l-1.8-1.8-3.6 3.6-1.4-1.4 3.6-3.6L16 3zm-12 3h3.5c1.3 0 2.5.6 3.2 1.6l5.1 6.8c.4.5 1 .8 1.6.8h.4L16 12.4l1.4-1.4L21 14.6V10h2v7h-5l1.6-1.6h-2.2c-1.3 0-2.5-.6-3.2-1.6L9.1 7c-.4-.5-1-.8-1.6-.8H4V6zm0 10h3.5c.6 0 1.2-.3 1.6-.8l1.2-1.6 1.3 1.8-.9 1.2c-.7 1-1.9 1.6-3.2 1.6H4V16z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyCanvasRef = useRef<HTMLCanvasElement>(null);
  const [direction, setDirection] = useState<Direction>("min");
  const [landscape, setLandscape] = useState<Landscape>("sphere");
  const [metaphor, setMetaphor] = useState<Metaphor>("wolves");
  const [population, setPopulation] = useState(INITIAL_POPULATION);
  const [seed, setSeed] = useState(INITIAL_SEED);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [simulationBundle, setSimulationBundle] = useState(() => {
    const random = createRandom(INITIAL_SEED);
    return {
      random,
      simulation: createSimulation(
        INITIAL_POPULATION,
        "min",
        "sphere",
        random,
      ),
    };
  });
  const simulation = simulationBundle.simulation;
  const isPlaying =
    running && simulation.iteration < MAX_ITERATIONS;

  const resetSimulation = useCallback(
    (overrides?: {
      direction?: Direction;
      landscape?: Landscape;
      population?: number;
      seed?: number;
    }) => {
      setRunning(false);
      const nextDirection = overrides?.direction ?? direction;
      const nextLandscape = overrides?.landscape ?? landscape;
      const nextPopulation = overrides?.population ?? population;
      const nextSeed = overrides?.seed ?? seed;
      const random = createRandom(nextSeed);
      setSimulationBundle({
        random,
        simulation: createSimulation(
          nextPopulation,
          nextDirection,
          nextLandscape,
          random,
        ),
      });
    },
    [direction, landscape, population, seed],
  );

  const advanceSimulation = useCallback(() => {
    setSimulationBundle((current) => {
      if (current.simulation.iteration >= MAX_ITERATIONS) {
        return current;
      }

      return {
        random: current.random,
        simulation: stepSimulation(current.simulation, {
          direction,
          landscape,
          maxIterations: MAX_ITERATIONS,
          random: current.random,
        }),
      };
    });
  }, [direction, landscape]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const activeSpeed = SPEEDS[speedIndex] ?? SPEEDS[0];
    const interval = window.setInterval(
      advanceSimulation,
      activeSpeed.delay,
    );
    return () => window.clearInterval(interval);
  }, [advanceSimulation, isPlaying, speedIndex]);

  const currentLeaderId = useMemo(
    () =>
      simulation.agents.reduce((best, agent) =>
        agent.effectiveValue < best.effectiveValue ? agent : best,
      ).id,
    [simulation.agents],
  );

  const modeCopy = useMemo(() => {
    if (simulation.decision.mode === "exploration") {
      return {
        label: "Exploración",
        description: "R < H · la manada abre la búsqueda",
      };
    }
    if (simulation.decision.mode === "exploitation") {
      return {
        label: "Explotación",
        description: "R ≥ H · la manada se concentra en α",
      };
    }
    return {
      label: "Lista",
      description: "Avanza para calcular el primer rally",
    };
  }, [simulation.decision.mode]);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(320, Math.round(bounds.width));
    const height = Math.max(320, Math.round(bounds.height));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const surface = document.createElement("canvas");
    const surfaceWidth = 112;
    const surfaceHeight = 78;
    surface.width = surfaceWidth;
    surface.height = surfaceHeight;
    const surfaceContext = surface.getContext("2d");

    if (surfaceContext) {
      const sampledValues = new Float64Array(surfaceWidth * surfaceHeight);
      let minimum = Number.POSITIVE_INFINITY;
      let maximum = Number.NEGATIVE_INFINITY;

      for (let row = 0; row < surfaceHeight; row += 1) {
        for (let column = 0; column < surfaceWidth; column += 1) {
          const x =
            DOMAIN_MIN +
            (column / (surfaceWidth - 1)) * (DOMAIN_MAX - DOMAIN_MIN);
          const y =
            DOMAIN_MAX -
            (row / (surfaceHeight - 1)) * (DOMAIN_MAX - DOMAIN_MIN);
          const value = objective(x, y, landscape);
          const index = row * surfaceWidth + column;
          sampledValues[index] = value;
          minimum = Math.min(minimum, value);
          maximum = Math.max(maximum, value);
        }
      }

      const image = surfaceContext.createImageData(surfaceWidth, surfaceHeight);
      const span = Math.max(maximum - minimum, 0.0001);
      for (let index = 0; index < sampledValues.length; index += 1) {
        const normalized = (sampledValues[index] - minimum) / span;
        const [red, green, blue] = hexToRgb(colorForValue(normalized));
        const offset = index * 4;
        image.data[offset] = red;
        image.data[offset + 1] = green;
        image.data[offset + 2] = blue;
        image.data[offset + 3] = 255;
      }
      surfaceContext.putImageData(image, 0, 0);
      context.imageSmoothingEnabled = true;
      context.drawImage(surface, 0, 0, width, height);
    }

    const vignette = context.createRadialGradient(
      width * 0.5,
      height * 0.48,
      Math.min(width, height) * 0.18,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.78,
    );
    vignette.addColorStop(0, "rgba(8, 22, 19, 0)");
    vignette.addColorStop(1, "rgba(6, 16, 14, 0.46)");
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);

    context.save();
    context.strokeStyle = "rgba(242, 234, 217, 0.12)";
    context.lineWidth = 1;
    for (let index = 1; index < 10; index += 1) {
      const x = (index / 10) * width;
      const y = (index / 10) * height;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();

    if (simulation.decision.mode === "exploitation") {
      const alphaX = mapX(simulation.alpha.x, width);
      const alphaY = mapY(simulation.alpha.y, height);
      context.save();
      context.setLineDash([3, 7]);
      context.strokeStyle = "rgba(233, 181, 109, 0.2)";
      context.lineWidth = 1;
      for (const agent of simulation.agents) {
        context.beginPath();
        context.moveTo(mapX(agent.x, width), mapY(agent.y, height));
        context.lineTo(alphaX, alphaY);
        context.stroke();
      }
      context.restore();
    }

    const movementColor =
      simulation.decision.mode === "exploration"
        ? "rgba(143, 197, 178, 0.78)"
        : simulation.decision.mode === "exploitation"
          ? "rgba(233, 181, 109, 0.8)"
          : COLORS.trail;

    for (const agent of simulation.agents) {
      context.beginPath();
      agent.trail.forEach((point, index) => {
        const x = mapX(point.x, width);
        const y = mapY(point.y, height);
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      context.strokeStyle =
        agent.id === currentLeaderId
          ? "rgba(242, 138, 82, 0.7)"
          : "rgba(242, 234, 217, 0.28)";
      context.lineWidth = agent.id === currentLeaderId ? 2.2 : 1.15;
      context.stroke();

      if (agent.trail.length > 1) {
        const previous = agent.trail.at(-2);
        if (previous) {
          drawArrow(
            context,
            mapX(previous.x, width),
            mapY(previous.y, height),
            mapX(agent.x, width),
            mapY(agent.y, height),
            movementColor,
          );
        }
      }
    }

    drawAlphaMarker(
      context,
      mapX(simulation.alpha.x, width),
      mapY(simulation.alpha.y, height),
      simulation.alpha.value,
      width,
    );

    for (const agent of simulation.agents) {
      const x = mapX(agent.x, width);
      const y = mapY(agent.y, height);
      const isCurrentLeader = agent.id === currentLeaderId;
      if (metaphor === "wolves") {
        drawWolf(context, x, y, isCurrentLeader);
      } else {
        drawBall(context, x, y, isCurrentLeader);
      }
    }

    context.save();
    const legendWidth = 176;
    const legendX = width - legendWidth - 24;
    const legendY = height - 58;
    context.fillStyle = "rgba(12, 27, 24, 0.76)";
    context.beginPath();
    context.roundRect(legendX, legendY, legendWidth, 36, 8);
    context.fill();
    const gradient = context.createLinearGradient(
      legendX + 45,
      0,
      legendX + 130,
      0,
    );
    gradient.addColorStop(0, PALETTE[0]);
    gradient.addColorStop(1, PALETTE.at(-1) ?? PALETTE[0]);
    context.fillStyle = gradient;
    context.fillRect(legendX + 45, legendY + 14, 85, 8);
    context.font =
      '500 10px "Avenir Next", Avenir, "Trebuchet MS", sans-serif';
    context.fillStyle = COLORS.muted;
    context.textBaseline = "middle";
    context.fillText("bajo", legendX + 10, legendY + 18);
    context.fillText("alto", legendX + 139, legendY + 18);
    context.restore();
  }, [currentLeaderId, landscape, metaphor, simulation]);

  useEffect(() => {
    drawScene();
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const resizeObserver = new ResizeObserver(drawScene);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [drawScene]);

  const drawHistory = useCallback(() => {
    const canvas = historyCanvasRef.current;
    if (!canvas) {
      return;
    }
    const bounds = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(220, Math.round(bounds.width));
    const height = Math.max(54, Math.round(bounds.height));
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    const values = simulation.bestHistory;
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const span = Math.max(maximum - minimum, 0.0001);
    context.strokeStyle = "rgba(242, 234, 217, 0.12)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, height - 5);
    context.lineTo(width, height - 5);
    context.stroke();

    context.beginPath();
    values.forEach((value, index) => {
      const x = 4 + (index / Math.max(values.length - 1, 1)) * (width - 8);
      const normalized =
        direction === "min"
          ? (value - minimum) / span
          : (maximum - value) / span;
      const y = 5 + normalized * (height - 12);
      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    });
    context.strokeStyle = COLORS.alpha;
    context.lineWidth = 2.25;
    context.stroke();
  }, [direction, simulation.bestHistory]);

  useEffect(() => {
    drawHistory();
    const canvas = historyCanvasRef.current;
    if (!canvas) {
      return;
    }
    const resizeObserver = new ResizeObserver(drawHistory);
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [drawHistory]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement ||
        event.target instanceof HTMLButtonElement
      ) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        if (simulation.iteration >= MAX_ITERATIONS) {
          resetSimulation();
          setRunning(true);
        } else {
          setRunning((current) => !current);
        }
      }
      if (event.key === "r" || event.key === "R") {
        resetSimulation();
      }
      if (event.key === "v" || event.key === "V") {
        setSpeedIndex((current) => (current + 1) % SPEEDS.length);
      }
      if (event.key === "i" || event.key === "I") {
        setInfoOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [resetSimulation, simulation.iteration]);

  const newPack = () => {
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    resetSimulation({ seed: nextSeed });
  };

  const activeSpeed = SPEEDS[speedIndex] ?? SPEEDS[0];
  const mode = simulation.decision.mode;
  const alphaGoal = direction === "min" ? "menor" : "mayor";

  return (
    <main className={`lab-shell mode-${mode}`}>
      <canvas
        ref={canvasRef}
        className="scene-canvas"
        aria-label={`Simulación de Painted Wolf Optimization con ${population} ${metaphor === "wolves" ? "lobos" : "pelotas"}. El alfa histórico vale ${formatValue(simulation.alpha.value)}.`}
      >
        La simulación representa soluciones candidatas moviéndose sobre una
        función objetivo de dos variables.
      </canvas>

      <header className="title-chip">
        <span className="title-mark" aria-hidden="true">
          PW
        </span>
        <div>
          <h1>Painted Wolf Optimization</h1>
          <p>MII902 · laboratorio visual</p>
        </div>
      </header>

      <section className="status-panel" aria-live="polite">
        <div className="status-heading">
          <div>
            <span className="eyebrow">Iteración</span>
            <strong className="iteration">
              {simulation.iteration}
              <small>/{MAX_ITERATIONS}</small>
            </strong>
          </div>
          <div className={`mode-chip mode-chip-${mode}`}>
            <span className="mode-dot" />
            {modeCopy.label}
          </div>
        </div>

        <p className="mode-description">{modeCopy.description}</p>

        <div className="rally-equation" aria-label="Comparación entre R y H">
          <div>
            <span>
              Rally <b>R</b>
            </span>
            <strong>{simulation.decision.rallyStrength.toFixed(2)}</strong>
            <small>{simulation.decision.votes} votos × 0.04</small>
          </div>
          <b className="comparison-sign">{comparisonSymbol(simulation)}</b>
          <div>
            <span>
              Umbral <b>H</b>
            </span>
            <strong>{simulation.decision.rallyThreshold}</strong>
            <small>sorteo de la iteración</small>
          </div>
        </div>

        <div className="movement-readout">
          <span>Regla aplicada</span>
          {mode === "exploration" ? (
            <strong>
              E1: {simulation.decision.explorationOne} · E2:{" "}
              {simulation.decision.explorationTwo}
            </strong>
          ) : mode === "exploitation" ? (
            <strong>Aproximación al alfa</strong>
          ) : (
            <strong>Esperando el rally</strong>
          )}
        </div>

        <dl className="micro-stats">
          <div>
            <dt>a(t)</dt>
            <dd>{simulation.decision.a.toFixed(3)}</dd>
          </div>
          <div>
            <dt>L(t)</dt>
            <dd>{simulation.decision.alphaInfluence.toFixed(3)}</dd>
          </div>
          <div>
            <dt>Población</dt>
            <dd>{population}</dd>
          </div>
        </dl>
      </section>

      <section className="history-panel" aria-label="Mejor solución encontrada">
        <div className="history-heading">
          <div>
            <span className="eyebrow">Alfa histórico α*</span>
            <strong>{formatValue(simulation.alpha.value)}</strong>
          </div>
          <span className="history-direction">
            buscando el {alphaGoal}
          </span>
        </div>
        <canvas
          ref={historyCanvasRef}
          aria-label="Evolución del mejor valor observado"
        />
        <div className="alpha-position">
          <span>posición</span>
          <strong>
            ({simulation.alpha.x.toFixed(2)}, {simulation.alpha.y.toFixed(2)})
          </strong>
        </div>
      </section>

      <nav className="transport" aria-label="Controles de la simulación">
        <button
          className="round-button play-button"
          type="button"
          onClick={() => {
            if (simulation.iteration >= MAX_ITERATIONS) {
              resetSimulation();
              setRunning(true);
            } else {
              setRunning((current) => !current);
            }
          }}
          aria-label={isPlaying ? "Pausar simulación" : "Iniciar simulación"}
          title="Iniciar o pausar (espacio)"
        >
          <PlayIcon paused={!isPlaying} />
        </button>

        <button
          className="speed-button"
          type="button"
          onClick={() =>
            setSpeedIndex((current) => (current + 1) % SPEEDS.length)
          }
          aria-label={`Velocidad ${activeSpeed.label}. Cambiar velocidad`}
          title="Cambiar velocidad (V)"
        >
          {activeSpeed.label}
        </button>

        <button
          className="round-button"
          type="button"
          onClick={advanceSimulation}
          disabled={isPlaying || simulation.iteration >= MAX_ITERATIONS}
          aria-label="Avanzar una iteración"
          title="Avanzar una iteración"
        >
          <StepIcon />
        </button>

        <button
          className="round-button secondary-button"
          type="button"
          onClick={() => resetSimulation()}
          aria-label="Reiniciar la misma manada"
          title="Reiniciar la misma manada (R)"
        >
          <ResetIcon />
        </button>

        <span className="transport-divider" aria-hidden="true" />

        <button
          className="round-button secondary-button"
          type="button"
          onClick={newPack}
          aria-label="Crear una nueva manada"
          title="Nueva manada"
        >
          <ShuffleIcon />
        </button>

        <button
          className="round-button secondary-button"
          type="button"
          onClick={() => setInfoOpen((current) => !current)}
          aria-expanded={infoOpen}
          aria-controls="concept-guide"
          aria-label="Abrir guía de lectura"
          title="Guía de lectura (I)"
        >
          <InfoIcon />
        </button>
      </nav>

      <section className="parameter-panel" aria-label="Parámetros de la demo">
        <fieldset className="parameter-control">
          <legend>Representación</legend>
          <div className="segmented">
            <button
              type="button"
              className={metaphor === "wolves" ? "is-active" : ""}
              aria-pressed={metaphor === "wolves"}
              onClick={() => setMetaphor("wolves")}
            >
              Lobos
            </button>
            <button
              type="button"
              className={metaphor === "balls" ? "is-active" : ""}
              aria-pressed={metaphor === "balls"}
              onClick={() => setMetaphor("balls")}
            >
              Pelotas
            </button>
          </div>
        </fieldset>

        <fieldset className="parameter-control">
          <legend>Objetivo</legend>
          <div className="segmented">
            <button
              type="button"
              className={direction === "min" ? "is-active" : ""}
              aria-pressed={direction === "min"}
              onClick={() => {
                setDirection("min");
                resetSimulation({ direction: "min" });
              }}
            >
              Minimizar
            </button>
            <button
              type="button"
              className={direction === "max" ? "is-active" : ""}
              aria-pressed={direction === "max"}
              onClick={() => {
                setDirection("max");
                resetSimulation({ direction: "max" });
              }}
            >
              Maximizar
            </button>
          </div>
        </fieldset>

        <label className="parameter-control select-control">
          <span>Paisaje</span>
          <select
            value={landscape}
            onChange={(event) => {
              const nextLandscape = event.target.value as Landscape;
              setLandscape(nextLandscape);
              resetSimulation({ landscape: nextLandscape });
            }}
          >
            <option value="sphere">Valle Sphere</option>
            <option value="peak">Colina desplazada</option>
            <option value="rugged">Terreno con trampas</option>
          </select>
        </label>

        <label className="parameter-control population-control">
          <span>
            Agentes
            <output>{population}</output>
          </span>
          <input
            type="range"
            min="5"
            max="24"
            value={population}
            onChange={(event) => {
              const nextPopulation = Number(event.target.value);
              setPopulation(nextPopulation);
              resetSimulation({ population: nextPopulation });
            }}
          />
        </label>
      </section>

      <aside
        className={`concept-guide ${infoOpen ? "is-open" : ""}`}
        id="concept-guide"
        aria-label="Guía de lectura de la simulación"
      >
        <div className="guide-heading">
          <div>
            <span className="eyebrow">Cómo leer la escena</span>
            <h2>Del relato a la ecuación</h2>
          </div>
          <button
            type="button"
            onClick={() => setInfoOpen(false)}
            aria-label="Cerrar guía de lectura"
          >
            Cerrar
          </button>
        </div>

        <dl className="symbol-list">
          <div>
            <dt>Lobo / pelota</dt>
            <dd>Una solución candidata Xᵢ(t).</dd>
          </div>
          <div>
            <dt>Posición</dt>
            <dd>Los valores reales de sus variables de decisión.</dd>
          </div>
          <div>
            <dt>α*</dt>
            <dd>La mejor posición observada durante toda la corrida.</dd>
          </div>
          <div>
            <dt>Flecha</dt>
            <dd>La asignación Xᵢ(t) → Xᵢ(t+1).</dd>
          </div>
        </dl>

        <div className="guide-callout">
          <strong>R y H no son una distancia.</strong>
          <p>
            El rally compara R con H para elegir qué familia de ecuaciones
            moverá a la población. La distancia resultante también depende de
            α*, a(t), L(t) y los sorteos aleatorios.
          </p>
        </div>

        <div className="guide-comparison">
          <span>Recocido simulado</span>
          <p>Una pelota decide si acepta un vecino.</p>
          <span>PWO</span>
          <p>Varias soluciones deciden qué regla de movimiento usarán.</p>
        </div>

        <p className="guide-footnote">
          Para maximizar se conserva la lógica de minimización sobre
          g(x)=−f(x). La escena informa nuevamente f(x).
        </p>
      </aside>

      <div className="scene-caption" aria-hidden="true">
        <span>{landscapeLabel(landscape)}</span>
        <b>f(x₁, x₂)</b>
      </div>

      <p className="credit">
        Demo didáctica · Maverick Gayoso · PWO 2026
      </p>
    </main>
  );
}
