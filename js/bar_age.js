function drawAgeChart(data) {

    const grouped = d3.rollups(
        data,
        v => d3.sum(v, d => d.fines),
        d => d.age_group
    ).map(d => ({ age_group: d[0], total: d[1] }));

    const { chart, innerWidth, innerHeight } = createSVG("#chart_age");

    const x = d3.scaleBand()
        .domain(grouped.map(d => d.age_group))
        .range([0, innerWidth])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(grouped, d => d.total)])
        .range([innerHeight, 0]);

    chart.selectAll("rect")
        .data(grouped)
        .enter()
        .append("rect")
        .attr("x", d => x(d.age_group))
        .attr("y", d => y(d.total))
        .attr("width", x.bandwidth())
        .attr("height", d => innerHeight - y(d.total))
        .attr("fill", "#2f78c5");

    chart.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x));

    chart.append("g")
        .call(d3.axisLeft(y));
}
