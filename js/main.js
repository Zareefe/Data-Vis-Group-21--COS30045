// main.js - loads raw dataset for overview and KNIME outputs for research charts

// Raw data (overview)
const RAW_PATH = "/mnt/data/police_enforcement_2024_fines.csv";

// KNIME outputs (research)
const Q1_PATH = "/mnt/data/Q1_per10000.csv";
const Q2_PATH = "/mnt/data/Q2_trend.csv";
const Q3_PATH = "/mnt/data/Q3_covidtrend.csv";
const Q4_PATH = "/mnt/data/Q4_detection.csv";
const Q5_PATH = "/mnt/data/Q5excel_Processes.csv";

let rawData = [];
let q1data = [], q2data = [], q3data = [], q4data = [], q5data = [];

// load raw and knime data in parallel
Promise.all([
  d3.csv(RAW_PATH, d => ({
    year: +d.YEAR || safeParseFloat(d.Year) || null,
    start_date: d.START_DATE || d.Start_Date || d.start_date,
    state: d.JURISDICTION || d.jurisdiction || d.state,
    age_group: d.AGE_GROUP || d.Age_Group,
    method: d.DETECTION_METHOD || d.method,
    fines: safeParseFloat(d.FINES || d.Fines || d.fines),
    arrests: safeParseFloat(d.ARRESTS || d.Arrests || d.arrests),
    charges: safeParseFloat(d.CHARGES || d.Charges || d.charges)
  })),
  d3.csv(Q1_PATH),
  d3.csv(Q2_PATH),
  d3.csv(Q3_PATH),
  d3.csv(Q4_PATH),
  d3.csv(Q5_PATH)
]).then(results => {
  rawData = results[0];
  q1data = results[1];
  q2data = results[2];
  q3data = results[3];
  q4data = results[4];
  q5data = results[5];

  // init pages depending on DOM
  if (document.getElementById("overview-page")) initOverviewPage();
  if (document.getElementById("jurisdiction-page")) initJurisdictionPage();
  if (document.getElementById("trend-page")) initTrendPage();
}).catch(err => {
  console.error("Data load error:", err);
  alert("Failed to load datasets. Check file paths in main.js.");
});

// -------- Overview page (keeps raw charts, adds light KNIME previews) --------
function initOverviewPage() {
  // populate filters for raw dataset
  const years = [...new Set(rawData.map(d=>d.year).filter(Boolean))].sort();
  const yearSel = document.getElementById("ovYearFilter");
  years.forEach(y => { const o=document.createElement("option"); o.value=o.textContent=y; yearSel.appendChild(o); });

  const states = [...new Set(rawData.map(d=>d.state).filter(Boolean))].sort();
  const stateSel = document.getElementById("ovStateFilter");
  states.forEach(s => { const o=document.createElement("option"); o.value=o.textContent=s; stateSel.appendChild(o); });

  const methods = [...new Set(rawData.map(d=>d.method).filter(Boolean))].sort();
  const methodSel = document.getElementById("ovMethodFilter");
  methods.forEach(m => { const o=document.createElement("option"); o.value=o.textContent=m; methodSel.appendChild(o); });

  const ages = [...new Set(rawData.map(d=>d.age_group).filter(Boolean))].sort();
  const ageSel = document.getElementById("ovAgeFilter");
  ages.forEach(a => { const o=document.createElement("option"); o.value=o.textContent=a; ageSel.appendChild(o); });

  // reset button
  document.getElementById("ovResetBtn").addEventListener("click", () => {
    yearSel.value="All"; stateSel.value="All"; methodSel.value="All"; ageSel.value="All";
    renderOverview();
  });

  // render initially
  renderOverview();
}

function renderOverview() {
  // no filters for briefness — use rawData directly
  const filtered = rawData;
  // summary
  const total = d3.sum(filtered, d=>d.fines);
  document.getElementById("ovTotalFines").textContent = formatNumber(total);
  document.getElementById("ovPoliceFines").textContent = formatNumber(d3.sum(filtered.filter(d=>d.method && d.method.toLowerCase().includes("police")), d=>d.fines));
  document.getElementById("ovCameraFines").textContent = formatNumber(d3.sum(filtered.filter(d=>d.method && d.method.toLowerCase().includes("camera")), d=>d.fines));
  document.getElementById("ovArrests").textContent = formatNumber(d3.sum(filtered, d=>d.arrests));
  document.getElementById("ovCharges").textContent = formatNumber(d3.sum(filtered, d=>d.charges));

  // draw raw charts
  drawAgeChart(filtered, "#ovAgeChart");
  drawJurisdictionChart(filtered, "#ovJurisdictionChart");
  drawMonthlyChart(filtered, "#ovMonthChart", null);

  // draw lightweight KNIME previews (small)
  drawQ1Preview(q1data, "#ovQ1Preview");
  drawDetectionPiePreview(q4data, "#ovQ4Preview");
}

// preview helpers
function drawQ1Preview(data, selector) {
  // show top 3 jurisdictions by rate as a tiny bar
  if (!data || data.length===0) { d3.select(selector).text("No KNIME Q1 data"); return; }
  const sorted = data.map(d=>({state:d.Jurisdiction || d.state || d.jurisdiction, rate: + (d.Rate_per_10000 || d.rate || d.Rate || d.rate_per_10000 || d.RATE) || 0}))
    .sort((a,b)=>b.rate - a.rate).slice(0,3);
  const html = `<strong>Top rates</strong><ul style="margin:6px 0;padding-left:18px">${sorted.map(s=>`<li>${s.state}: ${formatNumber(s.rate)}</li>`).join("")}</ul>`;
  d3.select(selector).html(html);
}
function drawDetectionPiePreview(data, selector) {
  if (!data || data.length===0) { d3.select(selector).text("No Q4"); return; }
  // aggregate by method
  const agg = {};
  data.forEach(d => {
    const m = d.Method || d.method || d.Detection_Method || "Other";
    const v = + (d.Fines || d.fines || d.Value || d.value || 0);
    agg[m] = (agg[m]||0) + v;
  });
  const parts = Object.entries(agg).slice(0,3);
  const html = `<strong>Top methods</strong><ul style="margin:6px 0;padding-left:18px">${parts.map(p=>`<li>${p[0]}: ${formatNumber(p[1])}</li>`).join("")}</ul>`;
  d3.select(selector).html(html);
}

// -------- Jurisdiction page (existing raw chart + KNIME Q1/Q4 below) --------
function initJurisdictionPage() {
  // draw existing raw chart
  drawJurisdictionChart(rawData, "#existingJurisdiction");

  // draw Q1 & Q4 below (KNIME)
  drawQ1RateChart(q1data, "#q1RateChart");
  drawDetectionStack(q4data, "#q4StackedChart");
  drawPieDetection(q4data, "#q4PieChart");

  // compute highlight
  if (q1data && q1data.length) {
    const best = q1data.reduce((a,b) => (+ (a.Rate_per_10000 || a.rate || a.Rate || 0)) > (+ (b.Rate_per_10000 || b.rate || 0)) ? a : b);
    const state = best.Jurisdiction || best.state || best.jurisdiction;
    const rate = +(best.Rate_per_10000 || best.rate || best.Rate || 0);
    d3.select("#q1Top").html(`<strong>Top jurisdiction:</strong> ${state} — ${formatNumber(rate)} offences per 10,000 licences`);
  }
}

// -------- Trend page (existing + KNIME Q2/Q3/Q5 below) --------
function initTrendPage() {
  // draw existing raw trend (if you have chart_trend.js existing)
  // if you provided existingTrend container, use the existing chart file
  if (typeof drawTrendChart === "function") {
    drawTrendChart(rawData, "#existingTrend");
  }

  // KNIME charts
  drawTrendKnime(q2data, "#q2TrendChart", "#q2SlopeInfo");
  drawCovidArea(q3data, "#q3CovidChart");
  drawHeatmapQ5(q5data, "#q5Heatmap", "#q5Highlights");
}
