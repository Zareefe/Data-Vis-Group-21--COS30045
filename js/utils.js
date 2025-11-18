// Shared helpers and tooltip setup

const tooltip = createTooltip();

function createSVG(containerSelector, width = 900, height = 320) {
  const margin = { top: 30, right: 24, bottom: 50, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select(containerSelector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { svg, chart, innerWidth, innerHeight, margin };
}

function createTooltip() {
  const div = d3
    .select("body")
    .append("div")
    .attr("class", "chart-tooltip");

  return div;
}

function formatNumber(value) {
  if (value == null || isNaN(value)) return "0";
  if (value >= 1000000) return d3.format(".2s")(value);
  if (value >= 1000) return d3.format(",")(value);
  return value.toString();
}
