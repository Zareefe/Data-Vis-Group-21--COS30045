// drawTrendKnime - expects q2 data with columns like: Jurisdiction/State, Year, Fines (or Rate)
function drawTrendKnime(data, selector, slopeInfoSelector) {
  const container = d3.select(selector);
  container.selectAll("*").remove();
  if (!data || data.length === 0) { container.append("p").text("No Q2 trend data."); return; }

  // build nested series
  // try to handle multiple column name variants
  const yearKey = data.columns.includes("Year") ? "Year" : (data.columns.includes("year") ? "year" : (data.columns.includes("YEAR") ? "YEAR" : "Year"));
  const stateKey = data.columns.includes("Jurisdiction") ? "Jurisdiction" : (data.columns.includes("State") ? "State" : (data.columns.includes("state") ? "state" : data.columns[0]));
  const valueKey = data.columns.find(c => /rate|fines|value|count/i.test(c)) || data.columns[2];

  const nested = d3.group(data, d => d[stateKey]);
  const series = [];
  nested.forEach((rows, state) => {
    const vals = rows.map(r => ({ year: +r[yearKey], value: +r[valueKey] || 0 })).sort((a,b)=>a.year-b.year);
    series.push({ state, values: vals });
  });

  const years = Array.from(new Set(data.map(d=> +d[yearKey]))).sort();
  const maxY = d3.max(series, s => d3.max(s.values, v=> v.value));

  const { chart, innerWidth, innerHeight } = createSVG(selector, 380);
  const x = d3.scaleLinear().domain([d3.min(years), d3.max(years)]).range([0, innerWidth]);
  const y = d3.scaleLinear().domain([0, maxY]).nice().range([innerHeight, 0]);

  chart.append("g").attr("transform", `translate(0,${innerHeight})`).call(d3.axisBottom(x).tickFormat(d3.format("d")));
  chart.append("g").call(d3.axisLeft(y).tickFormat(formatNumber));

  const line = d3.line().x(d=>x(d.year)).y(d=>y(d.value)).curve(d3.curveMonotoneX);

  const g = chart.selectAll(".series").data(series).enter().append("g").attr("class","series");
  g.append("path").attr("d", d=> line(d.values)).attr("fill","none").attr("stroke", d=> stateColourScale(d.state)).attr("stroke-width",1.6).attr("opacity",0.9);

  // slope calculation (linear regression) per series
  const slopes = [];
  series.forEach(s => {
    const xs = s.values.map(v=>v.year);
    const ys = s.values.map(v=>v.value);
    if (xs.length > 1) {
      const meanX = d3.mean(xs), meanY = d3.mean(ys);
      let num=0, den=0;
      for (let i=0;i<xs.length;i++){ num += (xs[i]-meanX)*(ys[i]-meanY); den += (xs[i]-meanX)*(xs[i]-meanX); }
      const slope = den === 0 ? 0 : num/den;
      slopes.push({ state: s.state, slope });
    }
  });

  // show top improving (most negative slope) and top worsening (most positive slope)
  slopes.sort((a,b)=> a.slope - b.slope);
  const topImprove = slopes.slice(0,3).map(s=>`${s.state} (${s.slope.toFixed(2)})`).join(", ");
  const topWorse = slopes.slice(-3).reverse().map(s=>`${s.state} (${s.slope.toFixed(2)})`).join(", ");
  if (slopeInfoSelector) d3.select(slopeInfoSelector).html(`<strong>Top improving:</strong> ${topImprove} <br/><strong>Top worsening:</strong> ${topWorse}`);
}
