function drawStateChart(data) {
  const container = d3.select("#chart_state");
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
    .map((d) => ({ state: d[0], total: d[1] }))
    .sort((a, b) => d3.descending(a.total, b.total));

  const { chart, innerWidth, innerHeight } = createSVG("#chart_state");

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

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => formatNumber(d));

  chart
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis);

  chart.append("g").attr("class", "axis y-axis").call(yAxis);

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
    .attr("fill", "#3f91ee")
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
    .attr("fill", "#d7e2f8")
    .attr("font-size", "0.78rem")
    .text("Jurisdiction");

  chart
    .append("text")
    .attr("x", -innerHeight / 2)
    .attr("y", -58)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "#d7e2f8")
    .attr("font-size", "0.78rem")
    .text("Number of fines");
}