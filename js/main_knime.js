// main_knime.js
// Loads KNIME outputs only, wires up filters for the KNIME-driven charts.
// Place this file in /js and add <script src="js/main_knime.js"></script> at the end of each page (index/jurisdiction/trend).

// Update these paths if your CSVs sit elsewhere on deployment:
const DATA_PATH_Q1 = "data/Q1_per10000.csv";
const DATA_PATH_Q2 = "data/Q2_trend.csv";
const DATA_PATH_Q3 = "data/Q3_covidtrend.csv";
const DATA_PATH_Q4 = "data/Q4_detection.csv";
const DATA_PATH_Q5 = "data/Q5excel_Processes.csv";

async function loadCSV(path) {
  try {
    const data = await d3.csv(path);
    return data;
  } catch (err) {
    console.error("Failed to load", path, err);
    return null;
  }
}

async function initKnimeCharts() {
  // load all KNIME outputs in parallel
  const [q1, q2, q3, q4, q5] = await Promise.all([
    loadCSV(DATA_PATH_Q1),
    loadCSV(DATA_PATH_Q2),
    loadCSV(DATA_PATH_Q3),
    loadCSV(DATA_PATH_Q4),
    loadCSV(DATA_PATH_Q5),
  ]);

  // init pages only if containers exist
  if (document.getElementById("knime-q1-rate") && q1) {
    // map/normalize columns where necessary
    // expected Q1 columns: jurisdiction/state, rate_per_10000 or Rate10k or rate
    q1.forEach(d => {
      // normalize possible column name variants:
      if (d.rate_per_10000 == null && d.Rate10k != null) d.rate_per_10000 = +d.Rate10k;
      if (d.rate_per_10000 == null && d.rate != null) d.rate_per_10000 = +d.rate;
      if (d.rate_per_10000 == null && d.Rate_per_10000 != null) d.rate_per_10000 = +d.Rate_per_10000;
      // state/jurisdiction mapping:
      d.state = d.state || d.State || d.Jurisdiction || d.JURISDICTION || d.JurisdictionName;
      d.rate_per_10000 = +d.rate_per_10000 || 0;
    });
    drawQ1Rate(q1, "#knime-q1-rate");
  }

  if (document.getElementById("knime-q4-detection") && q4) {
    // expected Q4 columns: state/jurisdiction, method, fines (or count)
    q4.forEach(d => {
      d.state = d.state || d.State || d.Jurisdiction;
      d.method = d.method || d.Method || d.DetectionMethod || d.DETECTION_METHOD;
      d.value = + (d.fines || d.count || d.value || d.total || 0);
    });
    drawDetectionStack(q4, "#knime-q4-detection");
    // pie (separate small container if present)
    if (document.getElementById("knime-q4-pie")) drawPieDetection(q4, "#knime-q4-pie");
  }

  if (document.getElementById("knime-q2-trend") && q2) {
    // expected Q2 columns: state/jurisdiction, year (numeric), total_fines or total
    q2.forEach(d => {
      d.state = d.state || d.State || d.Jurisdiction;
      d.year = + (d.year || d.Year || d.YEAR || d.YR || d.Y);
      d.total = + (d.total || d.total_fines || d.fines || d.value || 0);
    });
    drawTrendKnime(q2, "#knime-q2-trend");
  }

  if (document.getElementById("knime-q3-covid") && q3) {
    // expected Q3 columns: period (YYYY-MM or Year+Month), date, total
    // try to parse various formats
    q3.forEach(d => {
      d.date = d.date || d.Date || d.period || d.PERIOD;
      d.total = + (d.total || d.fines || d.value || 0);
    });
    drawCovidArea(q3, "#knime-q3-covid");
  }

  if (document.getElementById("knime-q5-heatmap") && q5) {
    // expected Q5 columns: state, year, total OR improvement_score
    q5.forEach(d => {
      d.state = d.state || d.State || d.Jurisdiction;
      d.year = + (d.year || d.Year || d.YEAR);
      d.total = + (d.total || d.fines || d.value || 0);
      d.improvement = + (d.improvement || d.improvement_score || d.score || 0);
    });
    drawHeatmapQ5(q5, "#knime-q5-heatmap");
  }

  if (document.getElementById("knime-q-scatter") && (q1 || q4 || q5)) {
    // try to build an aggregated scatter: e.g., fines vs arrests from Q5 or Q4 aggregated
    // the scatter module expects aggregated rows with fields: state, fines, arrests, charges
    // attempt to find one of the KNIME outputs with these fields
    const candidate = q5 || q4 || q1;
    // basic aggregation if candidate present:
    const agg = d3.rollups(candidate, vs => {
      return {
        fines: d3.sum(vs, d => + (d.total || d.fines || d.value || 0)),
        arrests: d3.sum(vs, d => + (d.arrests || d.Arrests || 0)),
        charges: d3.sum(vs, d => + (d.charges || d.Charges || 0))
      };
    }, d => d.state).map(([state, v]) => ({ state, ...v }));
    drawScatterKnime(agg, "#knime-q-scatter");
  }

  // finished
}

document.addEventListener("DOMContentLoaded", () => {
  initKnimeCharts();
});
