import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

import { buildSlide05 } from "../../.tmp/presentation/layouts/slide-05.mjs";
import { buildSlide06 } from "../../.tmp/presentation/layouts/slide-06.mjs";
import { buildSlide14 } from "../../.tmp/presentation/layouts/slide-14.mjs";
import { buildSlide17 } from "../../.tmp/presentation/layouts/slide-17.mjs";
import { buildSlide21 } from "../../.tmp/presentation/layouts/slide-21.mjs";
import { buildSlide26 } from "../../.tmp/presentation/layouts/slide-26.mjs";

const OUT_DIR = new URL("../../.tmp/presentation/rendered/", import.meta.url);
const FINAL_PPTX = new URL(
  "../../.tmp/presentation/PWO_Presentacion_Avance_Borrador.pptx",
  import.meta.url,
);

const BG = "#FBF8F2";
const INK = "#17324D";
const MUTED = "#526779";
const TEAL = "#087E8B";
const ORANGE = "#E4572E";
const AMBER = "#F2A541";
const PALE_TEAL = "#DFF1F0";
const PALE_ORANGE = "#FCE8DF";
const GRID = "#D8DED9";
const WHITE = "#FFFFFF";

function paragraph(text, size = 21, color = INK, bold = false) {
  return {
    runs: [
      {
        run: text,
        textStyle: {
          fontSize: `${size}px`,
          typeface: "Aptos",
          color,
          bold,
        },
      },
    ],
    paragraphStyle: { lineSpacingPercent: 108000 },
    spaceAfter: 450,
  };
}

function body(title, text) {
  return {
    titleHere: paragraph(title, 27, TEAL, true),
    loremIpsumDolorSitAmetConsecteturAdipiscing: paragraph(text, 20, INK),
  };
}

function addTextBox(slide, {
  name,
  text,
  left,
  top,
  width,
  height,
  fontSize = 18,
  color = INK,
  bold = false,
  fill = "none",
  align = "left",
}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    name,
    position: { left, top, width, height },
    fill,
    line: { style: "solid", fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    fontSize,
    typeface: "Aptos",
    color,
    bold,
    alignment: align,
  };
  return box;
}

function addDecoration(slide, slideNumber, section = "PWO · AVANCE") {
  slide.background.fill = BG;
  slide.shapes.add({
    geometry: "rect",
    name: `accent-${slideNumber}`,
    position: { left: 0, top: 0, width: 12, height: 720 },
    fill: slideNumber % 2 === 0 ? TEAL : ORANGE,
    line: { style: "solid", fill: "none", width: 0 },
  });
  addTextBox(slide, {
    name: `section-${slideNumber}`,
    text: section,
    left: 41,
    top: 668,
    width: 240,
    height: 22,
    fontSize: 12,
    color: MUTED,
    bold: true,
  });
}

function addNotes(slide, narration, sources) {
  slide.speakerNotes.textFrame.setText(
    `${narration}\n\n[Sources]\n${sources.map((source) => `- ${source}`).join("\n")}`,
  );
  slide.speakerNotes.setVisible(true);
}

function titleToken(text) {
  return paragraph(text, 39, INK, true);
}

function addTable(slide, {
  name,
  values,
  left,
  top,
  width,
  height,
  coverHeight = height,
  coverLeft = left - 2,
  coverTop = top - 2,
  coverWidth = width + 4,
  columnWidths,
  fontSize = 17,
  highlightLastRow = false,
}) {
  slide.shapes.add({
    geometry: "rect",
    name: `${name}-cover`,
    position: {
      left: coverLeft,
      top: coverTop,
      width: coverWidth,
      height: coverHeight + 4,
    },
    fill: BG,
    line: { style: "solid", fill: BG, width: 0 },
  });

  const table = slide.tables.add({
    rows: values.length,
    columns: values[0].length,
    left,
    top,
    width,
    height,
    values,
    columnWidths,
  });
  table.name = name;
  table.borders.assign({ style: "solid", fill: GRID, width: 1 });
  table.styleOptions = { headerRow: true, bandedRows: false };

  for (let row = 0; row < values.length; row += 1) {
    for (let col = 0; col < values[0].length; col += 1) {
      const cell = table.getCell(row, col);
      cell.fill =
        row === 0
          ? INK
          : highlightLastRow && row === values.length - 1
            ? PALE_TEAL
            : row % 2 === 0
              ? "#F2F4F1"
              : WHITE;
      cell.text.style = {
        fontSize,
        typeface: "Aptos",
        color: row === 0 ? WHITE : INK,
        bold: row === 0 || (highlightLastRow && row === values.length - 1),
      };
    }
  }
  return table;
}

function addRuleNumber(slide, value, left, color) {
  const circle = slide.shapes.add({
    geometry: "ellipse",
    position: { left, top: 175, width: 112, height: 112 },
    fill: color,
    line: { style: "solid", fill: "none", width: 0 },
  });
  circle.text = value;
  circle.text.style = {
    fontSize: 38,
    typeface: "Aptos Display",
    bold: true,
    color: WHITE,
    alignment: "center",
    verticalAlignment: "middle",
  };
}

async function writeBlob(path, blob) {
  await fs.writeFile(path, new Uint8Array(await blob.arrayBuffer()));
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const presentation = Presentation.create({
    slideSize: { width: 1280, height: 720 },
  });

  // 1. Portada
  const slide1 = buildSlide26(presentation, {
    title: paragraph("INFORME DE AVANCE", 24, TEAL, true),
    title2: paragraph("Painted Wolf\nOptimization", 80, INK, true),
    title3: {
      loremIpsumDetails: paragraph("Movimiento de variables en ℝᵈ", 26, ORANGE, true),
      loremIpsumDetails2: paragraph("Maverick Gayoso · Rogelio González", 24, INK),
      loremIpsumDetails3: paragraph("MII902 Optimización Estocástica · 2026", 20, MUTED),
    },
  });
  slide1.background.fill = BG;
  slide1.shapes.add({
    geometry: "ellipse",
    name: "cover-alpha",
    position: { left: 1040, top: 194, width: 150, height: 150 },
    fill: PALE_ORANGE,
    line: { style: "solid", fill: ORANGE, width: 3 },
  });
  slide1.shapes.add({
    geometry: "ellipse",
    name: "cover-agent-1",
    position: { left: 1115, top: 385, width: 54, height: 54 },
    fill: PALE_TEAL,
    line: { style: "solid", fill: TEAL, width: 3 },
  });
  slide1.shapes.add({
    geometry: "ellipse",
    name: "cover-agent-2",
    position: { left: 1000, top: 470, width: 38, height: 38 },
    fill: AMBER,
    line: { style: "solid", fill: AMBER, width: 1 },
  });
  addNotes(
    slide1,
    "Abrir con la pregunta guía: ¿qué valor recibe una variable de decisión en la siguiente iteración? Delimitar que este avance estudia el dominio real y reserva la binarización para el informe final.",
    ["Sheikhi, S. (2026). Painted Wolf Optimization. DOI: 10.32604/cmc.2026.077788."],
  );

  // 2. Representación
  const slide2 = buildSlide05(presentation, {
    title: titleToken("Cada lobo es una solución; cada dimensión, una variable"),
    body1: body(
      "Representación",
      "Xᵢ(t) = [Xᵢ,₁(t), …, Xᵢ,d(t)]\n\nEl vector contiene una asignación completa de valores reales.",
    ),
    body2: body(
      "Lectura operacional",
      "i  → agente o solución\nj  → variable de decisión\nt  → iteración\nf(Xᵢ) → calidad de la asignación",
    ),
    footer1: "2",
  });
  addDecoration(slide2, 2);
  addNotes(
    slide2,
    "Traducir la metáfora: mover un lobo significa construir un nuevo vector. La función objetivo evalúa el vector completo y permite comparar asignaciones.",
    ["Sheikhi (2026), secciones 2.1–2.5."],
  );

  // 3. Inicialización
  const slide3 = buildSlide17(presentation, {
    title: titleToken("La primera asignación respeta el dominio de cada variable"),
    label1: paragraph("1 · GENERAR", 18, TEAL, true),
    label2: paragraph("2 · EVALUAR", 18, TEAL, true),
    label3: paragraph("3 · CONSERVAR", 18, TEAL, true),
    body1: body("Inicializar", "Xᵢ,ⱼ(0) = lbⱼ + uᵢ,ⱼ(ubⱼ − lbⱼ)"),
    body2: body("Calcular fitness", "Se evalúa f(Xᵢ) para los N agentes."),
    body3: body("Elegir alfa", "Xα es el mejor vector observado hasta el momento."),
    footer1: "3",
  });
  addDecoration(slide3, 3);
  addTextBox(slide3, {
    name: "domain-note",
    text: "Si una variable sale del intervalo, el código la satura en [lbⱼ, ubⱼ].",
    left: 41,
    top: 176,
    width: 920,
    height: 54,
    fontSize: 22,
    color: ORANGE,
    bold: true,
  });
  addNotes(
    slide3,
    "Explicar que la inicialización ya asigna un valor a cada variable. Luego se evalúa la población, se conserva el alfa y se aplican límites por saturación antes de evaluar.",
    [
      "Sheikhi (2026), Algorithm 1.",
      "Repositorio oficial: Python/PWO.py y Matlab/PWO.m.",
    ],
  );

  // 4. Rally
  const slide4 = buildSlide05(presentation, {
    title: titleToken("El rally decide qué ecuación moverá a la población"),
    body1: body(
      "Señales",
      "a(t) = 2(1 − t/T)\nL(t) = |0.04 / a(t)|\n\nCada agente cuyo fitness satisface la condición aporta un voto de 0.04 a R(t).",
    ),
    body2: body(
      "Decisión global",
      "R(t) < H(t)  →  EXPLORACIÓN\n\nR(t) ≥ H(t)  →  EXPLOTACIÓN\n\nEl rally selecciona la regla; todavía no cambia variables.",
    ),
    footer1: "4",
  });
  addDecoration(slide4, 4);
  addNotes(
    slide4,
    "Mostrar la secuencia a, influencia del alfa, votos y umbral. Recalcar que la comparación entre R y H es global para la iteración y solamente elige la ecuación de actualización.",
    ["Sheikhi (2026), ecuaciones 1–3."],
  );

  // 5. Tres ramas
  const slide5 = buildSlide06(presentation, {
    title: titleToken("Una decisión global activa una de tres asignaciones"),
    body1: body(
      "Exploración 1",
      "Seguir una dimensión de un agente aleatorio.\n\nActualización escalar → vector.",
    ),
    body2: body(
      "Exploración 2",
      "Combinar alfa, media poblacional y distancia individual.",
    ),
    body3: body(
      "Explotación",
      "Asignar cada dimensión respecto del valor correspondiente del alfa.",
    ),
    footer1: "5",
  });
  addDecoration(slide5, 5);
  addRuleNumber(slide5, "E₁", 171, ORANGE);
  addRuleNumber(slide5, "E₂", 582, TEAL);
  addRuleNumber(slide5, "X", 994, INK);
  addNotes(
    slide5,
    "Presentar el mapa de rutas. Las dos estrategias de exploración se eligen con probabilidad 0.5; la explotación es la tercera regla. Cada rama construye Xᵢ(t+1) con información distinta.",
    ["Sheikhi (2026), ecuaciones 4–9."],
  );

  // 6. Exploración 1
  const slide6 = buildSlide05(presentation, {
    title: titleToken("Exploración 1: una dimensión puede redefinir el vector completo"),
    body1: body(
      "Distancia perturbada",
      "Dᵣₐₙd = |(2Lr₁ + r₂)Xᵣₐₙd,ⱼ − Xᵢ,ⱼ|\n\nSe eligen otro agente y una dimensión j.",
    ),
    body2: body(
      "Asignación",
      "Xᵢ(t+1) = Xᵣₐₙd,ⱼ − (2ar₁ − a)Dᵣₐₙd\n\nEl escalar resultante se escribe sobre el vector completo.",
    ),
    footer1: "6",
  });
  addDecoration(slide6, 6, "PWO · ECUACIONES");
  addNotes(
    slide6,
    "Explicar que esta es la rama más particular: una distancia calculada en la dimensión j produce un escalar que el paper y el código asignan al vector. Señalar que la escritura ocurre dentro del ciclo de dimensiones.",
    ["Sheikhi (2026), ecuaciones 4–5.", "Repositorio oficial: Python/PWO.py."],
  );

  // 7. Exploración 2
  const slide7 = buildSlide05(presentation, {
    title: titleToken("Exploración 2: dirección global más ajuste individual"),
    body1: body(
      "Dirección global",
      "Xα − X̄\n\nLectura del equipo: conecta el mejor registro con el centro poblacional.",
    ),
    body2: body(
      "Nueva posición",
      "Xᵢ(t+1) = (Xα − X̄) − R|Xα − Xᵢ|\n\nLa distancia al alfa conserva información individual.",
    ),
    footer1: "7",
  });
  addDecoration(slide7, 7, "PWO · ECUACIONES");
  addNotes(
    slide7,
    "Separar la ecuación en dos componentes: alfa menos media como dirección global y distancia absoluta ponderada por R como ajuste particular de cada agente.",
    ["Sheikhi (2026), ecuación 6."],
  );

  // 8. Explotación
  const slide8 = buildSlide05(presentation, {
    title: titleToken("Explotación: cada variable se asigna respecto del alfa"),
    body1: body(
      "Coeficiente",
      "Dᵅᵢ,ⱼ = |Xα,ⱼ − Xᵢ,ⱼ|\n\nA₁ = 2ar₁ − a\nA₂ = R + a·A₁·L",
    ),
    body2: body(
      "Respuesta directa",
      "Xᵢ,ⱼ(t+1) = Xα,ⱼ − A₂Dᵅᵢ,ⱼ\n\nLa operación se repite para j = 1, …, d.",
    ),
    footer1: "8",
  });
  addDecoration(slide8, 8, "PWO · ECUACIONES");
  addTextBox(slide8, {
    name: "answer-callout",
    text: "valor nuevo = valor alfa − perturbación ponderada",
    left: 670,
    top: 536,
    width: 530,
    height: 54,
    fontSize: 21,
    color: ORANGE,
    bold: true,
    align: "center",
  });
  addNotes(
    slide8,
    "Recorrer D alfa, A1 y A2. La última ecuación responde directamente la pregunta del avance: qué valor recibe Xᵢ,ⱼ en la iteración siguiente.",
    ["Sheikhi (2026), ecuaciones 7–9."],
  );

  // 9. Ruteo numérico
  const slide9 = buildSlide14(presentation, {
    title: titleToken("Ruteo: una actualización mejora el fitness de 2.0201 a 1.9758"),
    body1: {
      topic: paragraph("Sphere 2D · a = 1.8 · L = 0.022222 · R = 0.08 · A₂ = 0.1088", 20, ORANGE, true),
      loremIpsumDolorSitAmetConsecteturAdipiscing: paragraph(
        "Los números aleatorios se fijan para que el movimiento sea reproducible.",
        18,
        MUTED,
      ),
    },
    footer1: "9",
  });
  slide9.background.fill = BG;
  slide9.tables.deleteById(slide9.tables.items[0].id);
  addTable(slide9, {
    name: "route-table",
    left: 52,
    top: 245,
    width: 1170,
    height: 315,
    coverHeight: 430,
    coverLeft: 40,
    coverTop: 230,
    coverWidth: 1200,
    columnWidths: [390, 230, 230, 320],
    values: [
      ["Etapa", "x₁", "x₂", "f(x)"],
      ["Agente Xᵢ(t)", "1.010000", "1.000000", "2.020100"],
      ["Alfa Xα(t)", "1.000000", "0.990000", "1.980100"],
      ["Distancia al alfa", "0.010000", "0.010000", "—"],
      ["Nuevo Xᵢ(t+1)", "0.998912", "0.988912", "1.975772"],
    ],
    fontSize: 18,
    highlightLastRow: true,
  });
  addTextBox(slide9, {
    name: "route-equation",
    text: "x₁′ = 1.00 − 0.1088·0.01     ·     x₂′ = 0.99 − 0.1088·0.01",
    left: 145,
    top: 590,
    width: 990,
    height: 42,
    fontSize: 22,
    color: TEAL,
    bold: true,
    align: "center",
  });
  addDecoration(slide9, 9, "PWO · RUTEO NUMÉRICO");
  addNotes(
    slide9,
    "Desarrollar las dos asignaciones escalares. Ambas distancias son 0.01; al ponderarlas por A2 y restarlas del alfa se obtiene el nuevo vector. El fitness mejora y no se requiere reparación de dominio.",
    ["Cálculo propio reproducible a partir de Sheikhi (2026), ecuaciones 7–9."],
  );

  // 10. Prueba preliminar
  const slide10 = buildSlide21(presentation, {
    title: titleToken("La ejecución oficial reduce el fitness en Sphere"),
    body1: paragraph(
      "Prueba controlada: d = 3 · 20 agentes · 100 iteraciones · semilla 20260728",
      20,
      MUTED,
    ),
    stat1: paragraph("95.2", 38, TEAL, true),
    body2: paragraph("órdenes de\nmagnitud", 18, INK),
    stat2: paragraph("1", 38, ORANGE, true),
    body3: paragraph("semilla\npreliminar", 18, INK),
    footer1: "10",
  });
  slide10.background.fill = BG;
  slide10.charts.deleteById(slide10.charts.items[0].id);
  slide10.charts.add("line", {
    position: { left: 40.5, top: 131.7, width: 581, height: 527.5 },
    title: "log₁₀ del mejor fitness",
    titleTextStyle: { fontSize: 18, fill: INK, bold: true },
    categories: ["1", "20", "40", "60", "80", "100"],
    series: [
      {
        name: "PWO oficial",
        values: [3.632, -12.301, -30.948, -50.847, -68.389, -91.599],
        line: { style: "solid", width: 4, fill: TEAL },
        marker: { symbol: "circle", size: 7 },
      },
    ],
    hasLegend: false,
    dataLabels: {
      showValue: true,
      position: "outEnd",
      textStyle: { fontSize: 11, fill: INK },
    },
    chartFill: WHITE,
    chartLine: { style: "solid", width: 0, fill: WHITE },
    plotAreaFill: { type: "none" },
    xAxis: {
      visible: true,
      title: "Iteración",
      line: { style: "solid", width: 1, fill: GRID },
      textStyle: { fontSize: 11, fill: MUTED },
    },
    yAxis: {
      visible: true,
      title: "log₁₀(f*)",
      min: -100,
      max: 10,
      majorUnit: 20,
      majorGridlines: { style: "solid", width: 1, fill: GRID },
      line: { style: "solid", width: 0, fill: WHITE },
      textStyle: { fontSize: 11, fill: MUTED },
    },
  });
  addDecoration(slide10, 10, "PWO · VERIFICACIÓN PRELIMINAR");
  addNotes(
    slide10,
    "La ejecución redujo el mejor fitness desde 4281.3964 hasta 2.519815×10⁻⁹². Aclarar que es una verificación de funcionamiento, no una reproducción estadística ni una prueba de superioridad.",
    [
      "Repositorio oficial: Python/PWO.py.",
      "Ejecución local controlada, semilla NumPy 20260728.",
    ],
  );

  // 11. Discrepancias
  const slide11 = buildSlide14(presentation, {
    title: titleToken("Discrepancias que afectan la reproducibilidad"),
    body1: {
      topic: paragraph(
        "Paper y código se tratan como fuentes distintas: las diferencias se documentan y se prueban como variantes.",
        20,
        ORANGE,
        true,
      ),
      loremIpsumDolorSitAmetConsecteturAdipiscing: paragraph("", 18, MUTED),
    },
    footer1: "11",
  });
  slide11.background.fill = BG;
  slide11.tables.deleteById(slide11.tables.items[0].id);
  addTable(slide11, {
    name: "differences-table",
    left: 42,
    top: 225,
    width: 1196,
    height: 405,
    coverHeight: 425,
    columnWidths: [235, 310, 335, 316],
    values: [
      ["Punto", "Artículo / pseudocódigo", "Repositorio oficial", "Criterio de trabajo"],
      ["Umbral H", "Reutiliza r₄", "Python usa tres sorteos", "Registrar ambas variantes"],
      ["a(T)", "Decrece hasta 0", "Python evita 0; MATLAB no", "Prevenir singularidad"],
      ["Evaluación final", "Evalúa tras mover", "Último movimiento no se evalúa", "Evaluar antes de retornar"],
      ["Bucle por j", "Mezcla escalar y vector", "Escrituras vectoriales dentro de j", "Crear pruebas de asignación"],
    ],
    fontSize: 15,
  });
  addDecoration(slide11, 11, "PWO · REPRODUCIBILIDAD");
  addNotes(
    slide11,
    "Destacar cuatro discrepancias que afectan la reproducción. Para el avance, el artículo y el código son fuentes distintas; sus diferencias se conservarán como decisiones experimentales trazables.",
    [
      "Sheikhi (2026), Algorithm 1 y ecuaciones 1–9.",
      "Repositorio oficial: Python/PWO.py y Matlab/PWO.m.",
    ],
  );

  // 12. Cierre
  const slide12 = buildSlide26(presentation, {
    title: paragraph("SIGUIENTE ETAPA", 24, TEAL, true),
    title2: paragraph("Fijar la dinámica real\nantes de binarizar", 68, INK, true),
    title3: {
      loremIpsumDetails: paragraph("1 · estabilizar la versión continua", 23, ORANGE, true),
      loremIpsumDetails2: paragraph("2 · reproducir benchmarks con múltiples semillas", 22, INK),
      loremIpsumDetails3: paragraph("3 · diseñar y evaluar la binarización", 22, INK),
    },
  });
  slide12.background.fill = BG;
  slide12.shapes.add({
    geometry: "roundRect",
    name: "final-callout",
    position: { left: 1060, top: 194, width: 150, height: 150 },
    fill: PALE_TEAL,
    line: { style: "solid", fill: TEAL, width: 3 },
  });
  addTextBox(slide12, {
    name: "final-callout-text",
    text: "X(t)\n→\nX(t+1)",
    left: 1081,
    top: 220,
    width: 108,
    height: 100,
    fontSize: 25,
    color: TEAL,
    bold: true,
    align: "center",
  });
  addNotes(
    slide12,
    "Cerrar con el resultado del avance: representación, rally y tres ecuaciones formalizadas; ruteo y ejecución preliminar listos; discrepancias identificadas. La binarización se construirá sobre una dinámica continua ya estabilizada.",
    [
      "Síntesis propia basada en Sheikhi (2026).",
      "Plan de trabajo del proyecto PWO.",
    ],
  );

  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, "0")}`;
    const png = await presentation.export({ slide, format: "png", scale: 1.5 });
    await writeBlob(new URL(`${stem}.png`, OUT_DIR), png);
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(
      new URL(`${stem}.layout.json`, OUT_DIR),
      await layout.text(),
    );
  }

  const montage = await presentation.export({
    format: "webp",
    montage: true,
    scale: 1,
  });
  await writeBlob(new URL("deck-montage.webp", OUT_DIR), montage);

  const pptx = await PresentationFile.exportPptx(presentation);
  const finalPath = fileURLToPath(FINAL_PPTX);
  await pptx.save(finalPath);
  await fs.rm(`${finalPath}.inspect.ndjson`, { force: true });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
