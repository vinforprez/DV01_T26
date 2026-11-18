const chartStatus = document.querySelector("#chart-status");
const transportChartStatus = document.querySelector("#transport-chart-status");
const remotenessChartStatus = document.querySelector("#remoteness-chart-status");
const ageGroupChartStatus = document.querySelector("#age-group-chart-status");

if (typeof d3 === "undefined") {
  chartStatus.classList.add("is-error");
  chartStatus.textContent = "D3.js could not be loaded. Check your internet connection and reload the page.";
  transportChartStatus.classList.add("is-error");
  transportChartStatus.textContent = "D3.js could not be loaded. Check your internet connection and reload the page.";
  remotenessChartStatus.classList.add("is-error");
  remotenessChartStatus.textContent = "D3.js could not be loaded. Check your internet connection and reload the page.";
  ageGroupChartStatus.classList.add("is-error");
  ageGroupChartStatus.textContent = "D3.js could not be loaded. Check your internet connection and reload the page.";
} else {
  loadHospitalisationData()
    .then(({ annual, ageGroups, transportModes, remotenessAreas }) => {
      chartStatus.textContent = `Showing ${annual.length} annual totals for traffic injuries.`;
      transportChartStatus.textContent = `Showing the ${transportModes.length} highest-volume road-user types across 2011–2021.`;
      remotenessChartStatus.textContent = `Showing hospitalisation counts for ${remotenessAreas.length} remoteness categories.`;
      ageGroupChartStatus.textContent = `Showing hospitalisation counts for ${ageGroups.length} age groups.`;
      window.renderHospitalisationChart(annual);
      window.renderTransportChart(transportModes);
      window.renderRemotenessChart(remotenessAreas);
      window.renderAgeGroupChart(ageGroups);
    })
    .catch(error => {
      console.error("Unable to load the hospitalisation charts:", error);
      chartStatus.classList.add("is-error");
      chartStatus.textContent = "Chart data could not be loaded. Open this page through a local web server and check the data file.";
      transportChartStatus.classList.add("is-error");
      transportChartStatus.textContent = "Chart data could not be loaded. Open this page through a local web server and check the data file.";
      remotenessChartStatus.classList.add("is-error");
      remotenessChartStatus.textContent = "Chart data could not be loaded. Open this page through a local web server and check the data file.";
      ageGroupChartStatus.classList.add("is-error");
      ageGroupChartStatus.textContent = "Chart data could not be loaded. Open this page through a local web server and check the data file.";
    });
}