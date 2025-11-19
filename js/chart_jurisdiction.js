// colour scale for jurisdictions (used here and in trend chart)
const stateColourScale = d3
  .scaleOrdinal()
  .domain(["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"])
  .range([
    "#1f77b4", // NSW
    "#2ca02c", // VIC
    "#ff7f0e", // QLD
    "#9467bd", // WA
    "#8c564b", // SA
    "#17becf", // TAS
    "#bcbd22", // ACT
    "#d62728"  // NT
  ]);

function drawJurisdictionChart(data, containerSelector) {
  const container = d3.select(containerSelector);
  container.selectAll("*").remove();

  if (!data || data.length === 0) {
    container.append("p").text("No data available for current filters.");
    return;
  }

  const grouped = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.fines),
      (d) => d.state
    )
    .map(([state, total]) => ({ state, total }))
    .sort((a, b) => d3.descending(a.total, b.total));

  const { chart, innerWidth, innerHeight } = createSVG(containerSelector);

  const x = d3
    .scaleBand()
    .domain(grouped.map((d) => d.state))
    .range([0, innerWidth])
    .padding(0.25);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(grouped, (d) => d.total)])
    .nice()
    .range([innerHeight, 0]);

  chart
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  chart
    .append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(y).ticks(5).tickFormat(formatNumber));

  chart
    .selectAll("rect.bar-state")
    .data(grouped)
    .enter()
    .append("rect")
    .attr("class", "bar-state")
    .attr("x", (d) => x(d.state))
    .attr("y", (d) => y(d.total))
    .attr("width", x.bandwidth())
    .attr("height", (d) => innerHeight - y(d.total))
    .attr("fill", (d) => stateColourScale(d.state))
    .on("mousemove", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.state}</strong><br/>Fines: ${formatNumber(d.total)}`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  chart
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 38)
    .attr("text-anchor", "middle")
    .attr("fill", "#4a5873")
    .attr("font-size", "0.78rem")
    .text("Jurisdiction");

  chart
    .append("text")
    .attr("x", -innerHeight / 2)
    .attr("y", -58)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "#4a5873")
    .attr("font-size", "0.78rem")
    .text("Number of fines");
}
