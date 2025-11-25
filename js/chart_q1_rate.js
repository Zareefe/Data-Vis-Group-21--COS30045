// chart_q1_rate.js
function drawQ1Rate(data, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || !data.length) {
    container.append("p").text("No Q1 data available.");
    return;
  }

  // ensure fields exist
  const rows = data.map(d => ({ state: d.state, rate: +d.rate_per_10000 }));

  // sort descending
  rows.sort((a,b)=> d3.descending(a.rate, b.rate));

  const { chart, innerWidth, innerHeight } = createSVG(selector, Math.max(320, rows.length * 26 + 80));
  const marginLeft = 140;

  // horizontal bar => x is value, y is band
  const x = d3.scaleLinear().domain([0, d3.max(rows, d=>d.rate)]).range([0, innerWidth]);
  const y = d3.scaleBand().domain(rows.map(d=>d.state)).range([0, innerHeight]).padding(0.15);

  chart.append("g").attr("transform", `translate(0,${0})`).call(d3.axisLeft(y).tickSize(0)).selectAll("text").attr("font-size","12px");
  chart.append("g").attr("transform",`translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(6)).selectAll("text").attr("font-size","11px");

  const bars = chart.selectAll("rect").data(rows).enter().append("rect")
    .attr("x", 0)
    .attr("y", d=> y(d.state))
    .attr("height", y.bandwidth())
    .attr("width", d => x(d.rate))
    .attr("fill", (d,i) => i < 3 ? "#1f71d8" : "#88b6e8")
    .on("mousemove", (event,d) => tooltip.style("opacity",1).html(`<strong>${d.state}</strong><br/>Rate: ${d.rate.toFixed(2)} per 10,000`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px"))
    .on("mouseleave", ()=> tooltip.style("opacity",0));

  // labels on end
  chart.selectAll("text.barlabel").data(rows).enter().append("text").attr("class","barlabel")
    .attr("x", d => x(d.rate) + 6).attr("y", d => y(d.state) + y.bandwidth()/2 + 4)
    .text(d => d.rate.toFixed(2)).attr("font-size","11px").attr("fill","#243145");
}
