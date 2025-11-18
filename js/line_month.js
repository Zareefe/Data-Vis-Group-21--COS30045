function drawMonthlyChart(data) {

    const grouped = d3.rollups(
        data,
        v => d3.sum(v, d => d.fines),
        d => new Date(d.start_date).getMonth() + 1
    ).map(d => ({ month: d[0], total: d[1] }))
    .sort((a, b) => a.month - b.month);

    const { chart, innerWidth, innerHeight } = createSVG("#chart_month");

    const x = d3.scaleLinear()
        .domain([1, 12])
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(grouped, d => d.total)])
        .range([innerHeight, 0]);

    const line = d3.line()
        .x(d => x(d.month))
        .y(d => y(d.total))
        .curve(d3.curveMonotoneX);

    chart.append("path")
        .datum(grouped)
        .attr("fill", "none")
        .attr("stroke", "#398eea")
        .attr("stroke-width", 3)
        .attr("d", line);

    chart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).ticks(12));

    chart.append("g")
        .call(d3.axisLeft(y));
}
