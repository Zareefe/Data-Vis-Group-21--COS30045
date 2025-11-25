// chart_detection.js
// expects KNIME q4 with columns: Jurisdiction/State, Method, Fines (or Value)
function drawDetectionStack(data, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || data.length === 0) { container.append("p").text("No detection data."); return; }

  // pivot: state x method
  const methods = Array.from(new Set(data.map(d=> d.Method || d.method || d.Detection_Method || "Other")));
  const states = Array.from(new Set(data.map(d=> d.Jurisdiction || d.state || d.jurisdiction))).sort();
  const pivot = states.map(s=>{
    const obj = { state:s };
    methods.forEach(m=>{
      const total = d3.sum(data.filter(d=> (d.Jurisdiction||d.state)===s && (d.Method||d.method)===m), d=> +(d.Fines||d.fines||d.Value||0));
      obj[m] = total;
    });
    return obj;
  });

  const stack = d3.stack().keys(methods)(pivot);

  const { chart, innerWidth, innerHeight } = createSVG(selector, 360);
  const x = d3.scaleBand().domain(states).range([0, innerWidth]).padding(0.18);
  const y = d3.scaleLinear().domain([0, d3.max(pivot, d=> methods.reduce((s,m)=> s + d[m],0))]).nice().range([innerHeight,0]);

  chart.append("g").attr("transform",`translate(0,${innerHeight})`).call(d3.axisBottom(x));
  chart.append("g").call(d3.axisLeft(y).tickFormat(formatNumber));

  const color = d3.scaleOrdinal().domain(methods).range(d3.schemeTableau10);

  const groups = chart.selectAll("g.series").data(stack).enter().append("g").attr("fill", d=> color(d.key));
  groups.selectAll("rect").data(d=>d).enter().append("rect")
    .attr("x", d=> x(d.data.state))
    .attr("y", d=> y(d[1]))
    .attr("height", d=> y(d[0]) - y(d[1]))
    .attr("width", x.bandwidth())
    .on("mousemove", (event,d)=> {
      const method = d3.select(event.currentTarget.parentNode).datum().key;
      const val = d.data[method];
      tooltip.style("opacity",1).html(`<strong>${d.data.state}</strong><br/>${method}: ${formatNumber(val)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-26)+"px");
    }).on("mouseleave", ()=> tooltip.style("opacity",0));

  // legend
  const legend = chart.append("g").attr("transform", `translate(${innerWidth-140}, -10)`);
  methods.forEach((m,i)=> {
    const g = legend.append("g").attr("transform", `translate(0, ${i*18})`);
    g.append("rect").attr("width",12).attr("height",12).attr("fill", color(m));
    g.append("text").attr("x",18).attr("y",10).attr("fill","#4a5873").attr("font-size","11px").text(m);
  });
}

// Pie for detection (overall share)
function drawPieDetection(data, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || data.length===0) { container.append("p").text("No detection data."); return; }

  const agg = d3.rollups(data, v=> d3.sum(v, d=> +(d.Fines || d.fines || d.Value || 0)), d=> d.Method || d.method || d.Detection_Method || "Other")
    .map(([method,total]) => ({method, total}));

  const { chart, innerWidth } = createSVG(selector, 240);
  const radius = Math.min(innerWidth, 240) / 3;
  const g = chart.append("g").attr("transform", `translate(${innerWidth/2},120)`);

  const pie = d3.pie().value(d=>d.total)(agg);
  const arc = d3.arc().innerRadius(radius*0.35).outerRadius(radius);
  const color = d3.scaleOrdinal().domain(agg.map(d=>d.method)).range(d3.schemeCategory10);

  const arcs = g.selectAll("g.arc").data(pie).enter().append("g").attr("class","arc");
  arcs.append("path").attr("d", arc).attr("fill", d=> color(d.data.method))
    .on("mousemove",(event,d)=> tooltip.style("opacity",1).html(`<strong>${d.data.method}</strong><br/>${formatNumber(d.data.total)}`).style("left",(event.pageX+10)+"px").style("top",(event.pageY-26)+"px"))
    .on("mouseleave", ()=> tooltip.style("opacity",0));

  // legend
  const legend = chart.append("g").attr("transform", `translate(${10}, -10)`);
  agg.forEach((a,i)=> {
    legend.append("rect").attr("x",0).attr("y",i*18).attr("width",12).attr("height",12).attr("fill", color(a.method));
    legend.append("text").attr("x",18).attr("y",i*18+12).attr("fill","#4a5873").attr("font-size","11px").text(`${a.method} (${formatNumber(a.total)})`);
  });
}
