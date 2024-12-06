// Economy.js

export function drawEconomy() {
    const economyDataPath = "data/Economy/"; // Path to economy data folder
    const years = ["2016", "2017", "2018", "2019", "2020", "2021", "2022"];
    const attributes = ["unemployment_rate", "mortality_rate", "salary_avg", "cost_per_sq_ft"];

    let selectedYear = "2022"; // Default year
    let selectedAttribute = "unemployment_rate"; // Default attribute
    let dataByYear = {};

    // Load data for all years
    Promise.all(
        years.map(year => d3.csv(`${economyDataPath}${year}_us_states_data.csv`))
    ).then(files => {
        years.forEach((year, index) => {
            dataByYear[year] = files[index].map(d => ({
                state: d.RegionName,
                unemployment_rate: +d.Unemployment_rate,
                mortality_rate: +d.Mortality_rate,
                salary_avg: +d.salary_avg,
                cost_per_sq_ft: +d.cost_per_sq_ft
            }));
        });

        // Draw initial visualization
        drawMap(dataByYear[selectedYear], selectedAttribute);
        drawBarChart(dataByYear[selectedYear], selectedAttribute);

        // Event listeners for year and attribute selection
        d3.select("#yearDropdown").on("change", function () {
            selectedYear = this.value;
            updateVisualizations(dataByYear[selectedYear], selectedAttribute);
        });

        d3.select("#attributeDropdown").on("change", function () {
            selectedAttribute = this.value;
            updateVisualizations(dataByYear[selectedYear], selectedAttribute);
        });
    });

    // Function to draw the map visualization
    function drawMap(data, attribute) {
        const svg = d3.select("#us-map");
        svg.selectAll("*").remove();

        const width = 500;
        const height = 300;

        // Create projection and path generator
        const projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(700);
        const path = d3.geoPath().projection(projection);

        // Load GeoJSON and bind data
        d3.json("us-state-centroid.json").then(us => {
            const states = topojson.feature(us, us.objects.states).features;

            const colorScale = d3.scaleSequential(d3.interpolateBlues)
                .domain(d3.extent(data, d => d[attribute]));

            svg.selectAll(".state")
                .data(states)
                .join("path")
                .attr("d", path)
                .attr("class", "state")
                .attr("fill", d => {
                    const stateData = data.find(state => state.state === d.properties.name);
                    return stateData ? colorScale(stateData[attribute]) : "#ccc";
                })
                .attr("stroke", "#fff")
                .on("mouseover", (event, d) => {
                    const stateData = data.find(state => state.state === d.properties.name);
                    if (stateData) {
                        d3.select("#tooltip")
                            .style("visibility", "visible")
                            .text(`${d.properties.name}: ${stateData[attribute]}`);
                    }
                })
                .on("mousemove", event => {
                    d3.select("#tooltip")
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + 10 + "px");
                })
                .on("mouseout", () => {
                    d3.select("#tooltip").style("visibility", "hidden");
                });
        });
    }

    // Function to draw the bar chart visualization
    function drawBarChart(data, attribute) {
        const svg = d3.select("#barplot");
        svg.selectAll("*").remove();

        const width = 500;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 50, left: 70 };

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.state))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d[attribute])])
            .range([height - margin.bottom, margin.top]);

        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain(d3.extent(data, d => d[attribute]));

        svg.append("g")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => xScale(d.state))
            .attr("y", d => yScale(d[attribute]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => yScale(0) - yScale(d[attribute]))
            .attr("fill", d => colorScale(d[attribute]))
            .on("mouseover", (event, d) => {
                d3.select("#tooltip")
                    .style("visibility", "visible")
                    .text(`${d.state}: ${d[attribute]}`);
            })
            .on("mousemove", event => {
                d3.select("#tooltip")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");
            })
            .on("mouseout", () => {
                d3.select("#tooltip").style("visibility", "hidden");
            });

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .attr("text-anchor", "end");

        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale).ticks(5));
    }

    // Function to update both visualizations
    function updateVisualizations(data, attribute) {
        drawMap(data, attribute);
        drawBarChart(data, attribute);
    }
}
