function drawTrendChart(data, containerSelector, focusState) {
  const container = d3.select(containerSelector);
  container.selectAll("*").remove();

  if (!data || data.length === 0) {
    container.append("p").text("No data available for current filters.");
    return;
  }

  // group by state + year
  const nested = d3.group(
    data,
    (d) => d.state,
    (d) => d.year
  );

  const series = [];
  nested.forEach((yearsMap, state) => {
    const points = [];
    yearsMap.forEach((rows, year) => {
      points.push({
        state,
        year: +year,
        total: d3.sum(rows, (r) => r.fines)
      });
    });

    points.sort((a, b) => a.year - b.year);
    series.push({ state, values: points });
  });

  const allYears = data.map((d) => d.year);
  const yearExtent = d3.extent(allYears);
  const maxTotal = d3.max(series, (s) => d3.max(s.values, (v) => v.total));

  const { chart, innerWidth, innerHeight } = createSVG(containerSelector, 300);

  const x = d3
    .scaleLinear()
    .domain(yearExtent)
    .range([0, innerWidth]);

  const y = d3
    .scaleLinear()
    .domain([0, maxTotal])
    .nice()
    .range([innerHeight, 0]);

  chart
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  chart
    .append("g")
    .attr("class", "axis y-axis")
    .call(d3.axisLeft(y).ticks(5).tickFormat(formatNumber));

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d) => y(d.total))
    .curve(d3.curveMonotoneX);

  const stateLines = chart
    .selectAll(".trend-line")
    .data(series)
    .enter()
    .append("g")
    .attr("class", "trend-series");

  stateLines
    .append("path")
    .attr("class", "trend-line")
    .attr("d", (s) => line(s.values))
    .attr("fill", "none")
    .attr("stroke", (s) => stateColourScale(s.state))
    .attr("stroke-width", (s) =>
      focusState && focusState !== "All" && s.state !== focusState ? 1.5 : 2.5
    )
    .attr("opacity", (s) =>
      focusState && focusState !== "All" && s.state !== focusState ? 0.35 : 0.95
    );

  stateLines
    .selectAll("circle")
    .data((s) => s.values)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.year))
    .attr("cy", (d) => y(d.total))
    .attr("r", 3)
    .attr("fill", (d) => stateColourScale(d.state))
    .attr("opacity", (d) =>
      focusState && focusState !== "All" && d.state !== focusState ? 0.4 : 0.9
    )
    .on("mousemove", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.state}</strong><br/>Year: ${d.year}<br/>Fines: ${formatNumber(
            d.total
          )}`
        )
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  chart
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 40)
    .attr("text-anchor", "middle")
    .attr("fill", "#4a5873")
    .attr("font-size", "0.78rem")
    .text("Year");

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
