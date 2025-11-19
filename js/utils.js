// Shared helpers: responsive SVG, tooltip, number formatting

const tooltip = createTooltip();

function createSVG(containerSelector, height = 260) {
  const container = d3.select(containerSelector);
  const node = container.node();
  const width = node ? node.getBoundingClientRect().width : 600;

  const margin = { top: 26, right: 22, bottom: 46, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { svg, chart, innerWidth, innerHeight, margin };
}

function createTooltip() {
  return d3
    .select("body")
    .append("div")
    .attr("class", "chart-tooltip");
}

function formatNumber(value) {
  if (value == null || isNaN(value)) return "0";
  if (value >= 1_000_000) return d3.format(".2s")(value); // 1.2M
  if (value >= 1_000) return d3.format(",")(value);
  return value.toString();
}
