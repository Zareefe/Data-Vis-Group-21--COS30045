// chart_q1_rate.js (uses utils_knime.js)
// Q1: Rate per 10,000 licences with interactive year filter

let q1AllData = []; // Store all data globally for filtering

function drawQ1Rate(rows, selector) {
  const el = d3.select(selector);
  el.selectAll("*").remove();

  if (!rows || rows.length === 0) {
    el.append("p").text("No Q1 data available.");
    return;
  }

  // Store data globally
  q1AllData = rows.filter(r => r.state && r.rate != null);

  // Create filter dropdown
  const filterContainer = el.append("div")
    .attr("class", "q1-filter-container");

  const years = ["All Years", ...Array.from(new Set(q1AllData.map(d => d.year))).filter(y => y != null).sort()];
  
  filterContainer.append("label")
    .attr("for", "q1YearFilter")
    .text("Select Year:");

  const select = filterContainer.append("select")
    .attr("id", "q1YearFilter")
    .attr("class", "q1-year-select")
    .on("change", function() {
      updateQ1Chart(this.value, selector);
    });

  select.selectAll("option")
    .data(years)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => d === "All Years" ? "All Years (Average)" : d);

  // Create chart container
  const chartDiv = el.append("div")
    .attr("class", "q1-chart-wrapper");

  // Initial render with all years
  updateQ1Chart("All Years", selector);
}

function updateQ1Chart(selectedYear, selector) {
  const chartDiv = d3.select(selector).select(".q1-chart-wrapper");
  chartDiv.selectAll("*").remove();

  ensureTooltipKnime();

  let filteredData = q1AllData;

  // Filter or aggregate based on selection
  let data;
  if (selectedYear === "All Years") {
    // Aggregate by state (average rate across all years)
    const byState = d3.rollup(
      filteredData,
      v => d3.mean(v, d => d.rate),
      d => d.state
    );
    data = Array.from(byState, ([state, rate]) => ({ state, rate }))
      .sort((a, b) => d3.descending(a.rate, b.rate));
  } else {
    // Filter to specific year
    const yearNum = +selectedYear;
    data = filteredData
      .filter(d => d.year === yearNum)
      .map(d => ({ state: d.state, rate: d.rate }))
      .sort((a, b) => d3.descending(a.rate, b.rate));
  }

  if (data.length === 0) {
    chartDiv.append("p").text("No data available for selected year.");
    return;
  }

  const H = Math.max(280, data.length * 32 + 60);
  const margin = { top: 10, right: 20, bottom: 40, left: 80 };
  const width = chartDiv.node().getBoundingClientRect().width || 600;
  const height = H;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = chartDiv
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3
    .scaleBand()
    .domain(data.map(d => d.state))
    .range([0, innerHeight])
    .padding(0.15);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.rate)])
    .range([0, innerWidth])
    .nice();

  // Add axes
  chart.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));
  
  chart
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x));

  // Add bars with animation
  chart
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.state))
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", d => stateColourScaleKnime(d.state))
    .attr("rx", 4)
    .style("cursor", "pointer")
    .on("mousemove", (event, d) => {
      tooltipKnime
        .style("opacity", 1)
        .html(
          `<strong>${d.state}</strong><br/>Rate: <span style="color:#3b6bbf;font-weight:600">${formatNumberKnime(d.rate)}</span> per 10k${selectedYear !== "All Years" ? `<br/>Year: ${selectedYear}` : '<br/>(Average)'}`
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
      
      d3.select(event.currentTarget)
        .transition()
        .duration(150)
        .attr("opacity", 0.8);
    })
    .on("mouseleave", (event) => {
      tooltipKnime.style("opacity", 0);
      d3.select(event.currentTarget)
        .transition()
        .duration(150)
        .attr("opacity", 1);
    })
    .transition()
    .duration(800)
    .delay((d, i) => i * 50)
    .attr("width", d => x(d.rate));
}