// Shared data + page controllers

const DATA_PATH = "data/police_enforcement_2024_fines.csv";

let allMobileData = [];

// Load data then initialise whichever page is active
d3.csv(DATA_PATH, (d) => ({
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
})).then((rows) => {
  allMobileData = rows.filter((r) => r.metric === "mobile_phone_use");

  if (document.getElementById("overview-page")) {
    initOverviewPage();
  }
  if (document.getElementById("jurisdiction-page")) {
    initJurisdictionPage();
  }
  if (document.getElementById("trend-page")) {
    initTrendPage();
  }
});

// ----- Helper: build option list from data -----

function uniqueSorted(array) {
  return Array.from(new Set(array)).filter((v) => v != null && v !== "").sort();
}

// ----- OVERVIEW PAGE -----

function initOverviewPage() {
  const yearSel = document.getElementById("ovYearFilter");
  const stateSel = document.getElementById("ovStateFilter");
  const methodSel = document.getElementById("ovMethodFilter");
  const ageSel = document.getElementById("ovAgeFilter");
  const resetBtn = document.getElementById("ovResetBtn");

  const years = uniqueSorted(allMobileData.map((d) => d.year));
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  });

  const states = uniqueSorted(allMobileData.map((d) => d.state));
  states.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    stateSel.appendChild(opt);
  });

  const methods = uniqueSorted(allMobileData.map((d) => d.method));
  methods.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    methodSel.appendChild(opt);
  });

  const ages = uniqueSorted(allMobileData.map((d) => d.age_group));
  ages.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    ageSel.appendChild(opt);
  });

  const filters = {
    year: "All",
    state: "All",
    method: "All",
    age: "All"
  };

  yearSel.addEventListener("change", (e) => {
    filters.year = e.target.value;
    renderOverview(filters);
  });
  stateSel.addEventListener("change", (e) => {
    filters.state = e.target.value;
    renderOverview(filters);
  });
  methodSel.addEventListener("change", (e) => {
    filters.method = e.target.value;
    renderOverview(filters);
  });
  ageSel.addEventListener("change", (e) => {
    filters.age = e.target.value;
    renderOverview(filters);
  });
  resetBtn.addEventListener("click", () => {
    filters.year = "All";
    filters.state = "All";
    filters.method = "All";
    filters.age = "All";
    yearSel.value = "All";
    stateSel.value = "All";
    methodSel.value = "All";
    ageSel.value = "All";
    renderOverview(filters);
  });

  renderOverview(filters);
}

function applyFilters(data, filters) {
  let result = data;

  if (filters.year && filters.year !== "All") {
    const yearNum = +filters.year;
    result = result.filter((d) => d.year === yearNum);
  }
  if (filters.state && filters.state !== "All") {
    result = result.filter((d) => d.state === filters.state);
  }
  if (filters.method && filters.method !== "All") {
    result = result.filter((d) => d.method === filters.method);
  }
  if (filters.age && filters.age !== "All") {
    result = result.filter((d) => d.age_group === filters.age);
  }

  return result;
}

function updateOverviewSummary(data) {
  const totalFines = d3.sum(data, (d) => d.fines);
  const policeFines = d3.sum(
    data.filter(
      (d) => d.method && d.method.toLowerCase().includes("police")
    ),
    (d) => d.fines
  );
  const cameraFines = d3.sum(
    data.filter(
      (d) => d.method && d.method.toLowerCase().includes("camera")
    ),
    (d) => d.fines
  );
  const arrests = d3.sum(data, (d) => d.arrests);
  const charges = d3.sum(data, (d) => d.charges);

  document.getElementById("ovTotalFines").textContent =
    formatNumber(totalFines);
  document.getElementById("ovPoliceFines").textContent =
    formatNumber(policeFines);
  document.getElementById("ovCameraFines").textContent =
    formatNumber(cameraFines);
  document.getElementById("ovArrests").textContent = formatNumber(arrests);
  document.getElementById("ovCharges").textContent = formatNumber(charges);
}

function renderOverview(filters) {
  const filtered = applyFilters(allMobileData, filters);

  updateOverviewSummary(filtered);
  drawAgeChart(filtered, "#ovAgeChart");
  drawJurisdictionChart(filtered, "#ovJurisdictionChart");

  // For monthly chart we prefer a single year if possible
  let yearLabel = "selected year";
  let monthData = filtered;
  if (filters.year !== "All") {
    yearLabel = filters.year;
  } else if (filtered.length > 0) {
    const mostRecentYear = d3.max(filtered, (d) => d.year);
    monthData = filtered.filter((d) => d.year === mostRecentYear);
    yearLabel = mostRecentYear;
  }
  drawMonthlyChart(monthData, "#ovMonthChart", yearLabel);
}

// ----- JURISDICTION PAGE -----

function initJurisdictionPage() {
  const yearSel = document.getElementById("juYearFilter");
  const methodSel = document.getElementById("juMethodFilter");
  const resetBtn = document.getElementById("juResetBtn");

  const years = uniqueSorted(allMobileData.map((d) => d.year));
  years.forEach((y) => {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  });

  const methods = uniqueSorted(allMobileData.map((d) => d.method));
  methods.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    methodSel.appendChild(opt);
  });

  const filters = {
    year: "All",
    method: "All"
  };

  yearSel.addEventListener("change", (e) => {
    filters.year = e.target.value;
    renderJurisdiction(filters);
  });

  methodSel.addEventListener("change", (e) => {
    filters.method = e.target.value;
    renderJurisdiction(filters);
  });

  resetBtn.addEventListener("click", () => {
    filters.year = "All";
    filters.method = "All";
    yearSel.value = "All";
    methodSel.value = "All";
    renderJurisdiction(filters);
  });

  renderJurisdiction(filters);
}

function renderJurisdiction(filters) {
  const filtered = applyFilters(allMobileData, {
    year: filters.year,
    state: "All",
    method: filters.method,
    age: "All"
  });

  drawJurisdictionChart(filtered, "#juJurisdictionChart");

  const total = d3.sum(filtered, (d) => d.fines);
  const yearText =
    filters.year === "All" ? "all available years" : `the year ${filters.year}`;
  const methodText =
    filters.method === "All" ? "all detection methods" : filters.method;

  const insight = document.getElementById("juInsightText");
  insight.textContent =
    `This view shows total mobile phone fines by jurisdiction for ${yearText} ` +
    `using ${methodText}. Overall, there are ${formatNumber(
      total
    )} fines in the filtered dataset. Jurisdictions with taller bars ` +
    `contribute more fines under these conditions.`;
}

// ----- TREND PAGE -----

function initTrendPage() {
  const methodSel = document.getElementById("trMethodFilter");
  const stateSel = document.getElementById("trStateFilter");
  const resetBtn = document.getElementById("trResetBtn");

  const methods = uniqueSorted(allMobileData.map((d) => d.method));
  methods.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    methodSel.appendChild(opt);
  });

  const states = uniqueSorted(allMobileData.map((d) => d.state));
  states.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    stateSel.appendChild(opt);
  });

  const filters = {
    method: "All",
    state: "All"
  };

  methodSel.addEventListener("change", (e) => {
    filters.method = e.target.value;
    renderTrend(filters);
  });

  stateSel.addEventListener("change", (e) => {
    filters.state = e.target.value;
    renderTrend(filters);
  });

  resetBtn.addEventListener("click", () => {
    filters.method = "All";
    filters.state = "All";
    methodSel.value = "All";
    stateSel.value = "All";
    renderTrend(filters);
  });

  renderTrend(filters);
}

function renderTrend(filters) {
  const filtered = applyFilters(allMobileData, {
    year: "All",
    state: "All",
    method: filters.method,
    age: "All"
  });

  drawTrendChart(filtered, "#trTrendChart", filters.state);
}
