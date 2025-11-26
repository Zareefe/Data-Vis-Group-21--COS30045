// chart_q1_rate.js (uses utils_knime.js)

// Q1: Rate per 10,000 licences
function drawQ1Rate(rows, selector) {
  const el = d3.select(selector);
  el.selectAll("*").remove();

  if (!rows || rows.length === 0) {
    el.append("p").text("No Q1 data available.");
    return;
  }

  ensureTooltipKnime();

  // ---------------------------
  // FIX: Make sure we read 'rate_per_10000' when exists
  // ---------------------------
  const data = rows
    .map(r => ({
      state: r.state,
      rate: r.rate ?? r.rate_per_10000 ?? r["rate_per_10000"] ?? null
    }))
    .filter(r => r.state && r.rate != null)
    .sort((a, b) => d3.descending(a.rate, b.rate));

  if (data.length === 0) {
    el.append("p").text("Q1: No valid rate values found.");
    return;
  }

  const H = Math.max(300, data.length * 30 + 60);
  const { chart, innerWidth, innerHeight } = createSVGKnime(selector, H);

  const y = d3
    .scaleBand()
    .domain(data.map(d => d.state))
    .range([0, innerHeight])
    .padding(0.15);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.rate)])
    .range([0, innerWidth])
    .nice();

  chart.append("g").call(d3.axisLeft(y));
  chart
    .append("g")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  chart
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.state))
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.rate))
    .attr("fill", d => stateColourScaleKnime(d.state))
    .on("mousemove", (event, d) => {
      tooltipKnime
        .style("opacity", 1)
        .html(
          `<strong>${d.state}</strong><br>Rate: ${formatNumberKnime(d.rate)}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseleave", () => tooltipKnime.style("opacity", 0));
}
