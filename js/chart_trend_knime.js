// chart_trend_knime.js (Updated for your Q2_trend.csv fields)
// Uses: jurisdiction, year, total
// No extra assumptions, fully KNIME-compatible.

function drawTrendKnime(rows, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  ensureTooltipKnime();

  if (!rows || rows.length === 0) {
    container.append("p").text("No Q2 trend data available.");
    return;
  }

  // VALIDATE: Only rows with state + year + total
  const valid = rows.filter(r => r.state && r.year != null && r.total != null);

  if (valid.length === 0) {
    container.append("p").text("No valid Q2 trend entries found.");
    return;
  }

  // GROUP BY JURISDICTION
  const grouped = d3.groups(valid, d => d.state).map(([state, vals]) => {
    const sorted = vals.slice().sort((a, b) => a.year - b.year);
    return {
      state,
      values: sorted.map(v => ({
        year: +v.year,
        total: +v.total
      }))
    };
  });

  const years = Array.from(new Set(valid.map(d => +d.year))).sort((a, b) => a - b);
  const maxY = d3.max(grouped, g => d3.max(g.values, v => v.total));

  const HEIGHT = 380;
  const { chart, innerWidth, innerHeight } = createSVGKnime(selector, HEIGHT);

  const x = d3.scaleLinear()
    .domain(d3.extent(years))
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([0, maxY])
    .nice()
    .range([innerHeight, 0]);

  // AXES
  chart.append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  chart.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(formatNumberKnime));

  // LINE GENERATOR
  const lineGen = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.total))
    .curve(d3.curveMonotoneX);

  // DRAW ALL JURISDICTION LINES
  grouped.forEach(g => {
    chart.append("path")
      .datum(g.values)
      .attr("fill", "none")
      .attr("stroke", stateColourScaleKnime(g.state))
      .attr("stroke-width", 2)
      .attr("opacity", 0.9)
      .attr("d", lineGen);

    // POINTS + TOOLTIP
    chart.selectAll(`.point-${g.state}`)
      .data(g.values)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.total))
      .attr("r", 3)
      .attr("fill", stateColourScaleKnime(g.state))
      .on("mousemove", (event, d) => {
        tooltipKnime.style("opacity", 1)
          .html(
            `<strong>${g.state}</strong><br>` +
            `Year: ${d.year}<br>` +
            `Total fines: ${formatNumberKnime(d.total)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseleave", () => tooltipKnime.style("opacity", 0));
  });
}
