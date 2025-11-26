// main_knime.js
// KNIME auto-detect loader using utils_knime.js only.

const DATA_PATH_Q1 = "data/Q1_per10000.csv";
const DATA_PATH_Q2 = "data/Q2_trend.csv";
const DATA_PATH_Q3 = "data/Q3_covidtrend.csv";
const DATA_PATH_Q4 = "data/Q4_detection.csv";
const DATA_PATH_Q5 = "data/Q5excel_Processes.csv";

// Find key names automatically (case-insensitive)
function findKey(keys, candidates) {
  const lowered = keys.map(k => k.toLowerCase());
  for (const c of candidates) {
    const idx = lowered.indexOf(c.toLowerCase());
    if (idx >= 0) return keys[idx];
  }
  for (const c of candidates) {
    for (let i = 0; i < lowered.length; i++) {
      if (lowered[i].includes(c.toLowerCase())) return keys[i];
    }
  }
  return null;
}

// Normalise rows using detected column names
function normaliseRows(rows, mapping) {
  if (!rows || rows.length === 0) return [];
  const keys = Object.keys(rows[0]);
  const get = field => findKey(keys, mapping[field] || []);

  const keyState = get("state");
  const keyYear = get("year");
  const keyDate = get("date");
  const keyMonth = get("month");
  const keyTotal = get("total");
  const keyRate = get("rate");
  const keyMethod = get("method");

  return rows.map(r => {
    const obj = {};

    obj.state = keyState ? r[keyState] : "Unknown";

    // Year detection
    let year = null;
    if (keyYear) year = +r[keyYear];
    else if (keyDate) {
      const d = new Date(r[keyDate]);
      if (!isNaN(d)) year = d.getFullYear();
    }
    obj.year = year;

    // Total fines
    obj.total = keyTotal ? +String(r[keyTotal]).replace(/,/g, "") : 0;

    // Rate per 10k
    obj.rate = keyRate ? +String(r[keyRate]).replace(/,/g, "") : null;

    // Method
    obj.method = keyMethod ? r[keyMethod] : null;

    // Date (if exists)
    if (keyDate) {
      const d = new Date(r[keyDate]);
      if (!isNaN(d)) obj.date = d;
    }

    return obj;
  });
}

// Candidate column names
const MAPPING = {
  state: ["state", "jurisdiction", "region"],
  year: ["year", "yr"],
  date: ["date", "period"],
  month: ["month", "mn"],
  total: ["total", "fines", "value", "count"],
  rate: ["rate", "rate10k", "per10k", "rate_per_10000", "offences_per_10k"],
  method: ["method", "detection"]
};

// Load CSV safely
async function loadCSV(path) {
  try {
    const r = await d3.csv(path);
    return r;
  } catch (err) {
    console.warn("Failed CSV:", path, err);
    return null;
  }
}

// Initialise KNIME charts
async function initKnime() {
  ensureTooltipKnime();

  const [rawQ1, rawQ2, rawQ3, rawQ4, rawQ5] = await Promise.all([
    loadCSV(DATA_PATH_Q1),
    loadCSV(DATA_PATH_Q2),
    loadCSV(DATA_PATH_Q3),
    loadCSV(DATA_PATH_Q4),
    loadCSV(DATA_PATH_Q5),
  ]);

  if (rawQ1 && document.getElementById("knime-q1-rate")) {
    drawQ1Rate(normaliseRows(rawQ1, MAPPING), "#knime-q1-rate");
  }

  if (rawQ4) {
    if (document.getElementById("knime-q4-detection")) {
      drawDetectionStack(normaliseRows(rawQ4, MAPPING), "#knime-q4-detection");
    }
    if (document.getElementById("knime-q4-pie")) {
      drawPieDetection(normaliseRows(rawQ4, MAPPING), "#knime-q4-pie");
    }
  }

  if (rawQ2 && document.getElementById("knime-q2-trend")) {
    drawTrendKnime(normaliseRows(rawQ2, MAPPING), "#knime-q2-trend");
  }

  if (rawQ3 && document.getElementById("knime-q3-covid")) {
    drawCovidArea(normaliseRows(rawQ3, MAPPING), "#knime-q3-covid");
  }

  if (rawQ5 && document.getElementById("knime-q5-heatmap")) {
    drawHeatmapQ5(normaliseRows(rawQ5, MAPPING), "#knime-q5-heatmap");
  }

  if (rawQ5 && document.getElementById("knime-q-scatter")) {
    const rows = normaliseRows(rawQ5, MAPPING);
    const agg = d3.rollups(
      rows,
      vs => ({
        fines: d3.sum(vs, d => d.total),
        arrests: 0,
        charges: 0,
      }),
      d => d.state
    ).map(([state, obj]) => ({ state, ...obj }));

    drawScatterKnime(agg, "#knime-q-scatter");
  }
}

document.addEventListener("DOMContentLoaded", initKnime);