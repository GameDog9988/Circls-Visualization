import "./style.css";
import * as d3 from "d3";

document.querySelector("#app").innerHTML = `
  <h1>Hello Vite!</h1>
`;

async function drawGraph() {
  let data = await d3.csv("./filtered_Cyberlearning_related.csv");
  data = data
    .slice(0, 5)
    .concat(data.slice(50, 55).concat(data.slice(100, 105)));
  console.log(data);

  const mean = d3.mean(data, (d) => d["AwardedAmountToDate"]);
  alert(mean);

  const awardInstrumentGroup = Array.from(data, (d) => d["AwardInstrument"]);
  console.log(awardInstrumentGroup);

  const yAccessor = (d) => d["AwardedAmountToDate"];
  console.log(yAccessor(data[0]));
  const xAccessor = (d) => d["AwardInstrument"];
  console.log(xAccessor(data[0]));

  let dms = {
    width: window.innerWidth * 0.9,
    height: 400,
    margins: {
      top: 16,
      right: 64,
      bottom: 48,
      left: 64,
    },
  };
  dms.boundedWidth = dms.width - dms.margins.left - dms.margins.right;
  dms.boundedHeight = dms.height - dms.margins.top - dms.margins.bottom;

  const color = d3
    .scaleOrdinal()
    .domain(awardInstrumentGroup)
    .range(["#F8766D", "#00BA38"]);

  const app = d3
    .select("#app")
    .append("svg")
    .attr("width", dms.width)
    .attr("height", dms.height);

  const bounds = app
    .append("g")
    .style(
      "transform",
      `translate(${dms.margins.left}px, ${dms.margins.top}px)`
    );

  // const xScale = d3.scaleLinear().domain([6, 12]).range([0, dms.boundedWidth]);
  const xScale = d3
    .scaleOrdinal()
    .domain(awardInstrumentGroup)
    .range([0, dms.boundedWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([-0.3, d3.max(data, yAccessor)])
    .range([dms.boundedHeight, 0])
    .nice();

  const meanPlacement = yScale(d3.mean(data, yAccessor));
  console.log(meanPlacement);

  // bounds
  //   .append("g")
  //   .attr("transform", "translate(0," + dms.height + ")")
  //   .call(d3.axisBottom(xScale));

  // bounds.append("g").call(d3.axisBottom(y));

  const node = bounds
    .append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 25)
    .attr("cx", dms.boundedWidth / 2)
    .attr("cy", dms.boundedHeight / 2)
    .style("fill", (d) => color(d))
    .style("fill-opacity", 0.3)
    .attr("stroke", "#69a2b2")
    .style("stroke-width", 4)
    .call(
      d3
        .drag() // call specific function when circle is dragged
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  const simulation = d3
    .forceSimulation()
    .force(
      "x",
      d3
        .forceX()
        .strength(0.5)
        .x((d) => xScale(d) / 2)
    )
    .force(
      "y",
      d3
        .forceY()
        .strength(0.1)
        .y(dms.boundedHeight / 2)
    )
    .force(
      "center",
      d3
        .forceCenter()
        .x(dms.boundedWidth / 2)
        .y(dms.boundedHeight / 2)
    ) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(0.5)) // Nodes are attracted one each other of value is > 0
    .force(
      "collide",
      d3.forceCollide().strength(0.01).radius(50).iterations(1)
    ); // Force that avoids circle overlapping

  simulation.nodes(data).on("tick", function (d) {
    node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  });

  function dragstarted(e, d) {
    if (!e.active) simulation.alphaTarget(0.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(e, d) {
    d.fx = e.x;
    d.fy = e.y;
  }
  function dragended(e, d) {
    if (!e.active) simulation.alphaTarget(0.03);
    d.fx = null;
    d.fy = null;
  }

  // const simulation = d3
  //   .forceSimulation(data)
  //   .force(
  //     "link",
  //     d3.forceLink().id((d) => d[d["index"]])
  //   )
  //   .force("charge", d3.forceManyBody())
  //   .force("center", d3.forceCenter());

  // const mean = bounds
  //   .append("rect")
  //   .attr("x", 0)
  //   .attr("width", dms.boundedWidth)
  //   .attr("y", meanPlacement)
  //   .attr("height", dms.boundedHeight - meanPlacement)
  //   .attr("fill", "#e0f3f3");
}

drawGraph();
