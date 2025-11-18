function drawMonthlyChart(data) {
  const container = d3.select("#chart_month");
  container.selectAll("*").remove();

  if (!data || data.length === 0) {
    container.append("p").text("No data available for current filters.");
    return;
  }

  const grouped = d3
    .rollups(
      data,
      (v) => d3.sum(v, (d) => d.fines),
      (d) => {
        const parts = d.start_date.split("/");
        const month = +parts[0]; // assumes month is first; adjust if needed
        return month;
      }
    )
    .map((d) => ({ month: d[0], total: d[1] }))
    .sort((a, b) => a.month - b.month);

  const { chart, innerWidth, innerHeight } = createSVG(
    "#chart_month",
    300
  );

  const x = d3
    .scaleLinear()
    .domain([1, 12])
    .range([0, innerWidth]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(grouped, (d) => d.total)])
    .nice()
    .range([innerHeight, 0]);

  const xAxis = d3
    .axisBottom(x)
    .ticks(12)
    .tickFormat((d) => d3.timeFormat("%b")(new Date(2024, d - 1, 1)));

  const yAxis = d3.axisLeft(y).ticks(5).tickFormat((d) => formatNumber(d));

  chart
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis);

  chart.append("g").attr("class", "axis y-axis").call(yAxis);

  const line = d3
    .line()
    .x((d) => x(d.month))
    .y((d) => y(d.total))
    .curve(d3.curveMonotoneX);

  chart
    .append("path")
    .datum(grouped)
    .attr("fill", "none")
    .attr("stroke", "#69b6ff")
    .attr("stroke-width", 3)
    .attr("d", line);

  chart
    .selectAll("circle.point-month")
    .data(grouped)
    .enter()
    .append("circle")
    .attr("class", "point-month")
    .attr("cx", (d) => x(d.month))
    .attr("cy", (d) => y(d.total))
    .attr("r", 4)
    .attr("fill", "#ffffff")
    .attr("stroke", "#2e7cd4")
    .attr("stroke-width", 2)
    .on("mousemove", (event, d) => {
      const label = d3.timeFormat("%B")(new Date(2024, d.month - 1, 1));
      tooltip
        .style("opacity", 1)
        .html(
          `<strong>${label}</strong><br/>Fines: ${formatNumber(d.total)}`
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
    .attr("fill", "#d7e2f8")
    .attr("font-size", "0.78rem")
    .text("Month (2024)");

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
