// chart_scatter_knime.js (KNIME-only scatter)

function drawScatterKnime(rows, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  ensureTooltipKnime();

  if (!rows || rows.length === 0) { container.append("p").text("No scatter data."); return; }

  const H = 360;
  const { chart, innerWidth, innerHeight } = createSVGKnime(selector, H);

  const x = d3.scaleLinear().domain([0, d3.max(rows, d=> d.fines) || 1]).nice().range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(rows, d=> d.arrests) || 1]).nice().range([innerHeight,0]);
  const rScale = d3.scaleSqrt().domain([0, d3.max(rows, d=> d.charges) || 1]).range([4,20]);

  chart.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickFormat(formatNumberKnime));
  chart.append("g").call(d3.axisLeft(y).tickFormat(formatNumberKnime));

  chart.selectAll("circle").data(rows).enter().append("circle")
    .attr("cx", d => x(d.fines)).attr("cy", d => y(d.arrests)).attr("r", d => rScale(d.charges))
    .attr("fill", d => stateColourScaleKnime(d.state)).attr("opacity", 0.9)
    .on("mousemove", (event, d) => {
      tooltipKnime.style("opacity",1).html(`<strong>${d.state}</strong><br/>Fines: ${formatNumberKnime(d.fines)}<br/>Arrests: ${formatNumberKnime(d.arrests)}<br/>Charges: ${formatNumberKnime(d.charges)}`)
        .style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px");
    }).on("mouseleave", () => tooltipKnime.style("opacity",0));
}
