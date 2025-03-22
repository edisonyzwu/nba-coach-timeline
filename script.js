const margin = {top: 120, right: 20, bottom: 30, left: 150};
const rowHeight = 30;
const width = 1000;
const height = data.length * rowHeight + margin.top + margin.bottom;

const svg = d3.select("#timeline").attr("width", width).attr("height", height);

const x = d3
  .scaleLinear()
  .domain([17, 76])
  .range([margin.left, width - margin.right]);

const y = d3
  .scaleBand()
  .domain(data.map((d) => d.name))
  .range([margin.top, height - margin.bottom])
  .padding(0.35);

function normalizeLeague(league) {
  if (league === "G League" || league === "NCAA") return "G League / NCAA";
  if (league === "Overseas League") return "Overseas";
  return league;
}

function getLeagueRoleColor(league, role) {
  const normalizedLeague = normalizeLeague(league);

  const colorMap = {
    NBA: {
      Player: "#f59e0b", // 深橘
      AC: "#065f46", // 深绿
      HC: "#495783", // 深蓝
    },
    "G League / NCAA": {
      Player: "#fabf63", // 中橘
      AC: "#10b981", // 中绿
      HC: "#738fbd", // 中蓝
    },
    Overseas: {
      Player: "#fde68a", // 浅橘
      AC: "#a7f3d0", // 浅绿
      HC: "#d1ddeb", // 浅蓝
    },
  };

  return colorMap[normalizedLeague]?.[role] || "#ccc";
}

const tickAges = [20, 30, 40, 50, 60, 70];

svg
  .selectAll(".age-grid-line")
  .data(tickAges)
  .enter()
  .append("line")
  .attr("x1", (d) => x(d))
  .attr("x2", (d) => x(d))
  .attr("y1", margin.top - 10)
  .attr("y2", height - margin.bottom)
  .attr("stroke", "#ccc")
  .attr("stroke-width", 1);

svg
  .selectAll(".age-top-label")
  .data(tickAges)
  .enter()
  .append("text")
  .attr("x", (d) => x(d))
  .attr("y", margin.top - 15)
  .attr("text-anchor", "middle")
  .attr("font-size", "11px")
  .attr("fill", "#555")
  .text((d) => d);

svg
  .selectAll(".age-bottom-label")
  .data(tickAges)
  .enter()
  .append("text")
  .attr("x", (d) => x(d))
  .attr("y", height - margin.bottom + 20)
  .attr("text-anchor", "middle")
  .attr("font-size", "11px")
  .attr("fill", "#555")
  .text((d) => d);

svg
  .append("text")
  .attr("x", x(20) - 40)
  .attr("y", margin.top - 15)
  .attr("font-size", "12px")
  .attr("fill", "#555")
  .text("Age:");

svg
  .selectAll(".coach-label")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "coach-label")
  .attr("x", margin.left - 30)
  .attr("y", (d) => y(d.name) + y.bandwidth() / 2)
  .attr("text-anchor", "end")
  .attr("dominant-baseline", "middle")
  .attr("font-size", "12px")
  .attr("fill", "#333")
  .text((d) => d.name);

svg
  .selectAll(".coach-logo")
  .data(data)
  .enter()
  .append("image")
  .attr("class", "coach-logo")
  .attr("x", margin.left - 25)
  .attr("y", (d) => y(d.name) + y.bandwidth() / 2 - 10)
  .attr("width", 22)
  .attr("height", 22)
  .attr("href", (d) => d.logo);

svg
  .selectAll(".coach")
  .data(data)
  .enter()
  .append("g")
  .attr("class", "coach")
  .attr("transform", (d) => `translate(0,${y(d.name)})`)
  .selectAll("rect")
  .data((d) => d.career)
  .enter()
  .append("rect")
  .attr("rx", 4)
  .attr("ry", 4)
  .attr("x", (d) => x(d.startAge))
  .attr("y", 0)
  .attr("height", y.bandwidth())
  .attr("width", (d) => x(d.endAge) - x(d.startAge))
  .attr("fill", (d) => getLeagueRoleColor(d.league, d.role))
  .attr("class", "bar")
  .attr("stroke", "white")
  .attr("stroke-width", 1);

// 🔷 Legend
const leagues = ["NBA", "G League / NCAA", "Overseas"];
const roles = ["Player", "AC", "HC"];

const boxWidth = 40;
const boxHeight = 13;
const spacingX = 3;
const spacingY = 3;
const legendStartX = margin.left + width / 4;
const legendStartY = 20;

roles.forEach((role, col) => {
  svg
    .append("text")
    .attr("x", legendStartX + col * (boxWidth + spacingX) + boxWidth / 2)
    .attr("y", legendStartY - 6)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .text(role)
    .attr("fill", "#888");
});

leagues.forEach((league, row) => {
  roles.forEach((role, col) => {
    svg
      .append("rect")
      .attr("x", legendStartX + col * (boxWidth + spacingX))
      .attr("y", legendStartY + row * (boxHeight + spacingY))
      .attr("width", boxWidth)
      .attr("height", boxHeight)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", getLeagueRoleColor(league, role));
  });

  svg
    .append("text")
    .attr("x", legendStartX - 10)
    .attr("y", legendStartY + row * (boxHeight + spacingY) + boxHeight / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("font-size", "10px")
    .attr("fill", "#888")
    .text(league);

  const tooltip = d3.select("#tooltip");

  svg
    .selectAll(".bar")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("stroke", "#000").attr("stroke-width", 2);

      const parentData = d3.select(this.parentNode).datum();

      const roleMap = {
        HC: "head coach",
        AC: "assistant coach",
        Player: "player",
      };

      const roleText = roleMap[d.role] || d.role.toLowerCase();

      tooltip
        .html(
          `
          <div class="name" style="font-weight: bold; font-size: 14px;">${parentData.name}</div>
          <div style="margin-top: 4px;">Age ${d.startAge}–${d.endAge} (${d.startYear}–${d.endYear})</div>
          <div style="margin-top: 4px;">${d.league} ${roleText}</div>
        `
        )
        .style("display", "block");
    })

    .on("mousemove", function (event) {
      tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("stroke", "white").attr("stroke-width", 1);
      tooltip.style("display", "none");
    });
});
