async function loadHospitalisationData() {
  const rows = await d3.csv("data/hospitalisation_injury_publication_sep2023.csv", row => ({
    year: Number(row["Calendar year"]),
    cause: row["Cause of injury"],
    ageGroup: row["Age group"],
    roadUser: row["Road user"],
    remoteness: row["ABS remoteness area"],
    hospitalisations: Number(row.Hospitalisations)
  }));
  const trafficRows = rows.filter(row => row.cause === "Traffic");

  if (trafficRows.length === 0) {
    throw new Error("No traffic injury records were found in the CSV.");
  }

  for (const row of trafficRows) {
    if (!Number.isInteger(row.year) || !row.ageGroup || !row.roadUser || !row.remoteness || !Number.isFinite(row.hospitalisations)) {
      throw new Error("The CSV contains an invalid year, age group, road-user type, remoteness area, or hospitalisation count.");
    }
  }

  const sumHospitalisations = values => d3.sum(values, row => row.hospitalisations);
  const ageGroupOrder = ["0-7", "8-16", "17-25", "26-39", "40-64", "65-74", "75+", "Missing"];
  const annual = d3.rollups(trafficRows, sumHospitalisations, row => row.year)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year - b.year);
  const ageGroups = d3.rollups(
    trafficRows.filter(row => row.ageGroup !== "Missing"),
    sumHospitalisations,
    row => row.ageGroup
  )
    .map(([ageGroup, count]) => ({ ageGroup, count }))
    .sort((a, b) => {
      const aIndex = ageGroupOrder.indexOf(a.ageGroup);
      const bIndex = ageGroupOrder.indexOf(b.ageGroup);
      return (aIndex < 0 ? ageGroupOrder.length : aIndex) - (bIndex < 0 ? ageGroupOrder.length : bIndex)
        || a.ageGroup.localeCompare(b.ageGroup);
    });
  const ageGroupYearCounts = d3.rollups(
    trafficRows.filter(row => row.ageGroup !== "Missing"),
    sumHospitalisations,
    row => row.ageGroup,
    row => row.year
  )
    .flatMap(([ageGroup, yearlyCounts]) => yearlyCounts.map(([year, count]) => ({ ageGroup, year, count })))
    .sort((a, b) => {
      const aIndex = ageGroupOrder.indexOf(a.ageGroup);
      const bIndex = ageGroupOrder.indexOf(b.ageGroup);
      return (aIndex < 0 ? ageGroupOrder.length : aIndex) - (bIndex < 0 ? ageGroupOrder.length : bIndex)
        || a.year - b.year;
    });
  const transportModes = d3.rollups(trafficRows, sumHospitalisations, row => row.roadUser)
    .map(([mode, count]) => ({ mode, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const remotenessAreas = d3.rollups(
    trafficRows.filter(row => row.remoteness !== "Missing"),
    sumHospitalisations,
    row => row.remoteness
  )
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);

  return { annual, ageGroups, ageGroupYearCounts, transportModes, remotenessAreas };
}

async function loadStateTerritoryData() {
  const rows = await d3.csv("data/state-territory-hospitalisations.csv", row => ({
    region: row.region,
    count: Number(row.hospitalisations)
  }));
  const expectedRegions = new Set(["NSW", "Vic", "Qld", "WA", "SA", "Tas", "ACT", "NT"]);
  const seenRegions = new Set();

  for (const row of rows) {
    if (!expectedRegions.has(row.region) || seenRegions.has(row.region) || !Number.isInteger(row.count) || row.count < 0) {
      throw new Error("The state and territory data contains an invalid region or hospitalisation count.");
    }
    seenRegions.add(row.region);
  }

  if (seenRegions.size !== expectedRegions.size) {
    throw new Error("The state and territory data must contain one total for each Australian jurisdiction.");
  }

  return rows;
}