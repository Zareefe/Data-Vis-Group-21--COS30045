function drawStateChart(data) {

    const grouped = d3.rollups(
        data,
        v => d3.sum(v, d => d.fines),
        d => d.state
    ).map(d => ({ state: d[0], total: d[1] }));

    const { chart, innerWidth, innerHeight } = createSVG("#chart_state");

    const x = d3.scaleBand()
        .domain(grouped.map(d => d.state))
        .range([0, innerWidth])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(grouped, d => d.total)])
        .range([innerHeight, 0]);

    chart.selectAll("rect")
        .data(grouped)
        .enter()
        .append("rect")
        .attr("x", d => x(d.state))
        .attr("y", d => y(d.total))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.total))
        .attr("fill", "#0f60b6");

    chart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

    chart.append("g")
        .call(d3.axisLeft(y));
}
