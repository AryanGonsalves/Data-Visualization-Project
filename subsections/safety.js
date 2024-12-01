document.addEventListener("DOMContentLoaded", () => {

    d3.json("../data/safety/us-states.geojson")
    .then((geojson) => {
        console.log("GeoJSON successfully loaded:", geojson);
        drawMapChart(geojson);
    })
    .catch((error) => {
        console.error("Failed to load GeoJSON:", error);
    });


const datasetPaths = {
    //drugs: "../data/safety/drug%20use/drugdeaths.csv",
    traffic: "../data/safety/road%20safety/fatal.csv",
    shooting: "../data/safety/School%20shootings/shootings.csv",
};

let data = [];
const datasetSelect = document.getElementById("dataset");
const yAttributeSelect = document.getElementById("y-attribute");
const xAxisSelect = document.getElementById("x-axis");
const svg = d3.select("#barplot");
const mapSvg = d3.select("#us-map");

const margin = { top: 20, right: 30, bottom: 50, left: 70 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Projection and path for the map
const mapWidth = 800;
const mapHeight = 500;
const projection = d3.geoAlbersUsa()
    .scale(1000) // Adjust scale as necessary
    .translate([mapWidth / 2, mapHeight / 2]);
const path = d3.geoPath().projection(projection)

const chart = svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const xAxisGroup = chart.append("g").attr("transform", `translate(0, ${height})`);
const yAxisGroup = chart.append("g");

const rulingParties = {
  "1990": "Republican",
  "1991": "Republican",
  "1992": "Republican",
  "1993": "Democrat",
  "1994": "Democrat",
  "1995": "Democrat",
  "1996": "Democrat",
  "1997": "Democrat",
  "1998": "Democrat",
  "1999": "Democrat",
  "2000": "Democrat",
  "2001": "Republican",
  "2002": "Republican",
  "2003": "Republican",
  "2004": "Republican",
  "2005": "Republican",
  "2006": "Republican",
  "2007": "Republican",
  "2008": "Republican",
  "2009": "Democrat",
  "2010": "Democrat",
  "2011": "Democrat",
  "2012": "Democrat",
  "2013": "Democrat",
  "2014": "Democrat",
  "2015": "Democrat",
  "2016": "Democrat",
  "2017": "Republican",
  "2018": "Republican",
  "2019": "Republican",
  "2020": "Republican",
  "2021": "Democrat",
  "2022": "Democrat",
  "2023": "Democrat",
  "2024": "Democrat"
};


// Event listener for dataset selection
datasetSelect.addEventListener("change", () => {
    loadDataset(datasetSelect.value);
});

// Load and preprocess datasets
function loadDataset(dataset) {
    const filePath = datasetPaths[dataset];
    d3.csv(filePath)
        .then((loadedData) => {
            console.log(`Raw data for ${dataset}:`, loadedData);
            if (dataset === "drugs") preprocessDrugDeaths(loadedData);
            else if (dataset === "traffic") preprocessTrafficFatalities(loadedData);
            else if (dataset === "shooting") preprocessSchoolShootings(loadedData);

            if (!data || data.length === 0) {
                console.error("No valid data found for the selected dataset.");
                return;
            }

            populateDropdowns();
            drawBarGraph();
        })
        .catch((error) => {
            console.error(`Error loading dataset "${dataset}":`, error);
        });
}


// Preprocessing functions

function preprocessTrafficFatalities(loadedData) {
    console.log("Raw Traffic Fatalities Data:", loadedData);

    data = loadedData.map((d) => ({
        Year: +d["Year"],
        State: d["State"]?.trim() || "Unknown",
        Fatalities: +d["Total Fatalities"] || null,
    })).filter((d) => d.Year && d.Fatalities !== null); // Filter valid rows

    console.log("Processed Traffic Fatalities:", data);
}

function preprocessSchoolShootings(loadedData) {
    data = loadedData
        .map((d) => ({
            Year: +new Date(d["Date"]).getFullYear() || null,
            State: d["State"]?.trim() || "Unknown",
            Fatalities: +d["Fatalities"] || 0,
            Wounded: +d["Wounded"] || 0,
            Total: (+d["Fatalities"] || 0) + (+d["Wounded"] || 0),
        }))
        .filter((d) => d.Year && d.Total > 0);
    console.log("Processed School Shootings:", data);
}

// Populate dropdowns
function populateDropdowns() {
    // Populate Y Attribute dropdown
    const quantitativeAttributes = Object.keys(data[0]).filter(
        (key) => key !== "Year" && key !== "State"
    );
    yAttributeSelect.innerHTML = "";
    quantitativeAttributes.forEach((attr) => {
        const option = document.createElement("option");
        option.value = attr;
        option.textContent = attr;
        yAttributeSelect.appendChild(option);
    });

    // Populate X Axis dropdown
    xAxisSelect.innerHTML = "";
    ["Year", "State"].forEach((attr) => {
        const option = document.createElement("option");
        option.value = attr;
        option.textContent = attr;
        xAxisSelect.appendChild(option);
    });

    yAttributeSelect.removeEventListener("change", drawBarGraph);
    yAttributeSelect.addEventListener("change", drawBarGraph);

    xAxisSelect.removeEventListener("change", drawBarGraph);
    xAxisSelect.addEventListener("change", drawBarGraph);
}


// Draw Bar Graph
function drawBarGraph() {
    const yAttr = yAttributeSelect.value;
    const xAttr = xAxisSelect.value;

    const groupedData = d3.group(data, (d) => d[xAttr]);
    const aggregatedData = Array.from(groupedData, ([key, values]) => ({
        key,
        total: d3.sum(values, (d) => d[yAttr]),
    }));

    const xScale =
        xAttr === "Year"
            ? d3.scaleLinear()
                  .domain([
                      d3.min(aggregatedData, (d) => +d.key) - 0.5, // Add buffer to start
                      d3.max(aggregatedData, (d) => +d.key) + 0.5, // Add buffer to end
                  ])
                  .range([0, width])
            : d3.scaleBand()
                  .domain(aggregatedData.map((d) => d.key))
                  .range([0, width])
                  .padding(0.1);

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(aggregatedData, (d) => d.total)])
        .range([height, 0]);

    // Smooth transition for X-Axis
    xAxisGroup
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .call(
            xAttr === "Year"
                ? d3.axisBottom(xScale).tickFormat(d3.format("d")) // Format years as integers
                : d3.axisBottom(xScale)
        )
        .selectAll("text")
        .attr("transform", xAttr === "Year" ? "rotate(0)" : "rotate(-45)") // Rotate only for state tags
        .style("text-anchor", xAttr === "Year" ? "middle" : "end") // Center-align for years, end-align for rotated states
        .style("font-size", "12px")
        .attr("dx", xAttr === "Year" ? "0em" : "-0.5em") // Adjust horizontal position for rotated state tags
        .attr("dy", xAttr === "Year" ? "1em" : "0.5em"); // Add vertical offset for rotated state tags

    // Smooth transition for Y-Axis
    yAxisGroup
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .call(d3.axisLeft(yScale));

    // Adjust bar width and positioning
    const barWidth =
        xAttr === "Year"
            ? (xScale(aggregatedData[1]?.key || aggregatedData[0]?.key) -
                  xScale(aggregatedData[0]?.key || 0)) *
              0.8 // Scale the bar width to 80% of the tick distance
            : xScale.bandwidth();

    const bars = chart.selectAll("rect").data(aggregatedData);

    // Ensure gradient is defined only once
    let gradient = d3.select("defs #barGradient");
    if (gradient.empty()) {
        gradient = svg
            .append("defs")
            .append("linearGradient")
            .attr("id", "barGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "steelblue")
            .attr("stop-opacity", 0.8);

        gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "steelblue")
            .attr("stop-opacity", 0.4);
    }

    // Add interactive hover effects
    const tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
        d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("box-shadow", "0px 4px 8px rgba(0, 0, 0, 0.2)")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }

    // Enter and update bars with smooth transitions
    bars
        .enter()
        .append("rect")
        .merge(bars)
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .attr("x", (d) =>
            xAttr === "Year" ? xScale(d.key) - barWidth / 2 : xScale(d.key)
        )
        .attr("y", (d) => yScale(d.total))
        .attr("width", barWidth)
        .attr("height", (d) => height - yScale(d.total))
        .attr("fill", "url(#barGradient)");

    // Add hover interactivity
    chart
    .selectAll("rect")
    .on("mouseenter", function (event, d) {
        // Highlight the bar
        d3.select(this).attr("fill", "orange");

        // Update the tooltip
        d3.select(".tooltip")
            .html(`<strong>${xAttr}: ${d.key}</strong><br>Total: ${d.total}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`)
            .transition()
            .duration(200)
            .style("opacity", 1);

        // Highlight the map if xAttr is "Year"
        if (xAttr === "Year") {
            const selectedYear = d.key; // Get the year from the bar
            const rulingParty = rulingParties[selectedYear];

            // Change the map's color based on ruling party
            if (rulingParty === "Democrat") {
                mapSvg.selectAll("path").attr("fill", "blue");
            } else if (rulingParty === "Republican") {
                mapSvg.selectAll("path").attr("fill", "red");
            } else {
                mapSvg.selectAll("path").attr("fill", "#e0e0e0"); // Default gray
            }
        } else {
            highlightMapFromBar(d.key); // For non-year attributes, highlight specific regions
        }
    })
        .on("mousemove", function (event) {
            d3.select(".tooltip")
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseleave", function () {
            // Reset the bar color to gradient
            d3.select(this).attr("fill", "url(#barGradient)");
    
            // Hide the tooltip
            d3.select(".tooltip")
                .transition()
                .duration(200)
                .style("opacity", 0);
    
            // Reset the map highlight
            if (xAttr === "Year") {
                mapSvg.selectAll("path").attr("fill", "#e0e0e0");
            } else {
                resetMapHighlight();
            }
        });

    // Exit transition for bars
    bars
        .exit()
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    
}

// Draw the US Map Chart
function drawMapChart(geojson) {
    // Sort states alphabetically by name
    geojson.features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));

    // Debug: Log GeoJSON features
    console.log("GeoJSON Features:", geojson.features);

    // Filter out invalid features
    const validFeatures = geojson.features.filter((d) => path(d) !== null);

    mapSvg
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    mapSvg.selectAll("path")
        .data(validFeatures)
        .join("path")
        .attr("d", (d) => {
            console.log("Rendering state:", d.properties.name, path(d)); // Debugging log
            return path(d);
        })
        .attr("fill", "#e0e0e0")
        .attr("stroke", "#888")
        .attr("stroke-width", 0.5)
        .on("mouseenter", function (event, d) {
            d3.select(this).attr("fill", "orange");
        })
        .on("mouseleave", function () {
            d3.select(this).attr("fill", "#e0e0e0");
        });


    console.log(
        "Virginia Geometry:",
         geojson.features.find((d) => d.properties.name === "Virginia")
     );
     
}


function highlightMapFromBar(stateName) {
    mapSvg.selectAll("path")
        .filter((d) => d.properties.name === stateName)
        .attr("fill", "yellow");
}

// Reset map highlighting
function resetMapHighlight() {
    mapSvg.selectAll("path").attr("fill", "#e0e0e0");
}

// Load the US states GeoJSON file from local path
d3.json("../data/safety/us-states.geojson")
    .then((geojson) => {
        console.log("GeoJSON successfully loaded", geojson);
        drawMapChart(geojson);
    })
    .catch((error) => {
        console.error("Failed to load GeoJSON:", error);
    });

// Initialize with the first dataset
loadDataset("shooting");
});
