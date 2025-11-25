// drawCovidArea - expects q3 CSV with Year & Month or YearMonth and Fines/Value
function drawCovidArea(data, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || data.length===0) { container.append("p").text("No Q3 data"); return; }

  // Try to find a date-like column or year+month
  const cols = data.columns;
  let parseDate;
  let points = [];

  if (cols.includes("YearMonth") || cols.includes("yearmonth") || cols.includes("Year_Month")) {
    const key = cols.find(c => /year.*month/i.test(c));
    points = data.map(d => {
      const parts = (d[key]+"").split(/[^0-9]/).filter(Boolean);
      const y = +parts[0], m = +parts[1] || 1;
      return { date: new Date(y, m-1, 1), value: + (d.Fines || d.fines || d.Value || d.value || d.Count || 0) };
    }).sort((a,b)=>a.date - b.date);
  } else if (cols.includes("Date") || cols.includes("date") || cols.includes("ObservationDate")) {
    const key = cols.find(c => /date/i.test(c));
    points = data.map(d => ({ date: new Date(d[key]), value: + (d.Fines || d.fines || d.Value || 0) })).sort((a,b)=>a.date - b.date);
  } else {
    // fallback: try Year and Month columns
    const yKey = cols.find(c => /year/i.test(c));
    const mKey = cols.find(c => /month/i.test(c));
    if (yKey && mKey) {
      points = data.map(d => ({ date: new Date(+d[yKey], +d[mKey]-1, 1), value: + (d.Fines || d.fines || d.Value || 0) })).sort((a,b)=>a.date - b.date);
    }
  }

  if (points.length === 0) { container.append("p").text("Could not parse Q3 dates."); return; }

  const { chart, innerWidth, innerHeight } = createSVG(selector, 360);
  const x = d3.scaleTime().domain(d3.extent(points, d=>d.date)).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, d3.max(points,d=>d.value)]).nice().range([innerHeight, 0]);

  chart.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).ticks(8).tickFormat(d3.timeFormat("%b %Y")));
  chart.append("g").call(d3.axisLeft(y).tickFormat(formatNumber));

  const area = d3.area().x(d=> x(d.date)).y0(innerHeight).y1(d=> y(d.value)).curve(d3.curveMonotoneX);
  chart.append("path").datum(points).attr("d", area).attr("fill","#cfe6ff");

  // draw line
  const line = d3.line().x(d=> x(d.date)).y(d=> y(d.value)).curve(d3.curveMonotoneX);
  chart.append("path").datum(points).attr("d", line).attr("fill","none").attr("stroke","#d36b0c").attr("stroke-width",2);

  // shaded covid zone 2020-01 to 2021-12
  const covidStart = new Date(2020,0,1), covidEnd = new Date(2021,11,31);
  const domain = x.domain();
  if (covidStart <= domain[1] && covidEnd >= domain[0]) {
    const left = x(Math.max(covidStart, domain[0]));
    const right = x(Math.min(covidEnd, domain[1]));
    chart.append("rect").attr("x", left).attr("y", 0).attr("width", Math.max(0,right-left)).attr("height", innerHeight).attr("fill","#ffe9d6").attr("opacity",0.45);
    chart.append("text").attr("x", left + 6).attr("y", 16).attr("fill","#8a4b1e").text("COVID period (2020–2021)");
  }

  // points for tooltip
  chart.selectAll("circle").data(points).enter().append("circle").attr("cx", d=>x(d.date)).attr("cy", d=>y(d.value)).attr("r",3).attr("fill","#fff").attr("stroke","#d36b0c")
    .on("mousemove",(event,d)=> tooltip.style("opacity",1).html(`${d3.timeFormat("%b %Y")(d.date)}<br/>${formatNumber(d.value)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-26)+"px"))
    .on("mouseleave",()=> tooltip.style("opacity",0));
}
