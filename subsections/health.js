function drawHealth() {
    const svg = d3.select("#visualization-health");
    svg.selectAll("*").remove();

    // Dimensions and margin adjustments
    const width = svg.attr("width");
    const height = svg.attr("height");
    const margin = { top: 20, right: 30, bottom: 60, left: 90 };  
    const chartWidth = (width - margin.left - margin.right) / 2; // Adjusted for two charts
    const chartHeight = height - margin.top - margin.bottom;

    // Create two chart containers: one for 2012 and one for 2013
    const chart2012 = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const chart2013 = svg.append("g")
        .attr("transform", `translate(${chartWidth + margin.left * 2},${margin.top})`); // Positioned to the right of the first chart

    // Function to convert data
    function convertData(data) {
        data.forEach(d => {
            d["Uninsured % - Male"] = +d["Uninsured % - Male"] / 100;
            d["Uninsured % - Female"] = +d["Uninsured % - Female"] / 100;
            d["Under 18 - Uninsured %"] = +d["Under 18 - Uninsured %"] / 100;
            d["Uninsured % - 18 to 64"] = +d["Uninsured % - 18 to 64"] / 100;
            d["Uninsured % - 65+"] = +d["Uninsured % - 65+"] / 100;
        });
        return data;
    }

    // Load both datasets
    d3.csv("data/health/2012_Data.csv").then(data2012 => {
        d3.csv("data/health/2013_Data.csv").then(data2013 => {
            // Convert both datasets
            const convertedData2012 = convertData(data2012);
            const convertedData2013 = convertData(data2013);

            // Populate the state dropdown (based on 2012 data)
            const stateSelect = d3.select("#state-select");
            stateSelect.selectAll("option")
                .data(convertedData2012)
                .enter()
                .append("option")
                .attr("value", d => d["Geographic Area Name"])
                .text(d => d["Geographic Area Name"]);

            // Populate the view dropdown for gender or age group
            const viewSelect = d3.select("#view-select");
            viewSelect.selectAll("option")
                .data(["Gender", "Age Group"])
                .enter()
                .append("option")
                .attr("value", d => d)
                .text(d => d);

            // Set default values
            stateSelect.property("value", "Alaska");
            viewSelect.property("value", "Gender");

            // Function to update chart for a specific dataset (2012 or 2013)
            function updateChart(selectedState, viewType, chartData, chart) {
                const selectedData = chartData.filter(d => d["Geographic Area Name"] === selectedState);

                chart.selectAll("*").remove();

                if (selectedData.length === 0) return;

                let x, y, color, chartDataPoints, yAxisLegendText;

                if (viewType === "Gender") {
                    x = d3.scaleBand()
                        .domain(["Male", "Female"])
                        .range([0, chartWidth])
                        .padding(0.3);

                    y = d3.scaleLinear()
                        .domain([0, d3.max(selectedData, d => Math.max(d["Uninsured % - Male"], d["Uninsured % - Female"]))])
                        .nice()
                        .range([chartHeight, 0]);

                    color = d3.scaleOrdinal()
                        .domain(["Male", "Female"])
                        .range(["#1f77b4", "#ff7f0e"]);

                    chartDataPoints = [
                        { key: "Male", value: selectedData[0]["Uninsured % - Male"] },
                        { key: "Female", value: selectedData[0]["Uninsured % - Female"] }
                    ];

                    yAxisLegendText = "Uninsured Population (%) by Gender";
                } else if (viewType === "Age Group") {
                    x = d3.scaleBand()
                        .domain(["Under 18", "18 to 64", "65+"])
                        .range([0, chartWidth])
                        .padding(0.3);

                    y = d3.scaleLinear()
                        .domain([0, d3.max(selectedData, d => Math.max(d["Under 18 - Uninsured %"], d["Uninsured % - 18 to 64"], d["Uninsured % - 65+"]))])
                        .nice()
                        .range([chartHeight, 0]);

                    color = d3.scaleOrdinal()
                        .domain(["Under 18", "18 to 64", "65+"])
                        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

                    chartDataPoints = [
                        { key: "Under 18", value: selectedData[0]["Under 18 - Uninsured %"] },
                        { key: "18 to 64", value: selectedData[0]["Uninsured % - 18 to 64"] },
                        { key: "65+", value: selectedData[0]["Uninsured % - 65+"] }
                    ];

                    yAxisLegendText = "Uninsured Population (%) by Age Group";
                }

                // Draw the lollipop "sticks" (lines)
                chart.selectAll("line")
                    .data(chartDataPoints)
                    .enter().append("line")
                    .attr("x1", d => x(d.key) + x.bandwidth() / 2)
                    .attr("y1", d => y(d.value))
                    .attr("x2", d => x(d.key) + x.bandwidth() / 2)
                    .attr("y2", chartHeight)
                    .attr("stroke", d => color(d.key))
                    .attr("stroke-width", 2);

                // Draw the lollipop "heads" (circles)
                chart.selectAll("circle")
                    .data(chartDataPoints)
                    .enter().append("circle")
                    .attr("cx", d => x(d.key) + x.bandwidth() / 2)
                    .attr("cy", d => y(d.value))
                    .attr("r", 6)
                    .attr("fill", d => color(d.key));

                // X-axis
                chart.append("g")
                    .attr("class", "x-axis")
                    .attr("transform", `translate(0,${chartHeight})`)
                    .call(d3.axisBottom(x));

                // X-axis legend
                chart.append("text")
                    .attr("x", chartWidth / 2)
                    .attr("y", chartHeight + 40)
                    .attr("text-anchor", "middle")
                    .text(viewType === "Gender" ? "Gender" : "Age Group")
                    .attr("font-size", "16px");

                // Y-axis
                chart.append("g")
                    .attr("class", "y-axis")
                    .call(d3.axisLeft(y).tickFormat(d3.format(".0%")));

                // Y-axis legend
                chart.append("text")
                    .attr("x", -chartHeight / 2)
                    .attr("y", -50)
                    .attr("transform", "rotate(-90)")
                    .attr("text-anchor", "middle")
                    .text(yAxisLegendText)
                    .attr("font-size", "16px");
            }

            // Default chart updates for 'Alaska' and 'Gender'
            updateChart("Alaska", "Gender", convertedData2012, chart2012);
            updateChart("Alaska", "Gender", convertedData2013, chart2013);

            // Event handlers for dropdown changes
            stateSelect.on("change", function () {
                const selectedState = this.value;
                const selectedView = viewSelect.property("value");
                updateChart(selectedState, selectedView, convertedData2012, chart2012);  // Update 2012 chart
                updateChart(selectedState, selectedView, convertedData2013, chart2013);  // Update 2013 chart
            });

            viewSelect.on("change", function () {
                const selectedView = this.value;
                const selectedState = stateSelect.property("value");
                updateChart(selectedState, selectedView, convertedData2012, chart2012);  // Update 2012 chart
                updateChart(selectedState, selectedView, convertedData2013, chart2013);  // Update 2013 chart
            });
        });
    });
}

drawHealth();
