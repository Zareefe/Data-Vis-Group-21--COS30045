let mobileData = [];

d3.csv("data/police_enforcement_2024_fines-1.csv", d => ({
    year: +d.YEAR,
    start_date: d.START_DATE,
    end_date: d.END_DATE,
    state: d.JURISDICTION,
    location: d.LOCATION,
    age_group: d.AGE_GROUP,
    metric: d.METRIC,
    method: d.DETECTION_METHOD,
    fines: +d.FINES,
    arrests: +d.ARRESTS,
    charges: +d.CHARGES
}))
.then(data => {

    // 🔍 FILTER for mobile phone offences only
    mobileData = data.filter(d => d.metric === "mobile_phone_use");

    console.log("Mobile phone data:", mobileData);

    drawAgeChart(mobileData);
    drawStateChart(mobileData);
    drawMonthlyChart(mobileData);

});
