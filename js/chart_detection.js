// chart_detection.js
// drawDetectionStack(data, selector) draws stacked bars per state with methods as stacks
// drawPieDetection(data, selector) draws pie of method shares across data

function drawDetectionStack(flatData, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!flatData || !flatData.length) { container.append("p").text("No detection data."); return; }

  // pivot: state x method -> sum value
  const methods = Array.from(new Set(flatData.map(d=>d.method))).sort();
  const states = Array.from(new Set(flatData.map(d=>d.state))).sort();

  const pivot = states.map(s => {
    const row = { state: s };
    methods.forEach(m => {
      row[m] = d3.sum(flatData.filter(d => d.state === s && d.method === m), d => + (d.value || d.fines || d.count || 0));
    });
    return row;
  });

  const stack = d3.stack().keys(methods);
  const series = stack(pivot);

  const { chart, innerWidth, innerHeight } = createSVG(selector, 360);
  const x = d3.scaleBand().domain(states).range([0, innerWidth]).padding(0.12);
  const y = d3.scaleLinear().domain([0, d3.max(pivot, r => methods.reduce((s,m)=>s + r[m],0))]).nice().range([innerHeight,0]);
  const color = d3.scaleOrdinal().domain(methods).range(d3.schemeTableau10);

  chart.append("g").attr("transform",`translate(0,${innerHeight})`).call(d3.axisBottom(x)).selectAll("text").attr("font-size","11px");
  chart.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(formatNumber));

  const g = chart.selectAll("g.series").data(series).enter().append("g").attr("fill", d=> color(d.key));
  g.selectAll("rect").data(d => d).enter().append("rect")
    .attr("x", d => x(d.data.state))
    .attr("y", d => y(d[1]))
    .attr("height", d => y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mousemove", (event, d) => {
      const method = d3.select(event.currentTarget.parentNode).datum().key;
      const val = d.data[method];
      tooltip.style("opacity",1).html(`<strong>${d.data.state}</strong><br/>${method}: ${formatNumber(val)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px");
    }).on("mouseleave", ()=> tooltip.style("opacity",0));

  // legend
  const legend = chart.append("g").attr("transform", `translate(${innerWidth-120}, -10)`);
  methods.forEach((m,i) => {
    const gg = legend.append("g").attr("transform", `translate(0, ${i*18})`);
    gg.append("rect").attr("x",0).attr("y",0).attr("width",12).attr("height",12).attr("fill", color(m));
    gg.append("text").attr("x", 18).attr("y", 10).text(m).attr("font-size","11px").attr("fill","#4a5873");
  });
}

// small pie for detection distribution (global)
function drawPieDetection(flatData, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!flatData || !flatData.length) { container.append("p").text("No detection data."); return; }

  const byMethod = d3.rollups(flatData, vs => d3.sum(vs, d => + (d.value || d.fines || d.count || 0)), d => d.method)
    .map(([method,total]) => ({ method, total }));
  const { chart, innerWidth } = createSVG(selector, 260);
  const radius = Math.min(innerWidth, 260)/3;
  const g = chart.append("g").attr("transform", `translate(${innerWidth/2},120)`);
  const pie = d3.pie().value(d=>d.total);
  const arc = d3.arc().innerRadius(radius*0.2).outerRadius(radius);
  const color = d3.scaleOrdinal().domain(byMethod.map(d=>d.method)).range(d3.schemeTableau10);
  g.selectAll("path").data(pie(byMethod)).enter().append("path").attr("d", arc).attr("fill", d=> color(d.data.method)).on("mousemove",(event,d)=> tooltip.style("opacity",1).html(`${d.data.method}<br/>${formatNumber(d.data.total)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px")).on("mouseleave",()=>tooltip.style("opacity",0));

  const legend = chart.append("g").attr("transform", `translate(${6},0)`);
  byMethod.forEach((m,i) => {
    legend.append("rect").attr("x",0).attr("y", i*18).attr("width",12).attr("height",12).attr("fill", color(m.method));
    legend.append("text").attr("x",18).attr("y", i*18+10).text(`${m.method} (${formatNumber(m.total)})`).attr("font-size","11px").attr("fill","#4a5873");
  });
}
