// chart_heatmap_q5.js (KNIME heatmap)

function drawHeatmapQ5(rows, selector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  ensureTooltipKnime();

  if (!rows || rows.length === 0) { container.append("p").text("No Q5 data."); return; }

  const states = Array.from(new Set(rows.map(r => r.state || "Unknown"))).sort();
  const years = Array.from(new Set(rows.map(r => r.year).filter(Boolean))).sort((a,b)=>a-b);
  if (years.length === 0) { container.append("p").text("No year information found."); return; }

  // build cells
  const cells = [];
  states.forEach(s => {
    years.forEach(y => {
      const total = d3.sum(rows.filter(r => (r.state||"Unknown") === s && r.year === y), d => d.total || 0);
      cells.push({ state: s, year: y, total });
    });
  });

  const maxVal = d3.max(cells, d => d.total);
  const color = d3.scaleSequential().domain([0, maxVal || 1]).interpolator(d3.interpolateBlues);

  const cellW = Math.max(48, 760 / Math.max(1, years.length));
  const cellH = 28;
  const height = states.length * cellH + 110;
  const { chart, innerWidth } = createSVGKnime(selector, height);

  const x = d3.scaleBand().domain(years).range([0, years.length * cellW]);
  const y = d3.scaleBand().domain(states).range([0, states.length * cellH]);

  const grid = chart.append("g").attr("transform", "translate(0,10)");
  states.forEach((s, si) => {
    const rowG = grid.append("g").attr("transform", `translate(0, ${si * cellH})`);
    years.forEach((yr, yi) => {
      const total = d3.sum(rows.filter(r => (r.state||"Unknown") === s && r.year === yr), d => d.total || 0);
      rowG.append("rect")
        .attr("x", x(yr))
        .attr("y", 0)
        .attr("width", x.bandwidth() - 2)
        .attr("height", cellH - 2)
        .attr("fill", color(total))
        .attr("class", "heatmap-cell")
        .on("mousemove", (event) => {
          tooltipKnime.style("opacity",1).html(`<strong>${s}</strong><br/>${yr}: ${formatNumberKnime(total)}`)
            .style("left",(event.pageX+10)+"px").style("top",(event.pageY-28)+"px");
        })
        .on("mouseleave", () => tooltipKnime.style("opacity",0));
    });
  });

  // x labels
  chart.append("g").attr("transform", `translate(0, ${states.length * cellH + 18})`)
    .selectAll("text").data(years).enter().append("text")
    .attr("x", d => x(d) + x.bandwidth()/2).attr("y", 12).attr("text-anchor","middle")
    .text(d => d).attr("class","heatmap-year-label");

  // y labels
  chart.append("g").attr("transform","translate(-8,0)")
    .selectAll("text").data(states).enter().append("text")
    .attr("x", 0).attr("y", (d,i)=> i*cellH + (cellH/2) + 4).attr("text-anchor","end").text(d=>d)
    .attr("class","heatmap-state-label");

  // legend
  const legendW = Math.min(200, innerWidth);
  const legend = chart.append("g").attr("transform", `translate(${innerWidth - legendW - 10}, ${states.length * cellH + 40})`);
  const gradId = `heatmapGrad_${Math.floor(Math.random()*10000)}`;
  const defs = chart.append("defs");
  const grad = defs.append("linearGradient").attr("id", gradId);
  grad.append("stop").attr("offset","0%").attr("stop-color", color(0));
  grad.append("stop").attr("offset","100%").attr("stop-color", color(maxVal || 1));
  legend.append("rect").attr("x",0).attr("y",0).attr("width",legendW).attr("height",10).style("fill", `url(#${gradId})`);
  legend.append("text").attr("x",0).attr("y",28).text("Low").attr("font-size","11px").attr("fill","#4a5873");
  legend.append("text").attr("x",legendW).attr("y",28).text("High").attr("font-size","11px").attr("fill","#4a5873").attr("text-anchor","end");
}
