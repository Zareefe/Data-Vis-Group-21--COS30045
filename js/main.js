<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Mobile Phone Use – Road Safety Enforcement Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="stylesheet" href="css/visual.css" />
  <script src="https://d3js.org/d3.v7.min.js"></script>
</head>

<body>
  <header class="site-header">
    <div class="site-header__top">
      <div class="site-header__brand">
        <div class="brand-line-1">AUSTRALIAN TRANSPORT STATISTICS</div>
        <div class="brand-line-2">Mobile phone use – detailed view</div>
      </div>
    </div>
    <nav class="topnav">
      <a href="index.html" class="topnav__link topnav__link--active">Overview</a>
      <a href="jurisdiction.html" class="topnav__link">Jurisdiction</a>
      <a href="trend.html" class="topnav__link">Trend</a>
    </nav>
  </header>

  <main id="overview-page" class="page page--overview">
    <section class="page-inner dashboard-grid">
      <!-- Sidebar -->
      <aside class="sidebar">
        <section class="card summary-card">
          <h2 class="card-title">Overview summaries (KNIME outputs)</h2>
          <div class="summary-row">
            <span class="summary-label">Top jurisdiction (rate per 10k)</span>
            <span id="ovTopJur" class="summary-value">–</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Latest trend direction</span>
            <span id="ovTrendDirection" class="summary-value">–</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">COVID impact (signal)</span>
            <span id="ovCovidImpact" class="summary-value">–</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Most common detection method</span>
            <span id="ovTopMethod" class="summary-value">–</span>
          </div>
        </section>

        <section class="card notes-card">
          <h3 class="card-title">Notes</h3>
          <p>
            This site only visualises the KNIME-processed outputs for each research question.
            Each chart uses a single KNIME result CSV (see code comments).
          </p>
        </section>
      </aside>

      <!-- Main content -->
      <section class="main-column">
        <!-- Filters -->
        <section class="card filters-bar">
          <div class="filter-block">
            <label for="ovYearFilter">Year (overview)</label>
            <select id="ovYearFilter"><option value="All">All</option></select>
          </div>

          <div class="filter-block">
            <label for="ovStateFilter">Jurisdiction (overview)</label>
            <select id="ovStateFilter"><option value="All">All</option></select>
          </div>

          <div class="filter-block filter-block--reset">
            <button id="ovResetBtn" type="button">Reset filters</button>
          </div>
        </section>

        <!-- Charts -->
        <section class="charts-grid">
          <article class="card chart-card">
            <h2 class="card-title">Q1 — Rate per 10,000 licences (top jurisdictions)</h2>
            <p class="chart-description">Horizontal bar chart showing rate per 10,000 licences (from Q1_per10000.csv)</p>
            <div id="ovQ1Rate" class="chart-container"></div>
          </article>

          <article class="card chart-card">
            <h2 class="card-title">Q4 — Detection methods composition (pie)</h2>
            <p class="chart-description">Pie chart of detection method share (from Q4_detection.csv)</p>
            <div id="ovDetectionPie" class="chart-container"></div>
          </article>

          <article class="card chart-card chart-card--full">
            <h2 class="card-title">Q3 — COVID period effect (area)</h2>
            <p class="chart-description">Area chart with shaded COVID (from Q3_covidtrend.csv)</p>
            <div id="ovCovidArea" class="chart-container chart-container--tall"></div>
          </article>

          <article class="card chart-card chart-card--full">
            <h2 class="card-title">Q5 — Improvement heatmap preview</h2>
            <p class="chart-description">Heatmap (jurisdiction × year) preview (from Q5excel_Processes.csv)</p>
            <div id="ovHeatmap" class="chart-container"></div>
          </article>

          <article class="card chart-card chart-card--full">
            <h2 class="card-title">Scatter: fines vs arrests (derived)</h2>
            <p class="chart-description">Scatter to inspect correlation (aggregated from Q4_detection or Q2_trend as available)</p>
            <div id="ovScatter" class="chart-container"></div>
          </article>

        </section>
      </section>
    </section>
  </main>

  <footer class="site-footer">
    <p>Data source: KNIME outputs (Q1_per10000.csv, Q2_trend.csv, Q3_covidtrend.csv, Q4_detection.csv, Q5excel_Processes.csv)</p>
  </footer>

  <!-- scripts -->
  <script src="js/utils.js"></script>

  <!-- charts -->
  <script src="js/chart_q1_rate.js"></script>
  <script src="js/chart_detection.js"></script>
  <script src="js/chart_covid_area.js"></script>
  <script src="js/chart_heatmap_q5.js"></script>
  <script src="js/chart_scatter.js"></script>

  <!-- loader -->
  <script src="js/main.js"></script>
</body>
</html>
