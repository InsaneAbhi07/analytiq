// Chart.js defaults + palette for Analytiq.
// Categorical slots are assigned in fixed order (never cycled); the funnel uses one ordinal blue ramp.
(function () {
  "use strict";
  if (!window.Chart) return;

  const palette = {
    series: ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"],
    ordinal: ["#86b6ef", "#6da7ec", "#5598e7", "#3987e5", "#2a78d6", "#256abf", "#1c5cab", "#184f95"],
    grid: "#eceef3",
    axis: "#667085",
    text: "#344054",
  };
  window.nxCharts = { palette };

  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.font.size = 12;
  Chart.defaults.color = palette.axis;
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.plugins.legend.display = false; // HTML legends are rendered next to each chart
  Chart.defaults.plugins.tooltip.backgroundColor = "#101828";
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  Chart.defaults.plugins.tooltip.titleFont = { weight: "600" };
  Chart.defaults.plugins.tooltip.boxPadding = 4;
  Chart.defaults.interaction = { mode: "index", intersect: false };
  Chart.defaults.elements.bar.borderRadius = 4;
  Chart.defaults.elements.bar.borderSkipped = "start";
  Chart.defaults.elements.line.borderWidth = 2;
  Chart.defaults.elements.line.tension = 0.3;
  Chart.defaults.elements.point.radius = 0;
  Chart.defaults.elements.point.hoverRadius = 5;
  Chart.defaults.elements.point.hitRadius = 12;

  window.nxCharts.axes = (opts = {}) => ({
    x: { grid: { display: false }, border: { color: palette.grid }, ticks: { maxRotation: 0, autoSkip: true }, stacked: !!opts.stacked },
    y: {
      beginAtZero: true, stacked: !!opts.stacked, border: { display: false }, grid: { color: palette.grid },
      ticks: { precision: 0, maxTicksLimit: 5, callback: opts.suffix ? (v) => v + opts.suffix : undefined },
      max: opts.max,
    },
  });

  // Render every <canvas data-chart='{...json config...}'> on the page.
  document.querySelectorAll("canvas[data-chart]").forEach((canvas) => {
    const cfg = JSON.parse(canvas.dataset.chart);
    const stacked = !!cfg.stacked;
    cfg.data.datasets.forEach((ds, i) => {
      const color = ds.color || palette.series[ds.slot ?? i];
      if (cfg.type === "line") {
        ds.borderColor = color;
        ds.backgroundColor = color + "1f";
        ds.fill = ds.fill ?? false;
      } else if (cfg.type === "doughnut") {
        ds.backgroundColor = ds.colors || palette.series.slice(0, ds.data.length);
        ds.borderColor = "#ffffff";
        ds.borderWidth = 2;
      } else {
        ds.backgroundColor = ds.colors || color;
        ds.borderColor = "#ffffff";
        ds.borderWidth = stacked ? { top: 2 } : 0;
        ds.maxBarThickness = ds.maxBarThickness || 28;
      }
    });
    const options = cfg.type === "doughnut"
      ? { cutout: "68%", interaction: { mode: "nearest", intersect: true } }
      : { indexAxis: cfg.horizontal ? "y" : "x", scales: nxCharts.axes({ stacked, suffix: cfg.suffix, max: cfg.max }) };
    if (cfg.horizontal) {
      options.scales = {
        y: { grid: { display: false }, border: { color: palette.grid }, stacked },
        x: { beginAtZero: true, grid: { color: palette.grid }, border: { display: false }, ticks: { precision: 0, maxTicksLimit: 5 }, stacked, max: cfg.max },
      };
    }
    new Chart(canvas, { type: cfg.type, data: cfg.data, options });
  });
})();
