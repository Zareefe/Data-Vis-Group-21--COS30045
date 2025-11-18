function drawAgeChart(data) {
  const container = d3.select("#chart_age");
  container.selectAll("*").remove();

  if (!data || data.length === 0) {
    container.append("p").text("No data available for current filters.");
    return;
  }

  const grouped = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.fines),
      (d) => d.age_group
    )
    .map((d) => ({ age_group: d[0], total: d[1] }))
    .sort((a, b) => (a.age_group > b.age_group ? 1 : -1));

  const { chart, innerWidth, innerHeight } = createSVG("#chart_age");

  const x = d3
    .scaleBand()
    .domain(grouped.map((d) => d.age_group))
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
    .selectAll("rect.bar-age")
    .data(grouped)
    .enter()
    .append("rect")
    .attr("class", "bar-age")
    .attr("x", (d) => x(d.age_group))
    .attr("y", (d) => y(d.total))
    .attr("width", x.bandwidth())
    .attr("height", (d) => innerHeight - y(d.total))
    .attr("fill", "#2e7cd4")
    .on("mousemove", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${d.age_group}</strong><br/>Fines: ${formatNumber(d.total)}`
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
    .text("Age group");

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
