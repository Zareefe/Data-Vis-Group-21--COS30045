// chart_covid_area.js (area with COVID shading)

function drawCovidArea(rows, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  ensureTooltipKnime();

  // build time series: prefer date field; fallback to year (Jan 1)
  const withDates = rows.map(r => {
    const copy = Object.assign({}, r);
    if (!copy.date) {
      if (copy.year) copy.date = new Date(+copy.year, 0, 1);
    }
    return copy;
  }).filter(r => r.date instanceof Date && !isNaN(r.date));

  if (withDates.length === 0) { container.append("p").text("No date series found."); return; }

  const aggregated = d3.rollups(withDates, vs => d3.sum(vs, d => d.total || 0), d => +d.date)
    .map(([t, total]) => ({ date: new Date(+t), total }))
    .sort((a,b)=> a.date - b.date);

  const H = 380;
  const { chart, innerWidth, innerHeight } = createSVGKnime(selector, H);
  const x = d3.scaleTime().domain(d3.extent(aggregated, d => d.date)).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(aggregated, d => d.total)]).nice().range([innerHeight, 0]);

  chart.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%b %Y")));
  chart.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(formatNumberKnime));

  // covid shade 2020-01 to 2021-12 (inclusive)
  const covidStart = new Date(2020,0,1), covidEnd = new Date(2021,11,31);
  const domain = x.domain();
  if (covidStart <= domain[1] && covidEnd >= domain[0]) {
    const left = x(Math.max(covidStart, domain[0]));
    const right = x(Math.min(covidEnd, domain[1]));
    chart.append("rect").attr("x", left).attr("y", 0).attr("width", Math.max(0, right-left)).attr("height", innerHeight).attr("fill", "#ffd9b3").attr("opacity", 0.28);
    chart.append("text").attr("x", left + 8).attr("y", 18).attr("fill", "#8a4b1e").text("COVID period (2020–2021)");
  }

  const area = d3.area().x(d => x(d.date)).y0(innerHeight).y1(d => y(d.total)).curve(d3.curveMonotoneX);
  chart.append("path").datum(aggregated).attr("d", area).attr("fill", "#ffe6d6").attr("opacity", 0.95);
  chart.append("path").datum(aggregated).attr("d", d3.line().x(d=>x(d.date)).y(d=>y(d.total)).curve(d3.curveMonotoneX)).attr("fill","none").attr("stroke","#d36b0c").attr("stroke-width",2);

  chart.selectAll("circle").data(aggregated).enter().append("circle")
    .attr("cx", d => x(d.date)).attr("cy", d => y(d.total)).attr("r", 3).attr("fill", "#fff").attr("stroke", "#d36b0c")
    .on("mousemove", (event, d) => {
      tooltipKnime.style("opacity",1).html(`<strong>${d3.timeFormat("%b %Y")(d.date)}</strong><br/>Fines: ${formatNumberKnime(d.total)}`)
        .style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px");
    }).on("mouseleave", () => tooltipKnime.style("opacity",0));
}

