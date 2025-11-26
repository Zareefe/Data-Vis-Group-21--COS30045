// chart_detection.js (KNIME-only)
// Renders stacked bar and helper pie (stacked drawing used by main_knime.js)

function drawDetectionStack(rows, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  ensureTooltipKnime();

  if (!rows || rows.length === 0) {
    container.append("p").text("No detection data.");
    return;
  }

  // require state + method
  const data = rows.filter(r => r.state && r.method);
  if (data.length === 0) {
    container.append("p").text("No state/method pairs in data.");
    return;
  }

  const states = Array.from(new Set(data.map(d => d.state))).sort();
  const methods = Array.from(new Set(data.map(d => d.method))).sort();

  // pivot
  const pivot = states.map(s => {
    const obj = { state: s };
    methods.forEach(m => {
      obj[m] = d3.sum(data.filter(d => d.state === s && d.method === m), d => d.total || 0);
    });
    return obj;
  });

  const series = d3.stack().keys(methods)(pivot);

  const H = Math.max(360, states.length * 28 + 120);
  const { chart, innerWidth, innerHeight } = createSVGKnime(selector, H);

  const x = d3.scaleBand().domain(states).range([0, innerWidth]).padding(0.12);
  const y = d3.scaleLinear().domain([0, d3.max(pivot, d => methods.reduce((s,k)=> s + (d[k]||0),0))]).nice().range([innerHeight,0]);
  const color = d3.scaleOrdinal().domain(methods).range(d3.schemeTableau10);

  // axes
  chart.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x)).selectAll("text").attr("font-size","11px");
  chart.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(formatNumberKnime));

  // stacked bars
  const groups = chart.selectAll("g.series").data(series).enter().append("g").attr("fill", d => color(d.key));
  groups.selectAll("rect").data(d => d).enter().append("rect")
    .attr("x", d => x(d.data.state))
    .attr("y", d => y(d[1]))
    .attr("height", d => Math.max(0, y(d[0]) - y(d[1])))
    .attr("width", x.bandwidth())
    .on("mousemove", (event, d) => {
      const method = d3.select(event.currentTarget.parentNode).datum().key;
      const val = d.data[ d3.select(event.currentTarget.parentNode).datum().key ];
      tooltipKnime.style("opacity",1).html(`<strong>${d.data.state}</strong><br/>${method}: ${formatNumberKnime(val)}`)
        .style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px");
    })
    .on("mouseleave", () => tooltipKnime.style("opacity",0));

  // legend
  const legend = chart.append("g").attr("transform", `translate(${innerWidth - 160}, -10)`);
  methods.forEach((m,i) => {
    const gg = legend.append("g").attr("transform", `translate(0, ${i*18})`);
    gg.append("rect").attr("width",12).attr("height",12).attr("fill", color(m));
    gg.append("text").attr("x", 18).attr("y", 10).text(m).attr("font-size","11px").attr("fill","#4a5873");
  });
}

// helper pie (keeps consistent with KNIME utils)
function drawPieDetection(rows, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  ensureTooltipKnime();

  if (!rows || rows.length === 0) { container.append("p").text("No detection data."); return; }
  const byMethod = d3.rollups(rows, vs => d3.sum(vs, d => d.total || 0), d => d.method)
    .map(([method, total]) => ({ method, total })).sort((a,b)=> b.total - a.total);

  if (byMethod.length === 0) { container.append("p").text("No method totals."); return; }

  const size = 260;
  const { chart, innerWidth } = createSVGKnime(selector, size);
  const radius = Math.min(innerWidth, size) / 3;
  const g = chart.append("g").attr("transform", `translate(${innerWidth/2}, ${size/2 - 10})`);
  const pie = d3.pie().value(d => d.total);
  const arc = d3.arc().innerRadius(radius * 0.16).outerRadius(radius);
  const color = d3.scaleOrdinal().domain(byMethod.map(d=>d.method)).range(d3.schemeTableau10);

  g.selectAll("path").data(pie(byMethod)).enter().append("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.method))
    .on("mousemove", (event, d) => {
      tooltipKnime.style("opacity",1).html(`<strong>${d.data.method}</strong><br/>${formatNumberKnime(d.data.total)}`)
        .style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px");
    })
    .on("mouseleave", () => tooltipKnime.style("opacity",0));

  // legend
  const legend = chart.append("g").attr("transform", `translate(6,0)`);
  byMethod.forEach((m,i) => {
    legend.append("rect").attr("x",0).attr("y", i*18).attr("width",12).attr("height",12).attr("fill", color(m.method));
    legend.append("text").attr("x",18).attr("y", i*18+10).text(`${m.method} (${formatNumberKnime(m.total)})`).attr("font-size","11px").attr("fill","#4a5873");
  });
}
