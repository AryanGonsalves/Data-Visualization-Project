function drawHealth() {
    const svg = d3.select("#visualization-health");
    svg.selectAll("*").remove();

    const width = svg.attr("width");
    const height = svg.attr("height");
    const margin = { top: 100, right: 30, bottom: 90, left: 100 };
    const chartWidth = (width - margin.left - margin.right) / 2;
    const chartHeight = height - margin.top - margin.bottom;
    const verticalOffset = 140;
    const horizontalSpacing = 280;

    // Updated Background Gradient
    svg.append("defs").append("linearGradient")
        .attr("id", "bg-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%")
        .selectAll("stop")
        .data([
            { offset: "0%", color: "#e0f7fa" },
            { offset: "100%", color: "#80deea" }
        ])
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    svg.style("background", "url(#bg-gradient)");

    const chart2012 = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top + verticalOffset})`);

    const chart2013 = svg.append("g")
        .attr("transform", `translate(${chartWidth + margin.left + horizontalSpacing},${margin.top + verticalOffset})`);

    // Enhanced Chart Titles
    svg.append("text")
        .attr("x", margin.left + chartWidth / 2 * 1.25)
        .attr("y", margin.top + 30)
        .attr("text-anchor", "middle")
        .text("Democratic Part Health Insurance Data (Uninsured)")
        .attr("font-size", "22px")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-weight", "bold")
        .attr("fill", "#0000FF");

    svg.append("text")
        .attr("x", margin.left + chartWidth * 1.5 + horizontalSpacing)
        .attr("y", margin.top + 30)
        .attr("text-anchor", "middle")
        .text("Republican Party Health Insurance Data (Uninsured)")
        .attr("font-size", "22px")
        .attr("font-family", "Arial, sans-serif")
        .attr("font-weight", "bold")
        .attr("fill", "#D22B2B");

    // Enhanced Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "#ffffff")
        .style("box-shadow", "0px 6px 12px rgba(0, 0, 0, 0.15)")
        .style("border", "2px solid #80cbc4")
        .style("padding", "10px 14px")
        .style("border-radius", "8px")
        .style("font-size", "14px")
        .style("pointer-events", "none")
        .style("color", "#004d40");

    function convertData(data) {
        return data.map(d => ({
            ...d,
            "Uninsured % - Male": +d["Uninsured % - Male"] / 100,
            "Uninsured % - Female": +d["Uninsured % - Female"] / 100,
            "Under 18 - Uninsured %": +d["Under 18 - Uninsured %"] / 100,
            "Uninsured % - 18 to 64": +d["Uninsured % - 18 to 64"] / 100,
            "Uninsured % - 65+": +d["Uninsured % - 65+"] / 100,
        }));
    }

    function updateChart(selectedState, viewType, data, chart, chartPosition) {
        chart.selectAll("*").remove();
    
        const selectedData = data.find(d => d["Geographic Area Name"] === selectedState);
        if (!selectedData) return;
    
        if (viewType === "Gender") {
            renderLollipopChart(chart, selectedData, chartWidth, chartHeight, chartPosition);
        } else {
            renderDonutChart(chart, selectedData, chartWidth, chartHeight, chartPosition);
        }
    }    

    function renderLollipopChart(chart, selectedData, chartWidth, chartHeight, chartPosition) {
        const keys = ["Male", "Female"];
        const values = [selectedData["Uninsured % - Male"], selectedData["Uninsured % - Female"]];
        const x = d3.scaleBand().domain(keys).range([0, chartWidth]).padding(0.6); // Increased padding for more space
        const y = d3.scaleLinear().domain([0, d3.max(values)]).nice().range([chartHeight, 0]);
        
        // Apply blue color scale for left chart (2012) and red color scale for right chart (2013)
        const color = d3.scaleOrdinal()
            .domain(keys)
            .range(chartPosition == 'left' ? ["#007BFF", "#0056b3"] : ["#D2042D", "#880808"]);
    
        chart.append("g").call(d3.axisLeft(y).tickFormat(d3.format(".0%")));
    
        chart.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x))
            .selectAll("text").attr("transform", "translate(0,10)");
    
        // Adding axis labels (Legends)
        chart.append("text")
            .attr("x", chartWidth / 2)
            .attr("y", chartHeight + 40) // Positioning below the X-axis
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "Arial, sans-serif")
            .text("Gender");
    
        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -chartHeight / 2)
            .attr("y", -60) // Positioning to the left of the Y-axis
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "Arial, sans-serif")
            .text("Uninsured Percentage");
    
        const lollipops = chart.selectAll(".lollipop").data(keys).enter().append("g").attr("class", "lollipop");
    
        lollipops.append("line")
            .attr("x1", d => x(d) + x.bandwidth() / 2)
            .attr("y1", chartHeight)
            .attr("x2", d => x(d) + x.bandwidth() / 2)
            .attr("y2", chartHeight)
            .attr("stroke", d => color(d))
            .attr("stroke-width", 4) // Increased line thickness
            .transition().duration(800)
            .attr("y2", (d, i) => y(values[i]));
    
        lollipops.append("circle")
            .attr("cx", d => x(d) + x.bandwidth() / 2)
            .attr("cy", chartHeight)
            .attr("r", 10) // Increased radius for better visibility
            .attr("fill", d => color(d))
            .on("mouseover", (event, d) => {
                const value = values[keys.indexOf(d)];
                tooltip.style("visibility", "visible")
                    .html(`<strong>${d}:</strong> ${(value * 100).toFixed(2)}%`);
            })
            .on("mousemove", event => {
                tooltip.style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            })
            .transition().duration(800)
            .attr("cy", (d, i) => y(values[i]));
    }
    
    function renderDonutChart(chart, selectedData, chartWidth, chartHeight, chartPosition) {
        const radius = Math.min(chartWidth, chartHeight - 20) / 2 * 1.75; // Increased size of the donut chart
        const innerRadius = radius * 0.4; // Thinner inner radius for a more pronounced donut effect
        const keys = ["Under 18", "18 to 64", "65+"];
        const values = [selectedData["Under 18 - Uninsured %"], selectedData["Uninsured % - 18 to 64"], selectedData["Uninsured % - 65+"]];
    
        const total = d3.sum(values);
    
        // Apply blue and red color scales based on chart position
        const color = d3.scaleOrdinal()
            .domain(keys)
            .range(chartPosition === 'left' ? ["#80deea", "#4dd0e1", "#0288d1"] : ["#ff7961", "#d32f2f", "#c62828"]);
        // Create gradients for each donut section
        const defs = chart.append("defs");
        defs.append("linearGradient")
            .attr("id", "gradient1")
            .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%")
            .selectAll("stop")
            .data([
                { offset: "0%", color: "#A7C7E7" },
                { offset: "100%", color: "#3E8BFF" }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);
    
        defs.append("linearGradient")
            .attr("id", "gradient2")
            .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%")
            .selectAll("stop")
            .data([
                { offset: "0%", color: "#F9A3B0" },
                { offset: "100%", color: "#E74C3C" }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);
    
        defs.append("linearGradient")
            .attr("id", "gradient3")
            .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%")
            .selectAll("stop")
            .data([
                { offset: "0%", color: "#E8FF9A" },
                { offset: "100%", color: "#F9E72F" }
            ])
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color);
    
        const pie = d3.pie().value(d => d)(values);
        const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius); // Create a donut shape
        const labelArc = d3.arc().innerRadius(radius * 0.7).outerRadius(radius * 1.05); // Label placement
    
        const g = chart.append("g").attr("transform", `translate(${chartWidth / 2},${chartHeight / 2})`);
    
        // Draw donut sections
        g.selectAll("path")
            .data(pie)
            .enter().append("path")
            .attr("d", arc)
            .attr("fill", (_, i) => color(keys[i]))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .on("mouseover", (event, d) => {
                const label = keys[d.index];
                const value = values[d.index];
                tooltip.style("visibility", "visible")
                    .html(`<strong>${label}:</strong> ${(value * 100).toFixed(2)}%`);
            })
            .on("mousemove", event => {
                tooltip.style("top", `${event.pageY + 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseout", () => {
                tooltip.style("visibility", "hidden");
            })
            .transition()
            .duration(800)
            .attrTween("d", function (d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function (t) {
                    return arc(interpolate(t));
                };
            });
    
        // Add percentage labels inside the donut
        g.selectAll("text")
            .data(pie)
            .enter().append("text")
            .attr("transform", d => `translate(${labelArc.centroid(d)})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-family", "Arial, sans-serif")
            .style("fill", "black")
            .text((d, i) => keys[i]);
    }
     

    d3.csv("data/health/2012_Data.csv").then(data2012 => {
        const convertedData2012 = convertData(data2012);
        d3.csv("data/health/2013_Data.csv").then(data2013 => {
            const convertedData2013 = convertData(data2013);
            const stateSelect = d3.select("#state-select");
            stateSelect.selectAll("option")
                .data(convertedData2012.map(d => d["Geographic Area Name"]))
                .enter().append("option")
                .attr("value", d => d)
                .text(d => d);

            const viewSelect = d3.select("#view-select");
            viewSelect.selectAll("option")
                .data(["Gender", "Age Group"])
                .enter().append("option")
                .attr("value", d => d)
                .text(d => d);

            function render() {
                const selectedState = stateSelect.property("value");
                const selectedView = viewSelect.property("value");
                updateChart(selectedState, selectedView, convertedData2012, chart2012, 'left');
                updateChart(selectedState, selectedView, convertedData2013, chart2013, 'right');
            }

            render();
            stateSelect.on("change", render);
            viewSelect.on("change", render);
        });
    });
}

drawHealth();  
