function drawEconomy() {
    // Load Data and Initialize Visualizations
    Promise.all([
        d3.csv("data/Economy/2016_us_states_data.csv"),
        d3.csv("data/Economy/2017_us_states_data.csv"),    
        d3.csv("data/Economy/2018_us_states_data.csv"),
        d3.csv("data/Economy/2019_us_states_data.csv"),
        d3.csv("data/Economy/2020_us_states_data.csv"),
        d3.csv("data/Economy/2021_us_states_data.csv"),
        d3.csv("data/Economy/2022_us_states_data.csv")
    ]).then(([data2016, data2017, data2018, data2019, data2020, data2021, data2022]) => {
        const allData = [
            ...data2016.map(d => ({ ...d, year: 2016 })),
            ...data2017.map(d => ({ ...d, year: 2017 })),
            ...data2018.map(d => ({ ...d, year: 2018 })),
            ...data2019.map(d => ({ ...d, year: 2019 })),
            ...data2020.map(d => ({ ...d, year: 2020 })),
            ...data2021.map(d => ({ ...d, year: 2021 })),
            ...data2022.map(d => ({ ...d, year: 2022 }))
        ];

        // Convert numeric columns
        allData.forEach(d => {
            d.total_population = +d.total_population;
            d.Unemployment_rate = +d.Unemployment_rate;
            d.salary_avg = +d.salary_avg;
            d.Mortality_rate = +d.Mortality_rate;
            d.cost_per_sqft = +d.cost_per_sqft;
        });

        processRankings(allData);
        setupDropdowns(allData);
        updateVisualizations(allData, "Unemployment_rate", 2016);
    });

    // Process Rankings
    function processRankings(data) {
        const rankBy = (key, ascending = true) => {
            data.sort((a, b) => ascending ? b[key] - a[key] : a[key] - b[key]);
            data.forEach((d, i) => (d[`${key}_RANK`] = i + 1));
        };
        rankBy("total_population");
        rankBy("salary_avg", false);
        rankBy("Unemployment_rate");
        rankBy("Mortality_rate");
        rankBy("cost_per_sqft");
    }

    // Draw Map
    function drawMap(data, metric) {
        const width = 800, height = 500;
    
        // Create an SVG container
        const svg = d3.select("#visualization-economy-map")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", `0 0 ${width} ${height}`);
    
        // Define map projection and path
        const projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2])
            .scale(1200);
    
        const path = d3.geoPath().projection(projection);
    
        // Define a color scale for the metric
        const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain(d3.extent(data, d => d[metric]));
    
        // Create tooltip dynamically
        const tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("border-radius", "4px")
            .style("padding", "10px")
            .style("font-size", "12px")
            .style("box-shadow", "0px 4px 8px rgba(0, 0, 0, 0.1)")
            .style("pointer-events", "none")
            .style("opacity", 0);
    
        // Load GeoJSON data
        d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(geoData => {
            const states = topojson.feature(geoData, geoData.objects.states).features;
    
            // Bind data to GeoJSON features
            states.forEach(state => {
                const stateData = data.find(d => d.RegionName.trim().toLowerCase() === state.properties.name.trim().toLowerCase());
                if (stateData) {
                    state.properties[metric] = stateData[metric];
                    state.properties.total_population = stateData.total_population;
                    state.properties.salary_avg = stateData.salary_avg;
                    state.properties.Mortality_rate = stateData.Mortality_rate;
                    state.properties.cost_per_sqft = stateData.cost_per_sqft;
                } else {
                    state.properties[metric] = "N/A";
                    state.properties.total_population = "N/A";
                    state.properties.salary_avg = "N/A";
                }
            });
    
            // Draw the map
            svg.selectAll("path")
                .data(states)
                .join("path")
                .attr("d", path)
                .attr("fill", d => d.properties[metric] && d.properties[metric] !== "N/A" ? colorScale(d.properties[metric]) : "#ccc")
                .attr("stroke", "#fff")
                .on("mouseover", (event, d) => {
                    tooltip
                        .style("opacity", 1)
                        .html(`
                            <strong>${d.properties.name}</strong><br>
                            <strong>${metric}:</strong> ${d.properties[metric] || "N/A"}<br>
                            <strong>Population:</strong> ${d.properties.total_population || "N/A"}<br>
                            <strong>Average Salary:</strong> ${d.properties.salary_avg || "N/A"}<br>
                            <strong>Cost Per SQFT:</strong> ${d.properties.cost_per_sqft || "N/A"}<br>
                            <strong>Mortality Rate:</strong> ${d.properties.Mortality_rate || "N/A"}
                        `)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
                })
                .on("mouseout", () => {
                    tooltip.style("opacity", 0);
                });
    
            // Add state names to the map
            svg.selectAll("text")
                .data(states)
                .join("text")
                .attr("x", d => path.centroid(d)[0])
                .attr("y", d => path.centroid(d)[1])
                .text(d => d.properties.name)
                .attr("font-size", "10px")
                .attr("fill", "#000")
                .attr("text-anchor", "middle")
                .style("pointer-events", "none");
        });
    }
    
    

    // Draw Bar Chart
    function drawBarChart(data, selectedMetric) {
        const margin = { top: 20, right: 20, bottom: 50, left: 150 }; // Adjust left margin for long state names
    
        // Define aspect ratio
        const aspectRatio = 16 / 9;
    
        // Calculate width and height based on the parent container
        const containerWidth = document.querySelector("#visualization-economy-bar").clientWidth;
        const width = containerWidth;
        const height = width / aspectRatio;
    
        // Clear the previous chart
        d3.select("#visualization-economy-bar").selectAll("*").remove();
    
        const svg = d3.select("#visualization-economy-bar")
            .attr("viewBox", `0 0 ${width} ${height}`) // Make it responsive
            .attr("preserveAspectRatio", "xMidYMid meet")
            .classed("svg-content-responsive", true);
    
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
    
        const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
        // Scales
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[selectedMetric]) || 0])
            .range([0, chartWidth]);
    
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.RegionName).sort())
            .range([0, chartHeight])
            .padding(0.1);
    
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([d3.min(data, d => d[selectedMetric]) || 0, d3.max(data, d => d[selectedMetric]) || 0]);
    
        const usAverage = d3.mean(data, d => d[selectedMetric]);
        
        // Create Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("pointer-events", "none")
            .style("font-size", "12px");
    
        // Draw Bars
        const bars = g.selectAll(".bar")
            .data(data, d => d.RegionName);
    
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.RegionName))
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d[selectedMetric]))
            .attr("width", 0) // Start with 0 width for transition
            .on("mouseover", (event, d) => {
                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>State:</strong> ${d.RegionName}<br>
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>${selectedMetric.replace("_", " ").toUpperCase()}:</strong> ${d[selectedMetric] || "N/A"}<br>
                        <strong>${selectedMetric.replace("_", " ")} US Avg:</strong> ${usAverage.toFixed(2)}
                    `)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            })
            .transition()
            .duration(1000)
            .attr("width", d => xScale(d[selectedMetric]));
    
        bars.exit()
            .transition()
            .duration(500)
            .attr("width", 0)
            .remove();
    
        // Calculate and Add Average Line
        const avgValue = d3.mean(data, d => d[selectedMetric]);
        g.append("line")
            .attr("x1", xScale(avgValue))
            .attr("x2", xScale(avgValue))
            .attr("y1", 0)
            .attr("y2", chartHeight)
            .attr("stroke", "black")
            .attr("stroke-dasharray", "4 4") // Dashed line
            .attr("stroke-width", 2);
    
        // Add label for the average line
        g.append("text")
            .attr("x", xScale(avgValue) + 5)
            .attr("y", -5)
            .attr("fill", "black")
            .attr("font-size", "10px")
            .text(`Avg: ${avgValue.toFixed(2)}`);
    
        // Add Axes
        const xAxis = d3.axisBottom(xScale).ticks(5);
        const yAxis = d3.axisLeft(yScale);
    
        g.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(xAxis)
            .attr("class", "x-axis");
    
        g.append("g")
            .call(yAxis)
            .attr("class", "y-axis")
            .selectAll("text")
            .style("font-size", `${Math.max(10, chartHeight / data.length / 2)}px`) // Dynamically adjust font size
            .style("font-family", "Times New Roman") // Set font family to Times New Roman
            .style("text-anchor", "end");
    }
    
    
    

    // Setup Dropdowns
    function setupDropdowns(data) {
        const metrics = ["Unemployment_rate", "salary_avg", "total_population", "cost_per_sqft", "Mortality_rate"];
        const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);

        const metricSelector = d3.select("#metric-selector");
        metrics.forEach(metric => {
            // Replace underscores with spaces and capitalize the words
            const formattedLabel = metric
                .replace(/_/g, " ")          // Replace underscores with spaces
                .toLowerCase()               // Convert to lowercase
                .replace(/^\w|\s\w/g, c => c.toUpperCase()); // Capitalize the first letter of each word
            metricSelector.append("option").attr("value", metric).text(formattedLabel);
        });
    
        const yearSelector = d3.select("#year-selector");
        years.forEach(year => {
            yearSelector.append("option").attr("value", year).text(year);
        });
    
        metricSelector.on("change", () => updateVisualizations(data, metricSelector.property("value"), +yearSelector.property("value")));
        yearSelector.on("change", () => updateVisualizations(data, metricSelector.property("value"), +yearSelector.property("value")));
    }
    

    // Update Visualizations
    function updateVisualizations(data, metric, year) {
        const filteredData = data.filter(d => d.year === year);
        drawMap(filteredData, metric);
        drawBarChart(filteredData, metric);
    }
}
