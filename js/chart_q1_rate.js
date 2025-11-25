// chart_q1_rate.js
// expects KNIME file with at least: Jurisdiction (or state) and Rate_per_10000 (or rate_per_10000)
function drawQ1RateChart(data, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || data.length === 0) {
    container.append("p").text("No Q1 result available.");
    return;
  }

  // normalize column names
  const rows = data.map(d=>({
    state: d.Jurisdiction || d.state || d.jurisdiction,
    rate: + (d.Rate_per_10000 || d.rate || d.Rate || d.rate_per_10000 || 0),
    fines: + (d.Fines || d.fines || d.TotalFines || 0)
  })).filter(d=>d.state);

  rows.sort((a,b)=>b.rate - a.rate);

  const { chart, innerWidth, innerHeight } = createSVG(selector, 320);
  const y = d3.scaleBand().domain(rows.map(d=>d.state)).range([0, innerHeight]).padding(0.15);
  const x = d3.scaleLinear().domain([0, d3.max(rows,d=>d.rate)]).range([0, innerWidth]);

  chart.append("g").call(d3.axisLeft(y));
  chart.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(5).tickFormat(formatNumber));

  chart.selectAll("rect").data(rows).enter().append("rect")
    .attr("y", d=>y(d.state))
    .attr("height", y.bandwidth())
    .attr("x", 0)
    .attr("width", d=> x(d.rate))
    .attr("fill", d => stateColourScale(d.state))
    .on("mousemove", (event,d) => tooltip.style("opacity",1).html(`<strong>${d.state}</strong><br/>Rate: ${formatNumber(d.rate)} per 10,000<br/>Fines: ${formatNumber(d.fines)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-26)+"px"))
    .on("mouseleave", ()=> tooltip.style("opacity",0));

  chart.append("text").attr("x", innerWidth/2).attr("y", innerHeight + 44).attr("text-anchor","middle").attr("fill","#4a5873").text("Offences per 10,000 licences");
}
