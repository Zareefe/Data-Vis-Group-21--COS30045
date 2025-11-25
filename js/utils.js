// =========================
// utils.js – Shared helpers
// =========================

// ----- Tooltip -----
export const tooltip = d3.select("body")
  .append("div")
  .attr("class", "chart-tooltip")
  .style("opacity", 0);

export function showTooltip(html, event) {
  tooltip
    .html(html)
    .style("left", event.pageX + 15 + "px")
    .style("top", event.pageY + 15 + "px")
    .style("opacity", 1);
}

export function hideTooltip() {
  tooltip.style("opacity", 0);
}

// ----- Responsive SVG container -----
export function createSVG(container, width, height, margin) {
  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const inner = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  return { svg, inner };
}

// ----- Colour scales -----
export const stateColours = {
  "NSW": "#1f77b4",
  "VIC": "#2ca02c",
  "QLD": "#ff7f0e",
  "WA":  "#9467bd",
  "SA":  "#8c564b",
  "TAS": "#17becf",
  "ACT": "#bcbd22",
  "NT":  "#d62728"
};

export const heatColours = d3.interpolateRdYlGn;

// ----- Group helper -----
export function groupBy(data, key) {
  return Array.from(d3.group(data, d => d[key]), ([k, v]) => ({ key: k, values: v }));
}

export function nested(data, key1, key2) {
  return d3.group(data, d => d[key1], d => d[key2]);
}

// ----- Parse numeric fields -----
export function toNumber(d, fields) {
  fields.forEach(f => d[f] = +d[f]);
  return d;
}

// ----- Legend helper -----
export function createLegend(container, keys, colourScale) {
  const wrap = d3.select(container);

  keys.forEach(k => {
    const row = wrap.append("div").attr("class", "legend-row");

    row.append("span")
      .attr("class", "legend-swatch")
      .style("background-color", colourScale(k));

    row.append("span").attr("class", "legend-label").text(k);
  });
}
