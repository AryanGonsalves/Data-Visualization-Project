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
    economy_usaMap = new Map(allData);
    window.barChart = new BarChart(allData);

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
        const line = new LineChart(option, lineChartData);
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

