// utils.js - shared helpers for all charts
const tooltip = createTooltip();

function createTooltip() {
  const t = d3.select("body").append("div").attr("class", "chart-tooltip");
  return t;
}

function createSVG(containerSelector, height = 280) {
  const container = d3.select(containerSelector);
  container.select("svg").remove();
  const node = container.node();
  const width = node ? Math.max(320, node.getBoundingClientRect().width) : 800;
  const margin = { top: 28, right: 18, bottom: 48, left: 68 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container.append("svg").attr("width", width).attr("height", height).attr("viewBox", `0 0 ${width} ${height}`);
  const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  return { svg, chart, innerWidth, innerHeight, margin };
}

function formatNumber(value) {
  if (value == null || isNaN(value)) return "0";
  if (value >= 1_000_000) return d3.format(".2s")(value);
  if (value >= 1000) return d3.format(",")(value);
  return value.toString();
}

function safeParseFloat(v) { const n = parseFloat(v); return isNaN(n) ? 0 : n; }

// nice color palette for jurisdictions
const stateColourScale = d3.scaleOrdinal()
  .domain(["NSW","VIC","QLD","WA","SA","TAS","ACT","NT"])
  .range(["#1f77b4","#2ca02c","#ff7f0e","#9467bd","#8c564b","#17becf","#bcbd22","#d62728"]);
