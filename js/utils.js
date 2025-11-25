// utils.js - helpers used by all chart modules
const tooltip = createTooltip();

function createSVG(containerSelector, height = 260) {
  const container = d3.select(containerSelector);
  container.select("svg").remove(); // fresh
  const node = container.node();
  const width = node ? Math.max(360, node.getBoundingClientRect().width) : 640;
  const margin = { top: 26, right: 20, bottom: 48, left: 68 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const svg = container.append("svg").attr("width", width).attr("height", height);
  const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  return { svg, chart, innerWidth, innerHeight, margin };
}

function createTooltip() {
  return d3.select("body").append("div").attr("class", "chart-tooltip");
}

function formatNumber(value) {
  if (value == null || isNaN(value)) return "0";
  if (value >= 1_000_000) return d3.format(".2s")(value);
  if (value >= 1000) return d3.format(",")(value);
  return String(value);
}
