document.addEventListener("DOMContentLoaded", () => {

    d3.json("../data/safety/us-states.geojson")
    .then((geojson) => {
        //console.log("GeoJSON successfully loaded:", geojson);
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

const mapWidth = 800;
const mapHeight = 500;
const projection = d3.geoAlbersUsa()
    .scale(1000) 
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

datasetSelect.addEventListener("change", () => {
    loadDataset(datasetSelect.value);
});

function loadDataset(dataset) {
    const filePath = datasetPaths[dataset];
    d3.csv(filePath)
        .then((loadedData) => {
            //console.log(`Raw data for ${dataset}:`, loadedData);
            if (dataset === "drugs") preprocessDrugDeaths(loadedData);
            else if (dataset === "traffic") preprocessTrafficFatalities(loadedData);
            else if (dataset === "shooting") preprocessSchoolShootings(loadedData);

            if (!data || data.length === 0) {
                console.error("No valid data found for the selected dataset.");
                return;
            }

            populateDropdowns();
            updateVisualization();
        })
        .catch((error) => {
            console.error(`Error loading dataset "${dataset}":`, error);
        });
}


function preprocessTrafficFatalities(loadedData) {
    //console.log("Raw Traffic Fatalities Data:", loadedData);

    data = loadedData.map((d) => ({
        Year: +d["Year"],
        State: d["State"]?.trim() || "Unknown",
        Fatalities: +d["Total Fatalities"] || null,
    })).filter((d) => d.Year && d.Fatalities !== null); 

    //console.log("Processed Traffic Fatalities:", data);
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
    //console.log("Processed School Shootings:", data);
}


function populateDropdowns() {
    
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

    xAxisSelect.innerHTML = "";
    ["Year", "State"].forEach((attr) => {
        const option = document.createElement("option");
        option.value = attr;
        option.textContent = attr;
        xAxisSelect.appendChild(option);
    });

    

    yAttributeSelect.removeEventListener("change", updateVisualization);
    yAttributeSelect.addEventListener("change",updateVisualization);

    xAxisSelect.removeEventListener("change", updateVisualization);
    xAxisSelect.addEventListener("change", updateVisualization);
}

let isPieChart = false; // Track the current visualization state

// Attach event listener to the toggle button
document.getElementById("toggle-visualization").addEventListener("click", function () {
    isPieChart = !isPieChart;
    this.textContent = isPieChart ? "Switch to Bar Chart" : "Switch to Pie Chart";
    updateVisualization(); // Update the visualization based on the current state
});

// Ensure the chart updates dynamically when the dataset or attributes change
datasetSelect.addEventListener("change", updateVisualization);
xAxisSelect.addEventListener("change", updateVisualization);
yAttributeSelect.addEventListener("change", updateVisualization);

// Clear the chart before rendering
function clearChart() {
    chart.selectAll("*").remove();
}

let currentVisualization = "bar"; // Track the active visualization type

function updateVisualization() {
    if (isPieChart) {
        // Clear chart-specific elements and hide axes
        chart.selectAll("rect").remove(); // Remove bars
        xAxisGroup.style("display", "none"); // Hide X-Axis
        yAxisGroup.style("display", "none"); // Hide Y-Axis

        // Reset the transform for the pie chart (centered)
        chart.attr("transform", `translate(${width / 2}, ${height / 2})`);
        drawPieChart(); // Render pie chart
    } else {
        //exitPieChart();
        // Clear pie chart-specific elements and show axes
        chart.selectAll("path").remove(); // Remove pie slices
        xAxisGroup.style("display", null); // Show X-Axis
        yAxisGroup.style("display", null); // Show Y-Axis

        // Reset the transform for the bar chart (with margins)
        chart.attr("transform", `translate(${margin.left},${margin.top})`);
        drawBarGraph(); // Render bar chart
    }
}



function drawBarGraph() {

    if (currentVisualization !== "bar") {
        chart.selectAll("*").remove(); // Clear chart area
        currentVisualization = "bar"; // Set the current visualization type to "bar"
    }

    chart.attr("transform", `translate(${margin.left},${margin.top})`);

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
                      d3.min(aggregatedData, (d) => +d.key) - 0.5, 
                      d3.max(aggregatedData, (d) => +d.key) + 0.5, 
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

    xAxisGroup
    .attr("transform", `translate(0, ${height})`)
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .call(
            xAttr === "Year"
                ? d3.axisBottom(xScale).tickFormat(d3.format("d")) 
                : d3.axisBottom(xScale)
        )
        .selectAll("text")
        .attr("transform", xAttr === "Year" ? "rotate(0)" : "rotate(-45)") 
        .style("text-anchor", xAttr === "Year" ? "middle" : "end") 
        .style("font-size", "12px")
        .attr("dx", xAttr === "Year" ? "0em" : "-0.5em") 
        .attr("dy", xAttr === "Year" ? "1em" : "0.5em"); 

    
    yAxisGroup
        .transition()
        .duration(800)
        .ease(d3.easeCubicInOut)
        .call(d3.axisLeft(yScale));

    
    const barWidth =
        xAttr === "Year"
            ? (xScale(aggregatedData[1]?.key || aggregatedData[0]?.key) -
                  xScale(aggregatedData[0]?.key || 0)) *
              0.8 
            : xScale.bandwidth();

    const bars = chart.selectAll("rect").data(aggregatedData);

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

    
    chart
    .selectAll("rect")
    .on("mouseenter", function (event, d) {
        
        d3.select(this).attr("fill", "orange");

        
        d3.select(".tooltip")
            .html(`<strong>${xAttr}: ${d.key}</strong><br>Total: ${d.total}`)
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`)
            .transition()
            .duration(200)
            .style("opacity", 1);

        
        if (xAttr === "Year") {
            const selectedYear = d.key; 
            const rulingParty = rulingParties[selectedYear];

            if (rulingParty === "Democrat") {
                mapSvg.selectAll("path").attr("fill", "blue");
            } else if (rulingParty === "Republican") {
                mapSvg.selectAll("path").attr("fill", "red");
            } else {
                mapSvg.selectAll("path").attr("fill", "#e0e0e0"); 
            }
        } else {
            highlightMapFromBar(d.key); 
        }
    })
        .on("mousemove", function (event) {
            d3.select(".tooltip")
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseleave", function () {
            
            d3.select(this).attr("fill", "url(#barGradient)");
    
            d3.select(".tooltip")
                .transition()
                .duration(200)
                .style("opacity", 0);
    
            if (xAttr === "Year") {
                mapSvg.selectAll("path").attr("fill", "#e0e0e0");
            } else {
                resetMapHighlight();
            }
        });

    bars
        .exit()
        .transition()
        .duration(500)
        .ease(d3.easeCubicInOut)
        .attr("y", height)
        .attr("height", 0)
        .remove();

    
}
function drawPieChart() {
    
    chart.selectAll("rect").remove(); 
    chart.selectAll("path").remove(); 

    
    if (!chart) {
        console.error("Error: `chart` selection is undefined or invalid.");
        return;
    }
    chart.attr("transform", `translate(${width / 2}, ${(height+100) / 2})`);

    const yAttr = yAttributeSelect.value;
    const xAttr = xAxisSelect.value;

    if (!data || data.length === 0) {
        console.error("Error: Data is undefined or empty.");
        return;
    }

    if (!xAttr || !yAttr) {
        console.error("Error: Attributes for x or y are not defined.");
        return;
    }

    // Group and aggregate data
    const groupedData = d3.group(data, (d) => d[xAttr]);
    const aggregatedData = Array.from(groupedData, ([key, values]) => ({
        key,
        total: d3.sum(values, (d) => d[yAttr]),
    }));

    if (aggregatedData.length === 0) {
        console.error("Error: Aggregated data is empty.");
        return;
    }

    const radius = Math.min(width, height) / 2;

    const pie = d3.pie()
        .value((d) => d.total)
        .sort((a, b) => {
            const sortAttr = document.getElementById("x-axis").value; 
            if (sortAttr === "state") {
                const stateA = a.state || ""; 
                const stateB = b.state || "";
                return stateA.localeCompare(stateB); 
            } else if (sortAttr === "year") {
                return a.year - b.year; // Numerical sorting
            } else {
                return 0; // No sorting
            }
        });
    const arcs = pie(aggregatedData);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const colors = d3.quantize(d3.interpolateRainbow, aggregatedData.length);
    const alternatingColors = aggregatedData.map((_, i) => colors[(i * 25) % colors.length]);
        
    const colorScale = d3.scaleOrdinal()
        .domain(aggregatedData.map((d) => d.key))
        .range(alternatingColors);

    // Bind data to paths
    const paths = chart.selectAll("path").data(arcs, (d) => d.data.key);

    // Exit selection: Remove unneeded slices
    paths
        .exit()
        .transition()
        .duration(500)
        .attrTween("d", function (d) {
            const interpolate = d3.interpolate(d, { startAngle: d.startAngle, endAngle: d.startAngle });
            return function (t) {
                return arc(interpolate(t));
            };
        })
        .remove();

    // Update selection: Update existing slices
    paths
        .transition()
        .duration(500)
        .attrTween("d", function (d) {
            const interpolate = d3.interpolate(this._current, d);
            this._current = d;
            return function (t) {
                return arc(interpolate(t));
            };
        })
        .attr("fill", (d) => colorScale(d.data.key));

    // Enter selection: Add new slices
    const pieGroup = paths
        .enter()
        .append("path")
        .attr("fill", (d) => colorScale(d.data.key))
        .each(function (d) {
            this._current = d; // Store the current position for later transitions
        })
        .transition()
        .duration(500)
        .attrTween("d", function (d) {
            const interpolate = d3.interpolate({ startAngle: d.startAngle, endAngle: d.startAngle }, d);
            return function (t) {
                return arc(interpolate(t));
            };
        });

    // Tooltip and interactivity
    chart.selectAll("path")
    .on("mouseenter", function (event, d) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
        console.log(d.data.key);

        d3.select(".tooltip")
            .html(
                `<strong>${xAttr}:</strong> ${d.data.key}<br>` +
                `<strong>${yAttr}:</strong> ${d.data.total}`
            )
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`)
            .transition()
            .duration(200)
            .style("opacity", 1);

        if (xAttr === "Year") {
            const selectedYear = d.data.key; // Extract the year
            const rulingParty = rulingParties[selectedYear]; // Get the ruling party

            if (rulingParty === "Democrat") {
                mapSvg.selectAll("path").attr("fill", "blue"); // Color the map blue
            } else if (rulingParty === "Republican") {
                mapSvg.selectAll("path").attr("fill", "red"); // Color the map red
            } else {
                mapSvg.selectAll("path").attr("fill", "#e0e0e0"); // Default color
            }
        } else {
            highlightMapFromBar(d.data.key); // Highlight the corresponding map state
        }
    })
    .on("mousemove", function (event) {
        d3.select(".tooltip")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 28}px`);
    })
    .on("mouseleave", function () {
        d3.select(this).attr("stroke", "none");

        d3.select(".tooltip")
            .transition()
            .duration(200)
            .style("opacity", 0);

        if (xAttr === "Year") {
            mapSvg.selectAll("path").attr("fill", "#e0e0e0"); // Reset map to default
        } else {
            resetMapHighlight(); // Reset map highlighting
        }
    });

}


function drawMapChart(geojson) {
    geojson.features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));

    const validFeatures = geojson.features.filter((d) => path(d) !== null);

    mapSvg
        .attr("width", mapWidth)
        .attr("height", mapHeight);

    mapSvg.selectAll("path")
        .data(validFeatures)
        .join("path")
        .attr("d", (d) => path(d))
        .attr("fill", "#e0e0e0")
        .attr("stroke", "#888")
        .attr("stroke-width", 0.5)
        .on("mouseenter", function (event, d) {
            const stateName = d.properties.name.trim(); // Ensure consistency in naming

            if (currentVisualization === "bar") {
                d3.select(this).attr("fill", "orange");
                chart.selectAll("rect")
                    .filter((barData) => barData.key === stateName)
                    .attr("fill", "orange");
            } else if (currentVisualization === "pie") {
                chart.selectAll("path")
                    .filter((pieData) => pieData.data && pieData.data.key === stateName) // Match state name to pie slice
                    .attr("stroke", "orange")
                    .attr("stroke-width", 2);
            }

            // Tooltip
            d3.select(".tooltip")
                .html(`<strong>State:</strong> ${stateName}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .transition()
                .duration(200)
                .style("opacity", 1);
        })
        .on("mousemove", function (event) {
            d3.select(".tooltip")
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseleave", function (event, d) {
            const stateName = d.properties.name.trim();

            if (currentVisualization === "bar") {
                d3.select(this).attr("fill", "#e0e0e0");
                chart.selectAll("rect")
                    .filter((barData) => barData.key === stateName)
                    .attr("fill", "url(#barGradient)");
            }  else if (currentVisualization === "pie") {
                chart.selectAll("path")
                    .filter((pieData) => pieData.data && pieData.data.key === stateName)
                    .attr("stroke", "none")
                    .attr("stroke-width", 1); // Reset to original stroke width
            }

            // Hide tooltip
            d3.select(".tooltip")
                .transition()
                .duration(200)
                .style("opacity", 0);
        });
}

// Highlight corresponding pie slice based on map hover
function highlightPieFromMap(stateName) {
    console.log(`Highlighting pie slice for state: ${stateName}`);
    chart.selectAll("path")
        .filter((d) => {
            const pieKey = d.data?.key.trim().toLowerCase(); // Trim and lowercase pie key
            const mapKey = stateName.trim().toLowerCase(); // Trim and lowercase map key
            console.log(`Comparing mapKey: "${mapKey}" with pieKey: "${pieKey}"`); // Debug log
            return pieKey === mapKey; // Match keys
        })
        .attr("stroke", "orange") // Highlight the slice
        .attr("stroke-width", 2);
}

/*
// Reset all pie slice highlights
function resetPieHighlight() {
    console.log("Resetting pie slice highlights");
    chart.selectAll("path")
        .attr("stroke", "#fff") // Reset stroke color
        .attr("stroke-width", 1); // Reset stroke width
}

function exitPieChart() {
    // Force the chart group to stay centered during exit
    chart.attr("transform", `translate(${width / 2}, ${(height + 100) / 2})`);

    const radius = Math.min(width, height) / 2;

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    chart.selectAll("path")
        .transition()
        .duration(500)
        .attrTween("d", function (d) {
            // Log current position and check for inconsistencies
            console.log("Exiting Slice Current State:", d);

            // Use the current `d` object as the starting position
            const current = { startAngle: d.startAngle, endAngle: d.endAngle };
            const interpolate = d3.interpolate(current, {
                startAngle: d.startAngle,
                endAngle: d.startAngle, // Collapse to a line
            });

            return function (t) {
                // Log the interpolated values for debugging
                const interpolated = interpolate(t);
                console.log("Interpolated Slice State:", interpolated);
                return arc(interpolated);
            };
        })
        .style("opacity", 0) // Fade out slices
        .remove(); // Remove after transition
}
*/





function highlightMapFromBar(stateName) {
    mapSvg.selectAll("path")
        .filter((d) => d.properties.name === stateName)
        .attr("fill", "orange");
}



function resetMapHighlight() {
    mapSvg.selectAll("path").attr("fill", "#e0e0e0");
}

d3.json("../data/safety/us-states.geojson")
    .then((geojson) => {
        //console.log("GeoJSON successfully loaded", geojson);
        drawMapChart(geojson);
    })
    .catch((error) => {
        console.error("Failed to load GeoJSON:", error);
    });

document.querySelectorAll("#controls select").forEach((select) => {
        select.addEventListener("mouseenter", () => {
            select.style.borderColor = "#007bff";
            select.style.boxShadow = "0 0 5px rgba(0, 123, 255, 0.5)";
        });
        select.addEventListener("mouseleave", () => {
            select.style.borderColor = "#ccc";
            select.style.boxShadow = "none";
        });
    });

loadDataset("shooting");
});
