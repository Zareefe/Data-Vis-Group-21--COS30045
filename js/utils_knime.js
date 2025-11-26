// utils_knime.js
// Standalone helpers ONLY for KNIME charts.
// Does NOT affect your old utils.js or old charts.

// -------------------------------
// 1. Tooltip (independent copy)
// -------------------------------
function ensureTooltipKnime() {
  if (window.tooltipKnime) return;
  window.tooltipKnime = d3
    .select("body")
    .append("div")
    .attr("class", "chart-tooltip")
    .style("opacity", 0);
}

// -------------------------------
// 2. Number formatter
// -------------------------------
function formatNumberKnime(value) {
  if (value == null || isNaN(value)) return "0";

  const n = +value;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toLocaleString();
}

// -------------------------------
// 3. State colour scale
// (Independent from utils.js)
// -------------------------------
const stateColourScaleKnime = d3
  .scaleOrdinal()
  .domain([
    "NSW",
    "VIC",
    "QLD",
    "WA",
    "SA",
    "TAS",
    "ACT",
    "NT",
    "Unknown",
  ])
  .range([
    "#1f77b4", // NSW
    "#2ca02c", // VIC
    "#ff7f0e", // QLD
    "#9467bd", // WA
    "#8c564b", // SA
    "#17becf", // TAS
    "#bcbd22", // ACT
    "#d62728", // NT
    "#7f7f7f", // fallback
  ]);

// -------------------------------
// 4. Responsive SVG generator
// -------------------------------
function createSVGKnime(selector, height = 260) {
  const container = d3.select(selector);
  container.selectAll("*").remove();

  const WIDTH = container.node().clientWidth || 900;
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 55 };

  const innerWidth = WIDTH - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;

  const svg = container
    .append("svg")
    .attr("width", WIDTH)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

  return { svg, chart, innerWidth, innerHeight };
}
