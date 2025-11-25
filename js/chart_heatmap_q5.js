// drawHeatmapQ5 expects a KNIME file with Year, Jurisdiction/State and Value (fines or rate)
function drawHeatmapQ5(data, selector, highlightsSelector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || data.length===0) { container.append("p").text("No Q5 data"); return; }

  // normalize fields
  const yearKey = data.columns.find(c => /year/i.test(c)) || data.columns[1];
  const stateKey = data.columns.find(c => /juris|state/i.test(c)) || data.columns[0];
  const valueKey = data.columns.find(c => /rate|fines|value|count/i.test(c)) || data.columns[2];

  const years = Array.from(new Set(data.map(d=> +d[yearKey]))).sort();
  const states = Array.from(new Set(data.map(d=> d[stateKey]))).sort();

  const cells = [];
  states.forEach(s => {
    years.forEach(y => {
      const total = d3.sum(data.filter(d => d[stateKey] === s && +d[yearKey] === +y), d => + (d[valueKey] || 0));
      cells.push({ state:s, year:y, value: total });
    });
  });

  const maxVal = d3.max(cells, d=>d.value);
  const { chart, innerWidth } = createSVG(selector, Math.max(320, states.length*26 + 120));
  const cellW = innerWidth / years.length;
  const cellH = Math.min(28, 320 / (states.length || 5));

  const xScale = d3.scaleBand().domain(years).range([0, innerWidth]);
  const yScale = d3.scaleBand().domain(states).range([0, states.length * cellH]);

  const color = d3.scaleSequential().domain([0, maxVal]).interpolator(d3.interpolateBlues);

  const grid = chart.append("g").attr("transform", "translate(0,10)");
  const rows = grid.selectAll("g.row").data(states).enter().append("g").attr("class","row").attr("transform",(d,i)=>`translate(0,${i*cellH})`);
  rows.selectAll("rect").data(s => years.map(y => {
    const val = d3.sum(data.filter(d => d[stateKey] === s && +d[yearKey] === +y), d => +(d[valueKey] || 0));
    return { state:s, year:y, value:val };
  })).enter().append("rect")
    .attr("x", d => xScale(d.year))
    .attr("y", 0)
    .attr("width", cellW - 2)
    .attr("height", cellH - 2)
    .attr("fill", d => color(d.value))
    .on("mousemove", (event,d)=> tooltip.style("opacity",1).html(`<strong>${d.state}</strong><br/>${d.year}: ${formatNumber(d.value)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-26)+"px"))
    .on("mouseleave", ()=> tooltip.style("opacity",0));

  // axes labels
  chart.append("g").attr("transform", `translate(0, ${states.length * cellH + 14})`)
    .selectAll("text").data(years).enter().append("text")
    .attr("x", (d,i)=> xScale(d) + cellW/2).attr("y", 12).attr("text-anchor","middle").attr("fill","#4a5873").text(d=>d);

  chart.append("g").attr("transform", "translate(-6,0)").selectAll("text").data(states).enter().append("text")
    .attr("x", 0).attr("y", (d,i)=> i*cellH + (cellH/2) + 4).attr("text-anchor","end").attr("fill","#4a5873").text(d=>d);

  // compute improvement score: slope of year vs value
  const improvements = states.map(s => {
    const rows = years.map(y => ({ x: y, y: d3.sum(data.filter(d => d[stateKey]===s && +d[yearKey]===+y), d => + (d[valueKey] || 0)) }));
    const xs = rows.map(r=>r.x), ys = rows.map(r=>r.y);
    const meanX = d3.mean(xs), meanY = d3.mean(ys);
    let num=0, den=0;
    for (let i=0;i<xs.length;i++){ num += (xs[i]-meanX)*(ys[i]-meanY); den += (xs[i]-meanX)*(xs[i]-meanX); }
    const slope = den === 0 ? 0 : num/den;
    return { state: s, slope };
  });
  improvements.sort((a,b)=> a.slope - b.slope);
  const best = improvements.slice(0,3).map(i=> `${i.state} (${i.slope.toFixed(2)})`).join(", ");
  const worst = improvements.slice(-3).reverse().map(i=> `${i.state} (${i.slope.toFixed(2)})`).join(", ");
  if (highlightsSelector) d3.select(highlightsSelector).html(`<strong>Best improvement:</strong> ${best}<br/><strong>Worst decline:</strong> ${worst}`);
}
