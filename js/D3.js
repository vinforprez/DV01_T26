(function () {
  "use strict";

  const chart = d3.select("#hospitalisation-chart");
  const formatCount = d3.format(",");
  const height = 320;
  const margin = { top: 16, right: 12, bottom: 38, left: 62 };
  const transportChart = d3.select("#transport-chart");
  const transportLegend = d3.select("#transport-legend");
  const remotenessChart = d3.select("#remoteness-chart");
  const ageGroupChart = d3.select("#age-group-chart");
  const transportColors = [
    ...d3.schemeTableau10,
    "#e69f00",
    "#b07aa1"
  ];

  window.renderHospitalisationChart = function (data) {
    function draw() {
      const width = Math.max(460, chart.node().getBoundingClientRect().width);
      const innerWidth = width - margin.left - margin.right;
      const x = d3.scalePoint()
        .domain(data.map(d => d.year))
        .range([margin.left, width - margin.right])
        .padding(0.35);
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([height - margin.bottom, margin.top]);

      chart
        .attr("viewBox", `0 0 ${width} ${height}`)
        .selectAll("g.chart-content")
        .remove();

      const content = chart.append("g").attr("class", "chart-content");

      content.append("g")
        .attr("class", "chart-grid")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ""))
        .call(group => group.select(".domain").remove());

      content.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickSizeOuter(0));

      content.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",d")).tickSizeOuter(0));

      content.append("path")
        .datum(data)
        .attr("class", "chart-line")
        .attr("d", d3.line()
          .x(d => x(d.year))
          .y(d => y(d.count)));

      content.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "chart-point")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.count))
        .attr("r", 4)
        .attr("tabindex", 0)
        .attr("aria-label", d => `${d.year}: ${formatCount(d.count)} hospitalisations`)
        .append("title")
        .text(d => `${d.year}: ${formatCount(d.count)} hospitalisations`);
    }

    draw();
    d3.select(window).on("resize.hospitalisation-chart", draw);
  };

  window.renderTransportChart = function (data) {
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.mode))
      .range(transportColors);
    const total = d3.sum(data, d => d.count);
    const formatPercent = d3.format(".1%");

    transportLegend.selectAll("li")
      .data(data)
      .join(enter => {
        const item = enter.append("li").attr("class", "pie-legend-item");
        item.append("span").attr("class", "pie-legend-swatch").attr("aria-hidden", "true");
        item.append("span").attr("class", "pie-legend-label");
        item.append("span").attr("class", "pie-legend-count");
        return item;
      })
      .attr("title", d => `${d.mode}: ${formatCount(d.count)} hospitalisations`)
      .each(function (d) {
        const item = d3.select(this);
        item.select(".pie-legend-swatch").style("background-color", color(d.mode));
        item.select(".pie-legend-label").text(d.mode);
        item.select(".pie-legend-count").text(formatCount(d.count));
      });

    function draw() {
      const width = Math.max(260, transportChart.node().getBoundingClientRect().width);
      const height = 300;
      const radius = Math.min(width, height) * 0.43;
      const arcs = d3.pie().sort(null).value(d => d.count)(data);
      const arc = d3.arc().innerRadius(0).outerRadius(radius);
      const content = transportChart
        .attr("viewBox", `0 0 ${width} ${height}`)
        .selectAll("g.pie-content")
        .data([null])
        .join("g")
        .attr("class", "pie-content")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      content.selectAll("path")
        .data(arcs)
        .join("path")
        .attr("class", "pie-slice")
        .attr("d", arc)
        .attr("fill", d => color(d.data.mode))
        .attr("tabindex", 0)
        .attr("aria-label", d => `${d.data.mode}: ${formatCount(d.data.count)} hospitalisations, ${formatPercent(d.data.count / total)}`)
        .append("title")
        .text(d => `${d.data.mode}: ${formatCount(d.data.count)} (${formatPercent(d.data.count / total)})`);
    }

    draw();
    d3.select(window).on("resize.transport-chart", draw);
  };

  window.renderRemotenessChart = function (data) {
    function draw() {
      const width = Math.max(460, remotenessChart.node().getBoundingClientRect().width);
      const chartMargin = { top: 16, right: 12, bottom: 38, left: 110 };
      const innerHeight = height - chartMargin.top - chartMargin.bottom;
      const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([chartMargin.left, width - chartMargin.right]);
      const y = d3.scaleBand()
        .domain(data.map(d => d.area))
        .range([chartMargin.top, height - chartMargin.bottom])
        .padding(0.24);

      remotenessChart
        .attr("viewBox", `0 0 ${width} ${height}`)
        .selectAll("g.remoteness-content")
        .remove();

      const content = remotenessChart.append("g").attr("class", "remoteness-content");

      content.append("g")
        .attr("class", "chart-grid")
        .attr("transform", `translate(0,${chartMargin.top})`)
        .call(d3.axisTop(x).ticks(5).tickSize(-innerHeight).tickFormat(() => ""))
        .call(group => group.select(".domain").remove());

      content.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(0,${height - chartMargin.bottom})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(",d")).tickSizeOuter(0));

      content.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(${chartMargin.left},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0));

      content.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("class", "remoteness-bar")
        .attr("x", x(0))
        .attr("y", d => y(d.area))
        .attr("width", d => x(d.count) - x(0))
        .attr("height", y.bandwidth())
        .attr("rx", 2)
        .attr("tabindex", 0)
        .attr("aria-label", d => `${d.area}: ${formatCount(d.count)} hospitalisations`)
        .append("title")
        .text(d => `${d.area}: ${formatCount(d.count)} hospitalisations`);
    }

    draw();
    d3.select(window).on("resize.remoteness-chart", draw);
  };

  window.renderAgeGroupChart = function (data) {
    function draw() {
      const width = Math.max(440, ageGroupChart.node().getBoundingClientRect().width);
      const chartHeight = 360;
      const chartMargin = { top: 16, right: 12, bottom: 48, left: 58 };
      const innerHeight = chartHeight - chartMargin.top - chartMargin.bottom;
      const x = d3.scaleBand()
        .domain(data.map(d => d.ageGroup))
        .range([chartMargin.left, width - chartMargin.right])
        .padding(0.24);
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .nice()
        .range([chartHeight - chartMargin.bottom, chartMargin.top]);

      ageGroupChart
        .attr("viewBox", `0 0 ${width} ${chartHeight}`)
        .selectAll("g.age-group-content")
        .remove();

      const content = ageGroupChart.append("g").attr("class", "age-group-content");

      content.append("g")
        .attr("class", "chart-grid")
        .attr("transform", `translate(${chartMargin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickSize(-innerHeight).tickFormat(() => ""))
        .call(group => group.select(".domain").remove());

      content.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(0,${chartHeight - chartMargin.bottom})`)
        .call(d3.axisBottom(x).tickSizeOuter(0));

      content.append("g")
        .attr("class", "chart-axis")
        .attr("transform", `translate(${chartMargin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(",d")).tickSizeOuter(0));

      content.selectAll("rect")
        .data(data)
        .join("rect")
        .attr("class", "age-group-bar")
        .attr("x", d => x(d.ageGroup))
        .attr("y", d => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", d => y(0) - y(d.count))
        .attr("rx", 2)
        .attr("tabindex", 0)
        .attr("aria-label", d => `${d.ageGroup}: ${formatCount(d.count)} hospitalisations`)
        .append("title")
        .text(d => `${d.ageGroup}: ${formatCount(d.count)} hospitalisations`);
    }

    draw();
    d3.select(window).on("resize.age-group-chart", draw);
  };
})();