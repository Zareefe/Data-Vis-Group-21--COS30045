// =======================
// main.js – Controller
// =======================

import { toNumber } from "./utils.js";

// ------------------------------
// RAW DATA (existing charts use)
// ------------------------------
const RAW_DATA_PATH = "data/police_enforcement_2024_fines.csv";

// ------------------------------
// KNIME DATASETS (research Qs)
// ------------------------------
const KNIME_PATHS = {
  q1: "data/Q1_per10000.csv",
  q2: "data/Q2_trend.csv",
  q3: "data/Q3_covidtrend.csv",
  q4: "data/Q4_detection.csv",
  q5: "data/Q5excel_Processes.csv"
};

// Store loaded datasets
let rawData = [];
let q1Data = [];
let q2Data = [];
let q3Data = [];
let q4Data = [];
let q5Data = [];

// ==============================
// LOAD ALL DATASETS
// ==============================
async function loadDatasets() {
  rawData = await d3.csv(RAW_DATA_PATH, d => toNumber(d, ["fines", "arrests", "charges"]));

  q1Data = await d3.csv(KNIME_PATHS.q1, d => toNumber(d, ["rate_per_10000"]));
  q2Data = await d3.csv(KNIME_PATHS.q2, d => toNumber(d, ["offences"]));
  q3Data = await d3.csv(KNIME_PATHS.q3, d => toNumber(d, ["offences"]));
  q4Data = await d3.csv(KNIME_PATHS.q4, d => toNumber(d, ["police", "camera"]));
  q5Data = await d3.csv(KNIME_PATHS.q5, d => toNumber(d, ["improvement_score"]));

  console.log("RAW + KNIME datasets loaded");
}

// ==============================
// PAGE DETECTOR
// ==============================
function getPageID() {
  const body = document.querySelector("main");
  return body?.id || "";
}

// ==============================
// PAGE INITIALISERS
// ==============================

// ----- Overview -----
function initOverviewPage() {
  drawAgeChart(rawData);
  drawJurisdictionChart(rawData);
  drawMonthChart(rawData);
}

// ----- Jurisdiction -----
function initJurisdictionPage() {
  drawJurisdictionChart(rawData);

  // KNIME additions
  drawQ1RateChart(q1Data);
  drawDetectionStacked(q4Data);
  drawDetectionPie(q4Data);
}

// ----- Trend -----
function initTrendPage() {
  drawTrendChart(rawData);

  // KNIME additions
  drawQ2TrendKnime(q2Data);
  drawCovidArea(q3Data);
  drawHeatmapQ5(q5Data);
}

// ==============================
// BOOTSTRAP APPLICATION
// ==============================
async function init() {
  await loadDatasets();

  const page = getPageID();

  if (page === "overview-page") initOverviewPage();
  if (page === "jurisdiction-page") initJurisdictionPage();
  if (page === "trend-page") initTrendPage();
}

init();
