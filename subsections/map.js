class Map {
    constructor(allData) {
        // Width and height of the map
        this.width = 760;
        this.height = 500;
        this.data = allData;
        this.colors_arr = ["olive", "orange", "yellow", "red", "magenta", "pink"];
        this.factor_arr = [
            "Overall Score",
            "Unemployment Rate",
            "Population",
            "Average Salary",
            "Rental Cost",
            "Mortality Rate",
        ];

        // Create SVG element and append it to the DOM
        this.svg = d3.select("#map-view")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);
    }

    updateMap(option) {
        const value = this.getCSVPropertyName(option);
        const col = "rgb(217,91,67)";

        // Define color scale
        const yMin = d3.min(this.data, d => d[value]);
        const yMax = d3.max(this.data, d => d[value]);
        const color = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([d3.rgb(col).brighter(), d3.rgb(col).darker()]);

        // Tooltip setup
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-title")
            .style("opacity", 0);

        // Update GeoJSON with the data
        this.statesJson.features.forEach(feature => {
            const dataState = this.data.find(d => d.RegionName === feature.properties.name);
            if (dataState) {
                feature.properties[value] = dataState[value];
            }
        });

        // Bind data and create paths
        const self = this;
        const paths = this.svg.selectAll("path")
            .data(this.statesJson.features, d => d.properties.name);

        // Remove old paths
        paths.exit()
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();

        // Add new paths
        paths.enter()
            .append("path")
            .attr("id", d => `id_${d.properties.name.replace(/\s/g, '')}`)
            .merge(paths)
            .attr("d", this.path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", d => d.properties[value] ? color(d.properties[value]) : "rgb(213,222,217)")
            .on("click", function (event, d) {
                const stateData = self.data.find(data => data.RegionName.toLowerCase() === d.properties.name.toLowerCase());
                if (stateData) createTableForClickedState(stateData);
            })
            .on("mouseover", function (event, d) {
                const stateData = self.data.find(data => data.RegionName.toLowerCase() === d.properties.name.toLowerCase());
                if (stateData) {
                    const tooltip_data = {
                        state: stateData.RegionName,
                        price: stateData.cost_per_sqft,
                        population: stateData.total_population,
                        unemployement: stateData.Unemployment_rate,
                        salary: stateData.salary_avg,
                        mortality: stateData.Mortality_rate,
                    };
                    const body = self.tooltip_render(tooltip_data);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(body)
                        .style("left", `${event.pageX}px`)
                        .style("top", `${event.pageY}px`);
                    window.barChart.highlightState(stateData.RegionName);
                }
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        // Add labels
        const labels = this.svg.selectAll(".label")
            .data(this.statesJson.features, d => d.properties.name);

        labels.exit().remove();

        labels.enter()
            .append("text")
            .attr("class", "label")
            .merge(labels)
            .attr("x", d => this.path.centroid(d)[0])
            .attr("y", d => this.path.centroid(d)[1])
            .style("text-anchor", "middle")
            .text(d => d.properties.name);
    }

    drawMap(json, value) {
        this.statesJson = json;

        // D3 Projection
        this.projection = d3.geoAlbersUsa()
            .translate([this.width / 2, this.height / 2]) // Center map
            .scale(1000); // Scale to fit the US map

        // Path generator
        this.path = d3.geoPath().projection(this.projection);

        // Initial map rendering
        this.updateMap(value);
    }

    getCSVPropertyName(value) {
        const propertyMap = {
            unemployement: "Unemployment_rate",
            salary: "salary_avg",
            population: "total_population",
            price: "cost_per_sqft",
            mortality: "Mortality_rate",
        };
        return propertyMap[value];
    }

    tooltip_render(tooltip_data) {
        return `
            <h5>${tooltip_data.state}</h5>
            <ul>
                <li><strong>Population:</strong> ${tooltip_data.population}</li>
                <li><strong>Rental Cost ($/sq. ft.):</strong> ${tooltip_data.price}</li>
                <li><strong>Mortality Rate (%):</strong> ${tooltip_data.mortality}</li>
                <li><strong>Average Salary ($):</strong> ${tooltip_data.salary}</li>
                <li><strong>Unemployment Rate (%):</strong> ${tooltip_data.unemployement}</li>
            </ul>`;
    }

    highlightMap(arr) {
        // Reset all states
        this.svg.selectAll("path")
            .classed("highlight-class", false);

        // Highlight selected states
        arr.forEach(stateName => {
            const sanitizedStateName = stateName.replace(/\s/g, '');
            this.svg.select(`#id_${sanitizedStateName}`)
                .classed("highlight-class", true);
        });
    }

    displayWeights(val, obj, labels) {
        const self = this;
        const element = d3.select(`#${obj}`);
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-title")
            .style("opacity", 0);

        const scaledVal = val.map(v => v / 4);
        const chart = element.selectAll("rect")
            .data(scaledVal);

        const col = "rgb(217,91,67)";
        const yMin = d3.min(scaledVal);
        const yMax = d3.max(scaledVal);

        const color = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([d3.rgb(col).brighter(), d3.rgb(col).darker()]);

        chart.exit().remove();

        chart.enter()
            .append("rect")
            .merge(chart)
            .transition()
            .duration(2000)
            .attr("x", (d, i) => scaledVal.slice(0, i).reduce((acc, curr) => acc + curr, 5))
            .attr("width", d => d)
            .attr("y", 5)
            .attr("height", 15)
            .attr("fill", (_, i) => self.colors_arr[i]);

        element.selectAll("rect")
            .on("mouseover", (event, _, i) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltip.html(`<h5>${labels[i]}</h5>`)
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });

        // Add legends
        const legend = d3.select("#bar-legends-all").append("svg")
            .attr("width", 100)
            .attr("height", 150)
            .selectAll("g")
            .data(self.factor_arr)
            .enter()
            .append("g")
            .attr("transform", (_, i) => `translate(0, ${i * 20})`);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 3)
            .style("fill", (_, i) => self.colors_arr[i]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 4)
            .attr("dy", ".35em")
            .text((_, i) => self.factor_arr[i]);
    }
}
