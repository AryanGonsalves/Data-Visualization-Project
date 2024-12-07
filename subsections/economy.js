function drawEconomy(){
    // Initialize global variables
    let employmentData = [];
    let populationData = [];
    let salaryData = [];
    let mortalityData = [];
    let rentalData = [];
    let index = 0;
    let topStates = []; // This will store the top states for analysis

    // Load CSV and JSON data using Promises
    Promise.all([
        d3.csv("data/Economy/2022_us_states_data.csv"),
        d3.json("us-state-centroid.json")
    ]).then(([allData, usStateCentroids]) => {
        // Convert numeric values to numbers
        allData.forEach((d) => {
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        // Helper function to assign rankings
        const assignRank = (key, rankKey, order = 'desc') => {
            const sortedData = [...allData].sort((a, b) =>
                order === 'desc' ? b[key] - a[key] : a[key] - b[key]
            );
            sortedData.forEach((d, i) => {
                d[rankKey] = order === 'desc' ? i + 1 : allData.length - i;
            });
        };

        // Assign ranks for different metrics
        assignRank('total_population', 'total_population_RANK', 'desc');
        assignRank('salary_avg', 'salary_avg', 'asc');
        assignRank('Unemplpoyment_rate', 'Unemployment_rate_RANK', 'desc');
        assignRank('Mortality_rate', 'Mortality_rate_RANK', 'desc');
        assignRank('cost_per_sqft', 'cost_per_sqft_RANK', 'desc');
        
        // Initialize global data and visualizations
        economy_data = allData;
        economy_usaMap = new economy_Map(allData);
        window.barChart = new economy_BarChart(allData);

        // Draw map and bar chart
        economy_usaMap.drawMap(usStateCentroids, 'unemployement');
        barChart.updateBarChart('unemployement');
    }).catch((error) => {
        console.error("Error loading data:", error);
    });
    // Function to load and process data for a specific year
    async function loadYearlyData(year) {
        const fileName = `data/Economy/${year}_us_states_data.csv`;

        // Load data using D3's Promise-based CSV loader
        const allData = await d3.csv(fileName);

        // Convert numeric values to numbers
        allData.forEach((d) => {
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        // Initialize yearly data objects for each metric
        employmentData[index] = { year, data: [] };
        populationData[index] = { year, data: [] };
        salaryData[index] = { year, data: [] };
        mortalityData[index] = { year, data: [] };
        rentalData[index] = { year, data: [] };

        // Populate data arrays for top states
        topStates.forEach((state, j) => {
            const stateData = allData.find((d) => d['RegionName'] === state);

            if (stateData) {
                employmentData[index].data[j] = stateData['Unemployment_rate'];
                populationData[index].data[j] = stateData['total_population'];
                salaryData[index].data[j] = stateData['salary_avg'];
                mortalityData[index].data[j] = stateData['Mortality_rate'];
                rentalData[index].data[j] = stateData['cost_per_sqft'];
            }
        });

        index++;
    }
    

    // Recursive function to load data for multiple years
    async function loadAllYears(startYear, endYear) {
        for (let year = startYear; year >= endYear; year--) {
            await loadYearlyData(year);
        }

        // Call the function to draw the line chart after all data is loaded
        economy_drawLineChart();
    }
    function economy_updateMap(value) {
        // Remove existing map paths
        d3.select("#map-view").selectAll("path").remove();

        // Reset bar chart highlights
        d3.select("#bar-chart").selectAll("rect").classed("highlight-class", false);

        // Clear the table content
        const tableElement = document.getElementById('table');
        if (tableElement) {
            tableElement.innerHTML = '';
        }

        // Update the map and bar chart with the new value
        if (economy_usaMap && typeof economy_usaMap.updateMap === 'function') {
            economy_usaMap.economy_updateMap(value);
        }

        if (barChart && typeof barChart.updateBarChart === 'function') {
            barChart.economy_updateBarChart(value);
        }

        // Clear input fields and reset UI elements
        economy_clearFields();

        // Update the ShowButton text and styling
        const showButton = document.getElementById("ShowButton");
        if (showButton) {
            showButton.innerText = "Give my top states";
            showButton.style.backgroundColor = '#8b221b';
        }

        // Hide the info panel
        const infoPanel = document.getElementById("infoPanel");
        if (infoPanel) {
            infoPanel.style.display = "none";
        }
    }
    function economy_clearFields() {
        // Define the IDs of the fields to clear
        const fieldsToClear = [
            'population',
            'unemployement',
            'mortality',
            'salary',
            'rental',
            'line-chart',
            'legend-line-chart'
        ];

        // Clear values and innerHTML for each field
        fieldsToClear.forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.value = ''; // Clear input value if it's an input field
                field.innerHTML = ''; // Clear inner HTML for other elements
            }
        });

        // Hide the brush section
        const brushSection = document.getElementById('brush-section');
        if (brushSection) {
            brushSection.style.display = "none";
        }
    }

    function economy_getTopStates() {
        // Update UI elements
        const showButton = document.getElementById("ShowButton");
        showButton.innerText = "Scroll Down to see results";
        showButton.style.backgroundColor = "green";

        const infoPanel = document.getElementById("infoPanel");
        infoPanel.style.display = "block";

        // Get user inputs
        const unemployement = document.getElementById('unemployement');
        const mortality = document.getElementById('mortality');
        const salary = document.getElementById('salary');
        const rental = document.getElementById('rental');
        const population = document.getElementById('population');

        // Validate inputs
        if (
            unemployement && mortality && salary && rental && population &&
            unemployement.value && mortality.value && salary.value &&
            rental.value && population.value
        ) {
            // Ensure values are within the valid range
            if (
                economy_checkRange(unemployement.value) &&
                economy_checkRange(mortality.value) &&
                economy_checkRange(salary.value) &&
                economy_checkRange(rental.value) &&
                economy_checkRange(population.value)
            ) {
                // Calculate weighted scores for all states
                const statesDataArr = data.map((state) => {
                    const calculatedVal =
                        parseFloat(state["Unemployment_rate_RANK"] * unemployement.value) +
                        parseFloat(state["total_population_RANK"] * population.value) +
                        parseFloat(state["salary_avg_RANK"] * salary.value) +
                        parseFloat(state["cost_per_sqft_RANK"] * rental.value) +
                        parseFloat(state["Mortality_rate_RANK"] * mortality.value);

                    return [
                        state["RegionName"],
                        calculatedVal,
                        parseFloat(state["Unemployment_rate_RANK"] * unemployement.value),
                        parseFloat(state["total_population_RANK"] * population.value),
                        parseFloat(state["salary_avg_RANK"] * salary.value),
                        parseFloat(state["cost_per_sqft_RANK"] * rental.value),
                        parseFloat(state["Mortality_rate_RANK"] * mortality.value),
                    ];
                });

                // Sort states based on the calculated value (descending order)
                statesDataArr.sort((a, b) => b[1] - a[1]);

                // Extract top 3 states
                const topStates = statesDataArr.slice(0, 3).map((state) => state[0]);

                // Prepare data for visualization
                const labels = [
                    "Aggregated Sum of Weights",
                    "Unemployment Rate",
                    "Population",
                    "Average Salary/Mon",
                    "Price per sq. ft.",
                    "Mortality Rate",
                ];

                const arrState1 = statesDataArr[0].slice(1);
                const arrState2 = statesDataArr[1].slice(1);
                const arrState3 = statesDataArr[2].slice(1);

                // Update UI with top states
                document.getElementById("state1").innerHTML = `1. ${statesDataArr[0][0]}`;
                document.getElementById("state2").innerHTML = `2. ${statesDataArr[1][0]}`;
                document.getElementById("state3").innerHTML = `3. ${statesDataArr[2][0]}`;

                // Display weights and highlight top states on the map
                usaMap.displayWeights(arrState1, 'weight1', labels);
                usaMap.displayWeights(arrState2, 'weight2', labels);
                usaMap.displayWeights(arrState3, 'weight3', labels);
                usaMap.highlightMap(topStates);
            }
        }

        // Clear fields after processing
        economy_clearFields();
    }
    function economy_checkRange(value) {
        return value >= 0 && value <= 5;
    }
    let option; // Global variable to store the selected parameter

    async function economy_plotLineChart(parameter) {
        // Set the selected parameter
        option = parameter;

        // Reset data arrays
        employmentData = [];
        populationData = [];
        mortalityData = [];
        rentalData = [];
        salaryData = [];
        index = 0;

        // Dynamically load data for the required years (e.g., 2016 to 2010)
        await loadAllYears(2022, 2016);

        // Show the brush section after data is loaded
        const brushSection = document.getElementById('brush-section');
        if (brushSection) {
            brushSection.style.display = "block";
        }

        // Draw the line chart with the loaded data
    economy_drawLineChart();
    }
    function economy_drawLineChart() {
        // Helper function to prepare data arrays
        const prepareData = (dataArray) => {
            return topStates.map((state, i) => ({
                state,
                values: dataArray.map((yearData) => yearData.data[i]),
            }));
        };

        // Prepare datasets for each metric
        const datasets = {
            unemployement: prepareData(employmentData),
            population: prepareData(populationData),
            salary: prepareData(salaryData),
            rental: prepareData(rentalData),
            mortality: prepareData(mortalityData),
        };

        // Select the appropriate dataset based on the option
        const lineChartData = datasets[option];

        if (lineChartData) {
            // Create or update the line chart
            const line = new economy_LineChart(option, lineChartData);
            line.update(topStates);
        } else {
            console.error(`Invalid option: ${option}`);
        }
    }
    function createTableForClickedState(selectedState) {
        const body = document.getElementById("table");
        body.innerHTML = ''; // Clear existing table content

        // Create table and table body
        const tbl = document.createElement("table");
        const tblBody = document.createElement("tbody");

        // Function to create a row
        const createRow = (label, stateValue, nationalValue) => {
            const row = document.createElement("tr");

            const cellLabel = document.createElement("td");
            cellLabel.classList.add("bold");
            cellLabel.textContent = label;
            row.appendChild(cellLabel);

            const cellStateValue = document.createElement("td");
            cellStateValue.textContent = stateValue || "N/A";
            row.appendChild(cellStateValue);

            const cellNationalValue = document.createElement("td");
            cellNationalValue.textContent = nationalValue || "N/A";
            row.appendChild(cellNationalValue);

            return row;
        };

        // Header Row
        const headerRow = document.createElement("tr");
        headerRow.innerHTML = `
            <td class="bold">Parameters</td>
            <td class="bold">${selectedState["RegionName"]}</td>
            <td class="bold">National Average</td>
        `;
        tblBody.appendChild(headerRow);

        // Data Rows
        tblBody.appendChild(
            createRow(
                "Rental Price ($/sq. ft.)",
                selectedState["cost_per_sqft"],
                selectedState["NA PRICE/SQ. FT."]
            )
        );
        tblBody.appendChild(
            createRow(
                "Mortality Rate (%)",
                selectedState["Mortality_rate"],
                selectedState["NA MORTALITY_RATE"]
            )
        );
        tblBody.appendChild(
            createRow(
                "Population",
                selectedState["total_population"],
                selectedState["NA POPULATION"]
            )
        );
        tblBody.appendChild(
            createRow(
                "Unemployment Rate (%)",
                selectedState["Unemployment_rate"],
                selectedState["NA UNEMPLOYMENT_RATE"]
            )
        );
        tblBody.appendChild(
            createRow(
                "Average Salary ($)",
                selectedState["salary_avg"],
                selectedState["NA AVERAGE_SALARY/MON"]
            )
        );

        // Append the table body and set table attributes
        tbl.appendChild(tblBody);
        tbl.setAttribute("border", "2");
        tbl.setAttribute("class", "table-class table");

        // Add the table to the document
        body.appendChild(tbl);
    }
}




// BAR CHART CLASS
/** Class implementing the bar chart view. */
class economy_BarChart {

    constructor(allData) {
        this.width = 600;
        this.height = 800;
        this.data = allData

        //Create SVG element and append map to the SVG
        this.svg = d3.select('#bar-chart')
            .append('svg')
            .attr('class', 'chart')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('style', 'padding-left: 8px;')
    }

    /**
     * Render and update the bar chart based on the selection of the data type in the drop-down box
     */
    updateBarChart(selectedDimension) {

        var value = this.getCSVPropertyName(selectedDimension)
        //sorted data
        this.data.sort(function(a, b) {
            return b[value] - a[value]
        });

        var yMax = d3.max(this.data, function(d) {
            return d[value]
        });
        var yMin = d3.min(this.data, function(d) {
            return d[value]
        });
        // Create colorScale

        var color = "rgb(217,91,67)"
        var colorScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

        var chart = this.svg.selectAll("rect")
            .data(this.data);

        chart.exit().attr("opacity", 0.5)
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();

        chart = chart.enter().append("rect")
            .merge(chart);

        chart.transition()
            .duration(2000)
            .attr("x", 100)
            .attr("id", function(d) {
                return d["RegionName"]
            })
            .attr("width", function(d) {
                if (selectedDimension == 'unemployement' || selectedDimension == 'mortality') {
                    return d[value] * 35
                } else if (selectedDimension == 'population') {
                    return d[value] / 90000
                } else if (selectedDimension == 'salary') {
                    return d[value] / 250
                } else if (selectedDimension == 'price') {
                    return d[value] * 110
                }
            })
            .attr("y", function(d, i) {
                return (i * 15) + 10;
            })
            .attr("height", 15)
            .attr("fill", function(d) {
                return colorScale(d[value])
            })

        chart.on("click", function(d) {
            createTableForClickedState(d)
        });



        var national_avg
        if (selectedDimension == 'unemployement') {
            national_avg = parseFloat(this.data[0]['NA ' + value] * 35) + 100
        } else if (selectedDimension == 'population') {
            national_avg = parseFloat(this.data[0]['NA ' + value] / 90000) + 100
        } else if (selectedDimension == 'salary') {
            national_avg = parseFloat(this.data[0]['NA ' + value] / 250) + 100
        } else if (selectedDimension == 'mortality') {
            national_avg = parseFloat(this.data[0]['NA ' + value] * 35) + 100
        } else if (selectedDimension == 'price') {
            national_avg = parseFloat(this.data[0]['NA ' + value] * 110) + 100
        }

        this.svg.append("rect")
            .style("fill", '#000000')
            .style("stroke-dasharray", ("1, 5"))
            .attr('class', 'avg')
            .transition()
            .duration(2000)
            .attr("x", national_avg)
            .attr("y", 5)
            .attr("width", 1)
            .attr("height", this.height - 20)

        d3.select('#nationalAvgLegend').selectAll('svg').remove();

        var legend = d3.select("#nationalAvgLegend").append("svg")
            .attr("class", "legend")
            .attr("width", 200)
            .attr("height", 30)
            .selectAll("g")
            .data('b')
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .style("stroke-dasharray", ("1, 5"))
            .attr("width", 18)
            .attr("height", 3)
            .style("fill", '#000000');

        var national_avg_val
        if (selectedDimension == 'unemployement' || selectedDimension == 'mortality') {
            national_avg_val = this.data[0]['NA ' + value] + '%'
        } else if (selectedDimension == 'population') {
            national_avg_val = this.data[0]['NA ' + value]
        } else if (selectedDimension == 'salary') {
            national_avg_val = '$' + this.data[0]['NA ' + value]
        } else if (selectedDimension == 'price') {
            national_avg_val = '$' + this.data[0]['NA ' + value] + '/sq. feet'
        }

        legend.append("text")
            .attr("x", 24)
            .attr("y", 4)
            .attr("dy", ".35em")
            .text("National Average: " + national_avg_val);

        var score = this.svg.selectAll("text.score")
            .data(this.data)

        var newScores = score
            .enter()
            .append("text");

        score.exit().attr("opacity", 1)
            .transition()
            .duration(2000)
            .attr("opacity", 0).remove();
        score = newScores.merge(score);

        score
            .transition()
            .duration(2000)
            .attr("x", function(d) {
                if (selectedDimension == 'unemployement' || selectedDimension == 'mortality') {
                    return (d[value] * 35) + 100
                } else if (selectedDimension == 'population') {
                    return (d[value] / 90000) + 155
                } else if (selectedDimension == 'salary') {
                    return (d[value] / 250) + 100
                } else if (selectedDimension == 'price') {
                    return (d[value] * 110) + 100
                }
            })
            .attr("y", function(d, i) {
                return (i * 15) + 17;
            })
            .attr("dx", -5)
            .attr("dy", ".36em")
            .attr("text-anchor", "end")
            .attr('class', 'score')
            .text(function(d) {
                return d[value]
            });



        var states = this.svg.selectAll("text.name")
            .data(this.data)

        var updated_states = states
            .enter()
            .append("text");

        states.exit().attr("opacity", 1)
            .transition()
            .duration(2000)
            .attr("opacity", 0).remove();
        states = updated_states.merge(states);

        states
            .transition()
            .duration(2000)
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * 15) + 17;
            })
            .attr('class', 'name')
            .attr("dy", ".36em")
            .text(function(d) {
                return d['RegionName']
            });
    }

    highlightState(stateName) {
        d3.select("#bar-chart").selectAll("rect").classed("highlight-class", false)
        var element = d3.select("#" + stateName)
        element.classed("highlight-class", true)
        console.log(stateName)
    }

    getCSVPropertyName(value) {
        if (value == 'unemployement') {
            return 'Unemployment_rate'
        }
        if (value == 'salary') {
            return 'salary_avg'
        }
        if (value == 'population') {
            return 'total_population'
        }
        if (value == 'price') {
            return 'cost_per_sqft'
        }
        if (value == 'mortality') {
            return 'Mortality_rate'
        }

    }
}

// LINE CHART CLASS
/** Class implementing the line chart view. */
class economy_LineChart {
    constructor(option, allData) {
        this.width = 500;
        this.height = 500;
        this.data = allData;
        this.value = option;
        this.colors_arr = ["green", "blue", "red"];
        this.radius = 3.5;

        // Clear existing chart and create SVG element
        document.getElementById('line-chart').innerHTML = '';
        this.svg = d3.select('#line-chart')
            .append('svg')
            .attr('class', 'chart')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('padding-left', '8px');

        this.margin = { top: 30, right: 30, bottom: 30, left: 60 };
    }

    update(topStates) {
        const years_arr = [2016, 2017, 2018, 2019, 2020, 2021, 2022];

        // Define scales
        const xScale = d3.scaleLinear()
            .range([this.margin.left, this.width - this.margin.right])
            .domain([2016, 2022]);

        const data_values = this.data.flatMap(d => d.values);
        const yScale = d3.scaleLinear()
            .range([this.height - this.margin.top, this.margin.bottom])
            .domain([d3.min(data_values), d3.max(data_values)]);

        // Define axes
        const xAxis = d3.axisBottom(xScale).ticks(7);
        const yAxis = d3.axisLeft(yScale).ticks(15);

        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .attr("class", "axis")
            .call(xAxis);

        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .attr("class", "axis")
            .call(yAxis);

        // Define line generator
        const lineGen = d3.line()
            .x((d, i) => xScale(d.year))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        // Plot data for each state
        topStates.forEach((_, index) => {
            this.plotData(index, years_arr, lineGen, xScale, yScale);
        });

        this.drawLegends(topStates);
    }

    tooltip_render(tooltip_data) {
        return `
            <h5>Year: ${tooltip_data.year}</h5>
            <h5>Value: ${tooltip_data.value}</h5>
        `;
    }

    drawLegends(topStates) {
        d3.select('#legend-line-chart').selectAll('svg').remove();

        const legend = d3.select("#legend-line-chart")
            .append("svg")
            .attr("width", 120)
            .attr("height", 80)
            .selectAll("g")
            .data(topStates)
            .enter()
            .append("g")
            .attr("transform", (_, i) => `translate(0, ${i * 20})`);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 3)
            .style("fill", (_, i) => this.colors_arr[i]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 4)
            .attr("dy", ".35em")
            .text((_, i) => topStates[i]);
    }

    plotData(index, years_arr, lineGen, xScale, yScale) {
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-title")
            .style("opacity", 0);

        const final_data = years_arr.map((year, i) => ({
            year,
            value: this.data[index].values[i],
        }));

        // Add path
        const path = this.svg.append("path")
            .attr("d", lineGen(final_data))
            .attr("stroke", this.colors_arr[index])
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const totalLength = path.node().getTotalLength();

        path
            .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);

        // Add dots
        const dots = this.svg.selectAll(`.dot-${index}`)
            .data(final_data);

        dots.exit().remove();

        dots.enter()
            .append("circle")
            .merge(dots)
            .attr("class", `dot-${index}`)
            .attr("r", this.radius)
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.value))
            .style("fill", this.colors_arr[index])
            .on("mouseover", (event, d) => {
                d3.select(event.target)
                    .style("fill", "orange")
                    .attr("r", this.radius * 2);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

                tooltip.html(this.tooltip_render(d))
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", (event) => {
                d3.select(event.target)
                    .style("fill", this.colors_arr[index])
                    .attr("r", this.radius);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
    }
}


// MAP CLASS
class economy_Map {
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
