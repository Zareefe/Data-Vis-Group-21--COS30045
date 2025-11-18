// Main controller for dashboard

let allMobileData = [];
let currentFilters = {
  state: "All",
  method: "All",
  age: "All"
};
let activeQuestion = "q1"; // storyboard state

// Load data from CSV (ensure filename matches your /data folder)
d3.csv("data/police_enforcement_2024_fines.csv", (d) => ({
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
})).then((data) => {
  // Filter to mobile phone use only
  allMobileData = data.filter((row) => row.metric === "mobile_phone_use");

  initialiseFilters(allMobileData);
  initialiseStoryboard();
  renderDashboard();
});

// Initialise filter dropdowns from data
function initialiseFilters(data) {
  const stateSelect = document.getElementById("stateFilter");
  const methodSelect = document.getElementById("methodFilter");
  const ageSelect = document.getElementById("ageFilter");

  // Jurisdictions
  const states = Array.from(new Set(data.map((d) => d.state))).sort();
  states.forEach((s) => {
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    stateSelect.appendChild(opt);
  });

  // Detection methods
  const methods = Array.from(new Set(data.map((d) => d.method))).sort();
  methods.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    methodSelect.appendChild(opt);
  });

  // Age groups
  const ages = Array.from(new Set(data.map((d) => d.age_group))).sort();
  ages.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    ageSelect.appendChild(opt);
  });

  stateSelect.addEventListener("change", (e) => {
    currentFilters.state = e.target.value;
    renderDashboard();
  });

  methodSelect.addEventListener("change", (e) => {
    currentFilters.method = e.target.value;
    renderDashboard();
  });

  ageSelect.addEventListener("change", (e) => {
    currentFilters.age = e.target.value;
    renderDashboard();
  });

  document.getElementById("resetFiltersBtn").addEventListener("click", () => {
    currentFilters = { state: "All", method: "All", age: "All" };
    stateSelect.value = "All";
    methodSelect.value = "All";
    ageSelect.value = "All";
    renderDashboard();
  });
}

// Storyboard cards (for now they just highlight; later you can change charts per Q)
function initialiseStoryboard() {
  const cards = document.querySelectorAll(".story-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      activeQuestion = card.dataset.question;

      cards.forEach((c) => c.classList.remove("story-card--active"));
      card.classList.add("story-card--active");

      // In future you can switch chart focus based on activeQuestion here.
      // For now, charts remain the same but the storyboard communicates the story.
      // Example: you might scroll to a specific chart for each question.
    });
  });
}

// Apply filters to data
function getFilteredData() {
  let filtered = allMobileData;

  if (currentFilters.state !== "All") {
    filtered = filtered.filter((d) => d.state === currentFilters.state);
  }

  if (currentFilters.method !== "All") {
    filtered = filtered.filter((d) => d.method === currentFilters.method);
  }

  if (currentFilters.age !== "All") {
    filtered = filtered.filter((d) => d.age_group === currentFilters.age);
  }

  return filtered;
}

// Update summary numbers
function updateSummaryCards(data) {
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

  document.getElementById("summaryTotalFines").textContent =
    formatNumber(totalFines);
  document.getElementById("summaryPoliceFines").textContent =
    formatNumber(policeFines);
  document.getElementById("summaryCameraFines").textContent =
    formatNumber(cameraFines);
  document.getElementById("summaryArrests").textContent =
    formatNumber(arrests);
  document.getElementById("summaryCharges").textContent =
    formatNumber(charges);
}

// Draw all charts
function renderDashboard() {
  const filteredData = getFilteredData();
  updateSummaryCards(filteredData);
  drawAgeChart(filteredData);
  drawStateChart(filteredData);
  drawMonthlyChart(filteredData);
}
