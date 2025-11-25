// scatter: correlate fines vs arrests or rate vs fines if available
function drawScatter(data, selector, xKey, yKey, rKey) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || data.length === 0) { container.append("p").text("No scatter data"); return; }

  const rows = data.map(d => ({
    x: +(d[xKey] || d.X || d.fines || 0),
    y: +(d[yKey] || d.Y || d.arrests || 0),
    r: +(d[rKey] || d.Charges || 1),
    label: d.Jurisdiction || d.state || d.jurisdiction || ""
  }));

  const { chart, innerWidth, innerHeight } = createSVG(selector, 320);
  const x = d3.scaleLinear().domain([0, d3.max(rows, d=>d.x)]).nice().range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(rows, d=>d.y)]).nice().range([innerHeight, 0]);
  const r = d3.scaleSqrt().domain([0, d3.max(rows, d=>d.r)]).range([3, 18]);

  chart.append("g").attr("transform",`translate(0,${innerHeight})`).call(d3.axisBottom(x).tickFormat(formatNumber));
  chart.append("g").call(d3.axisLeft(y).tickFormat(formatNumber));

  chart.selectAll("circle").data(rows).enter().append("circle")
    .attr("cx", d=> x(d.x)).attr("cy", d=> y(d.y)).attr("r", d=> r(d.r))
    .attr("fill", d=> stateColourScale(d.label)).attr("opacity",0.85)
    .on("mousemove", (event,d)=> tooltip.style("opacity",1).html(`<strong>${d.label}</strong><br/>x: ${formatNumber(d.x)}<br/>y: ${formatNumber(d.y)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-26)+"px"))
    .on("mouseleave", ()=> tooltip.style("opacity",0));
}
