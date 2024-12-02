const stateNameMap = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
    "DC": "District of Columbia"
};

const stateGrid = [
    { state: "WA", x: 1, y: 1 }, { state: "MT", x: 3, y: 1 }, { state: "ND", x: 5, y: 1 },
    { state: "MN", x: 6, y: 1 }, { state: "WI", x: 7, y: 1 }, { state: "MI", x: 8, y: 1 },
    { state: "ME", x: 11, y: 1 },

    { state: "OR", x: 1, y: 2 }, { state: "ID", x: 2, y: 2 }, { state: "WY", x: 3, y: 2 },
    { state: "SD", x: 5, y: 2 }, { state: "IA", x: 6, y: 2 }, { state: "IL", x: 7, y: 2 },
    { state: "IN", x: 8, y: 2 }, { state: "OH", x: 9, y: 2 }, { state: "VT", x: 10, y: 2 },
    { state: "NH", x: 11, y: 2 },

    { state: "CA", x: 1, y: 3 }, { state: "NV", x: 2, y: 3 }, { state: "UT", x: 3, y: 3 },
    { state: "CO", x: 4, y: 3 }, { state: "NE", x: 5, y: 3 }, { state: "MO", x: 6, y: 3 },
    { state: "KY", x: 8, y: 3 }, { state: "WV", x: 9, y: 3 }, { state: "PA", x: 10, y: 3 },
    { state: "NY", x: 11, y: 3 }, { state: "MA", x: 12, y: 3 },

    { state: "AZ", x: 2, y: 4 }, { state: "NM", x: 3, y: 4 }, { state: "KS", x: 5, y: 4 },
    { state: "AR", x: 6, y: 4 }, { state: "TN", x: 8, y: 4 }, { state: "NC", x: 9, y: 4 },
    { state: "SC", x: 10, y: 4 }, { state: "RI", x: 12, y: 4 },

    { state: "OK", x: 5, y: 5 }, { state: "LA", x: 6, y: 5 }, { state: "MS", x: 7, y: 5 },
    { state: "AL", x: 8, y: 5 }, { state: "GA", x: 9, y: 5 }, { state: "FL", x: 9, y: 6 },

    { state: "TX", x: 4, y: 6 }, { state: "HI", x: 1, y: 6 }, { state: "AK", x: 1, y: 7 },
];

// Dimensions
const tileSize = 60;
const svgMapWidth = 1000; 
const svgMapHeight = 600; 
const barChartWidth = 600; 
const barChartHeight = 600; 

// Select SVG elements
const svgMap = d3.select("#quality-map-svg")
    .attr("width", svgMapWidth)
    .attr("height", svgMapHeight);

const svgBarChart = d3.select("#quality-bar-chart-svg")
    .attr("width", barChartWidth)
    .attr("height", barChartHeight);

// Create tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "quality-tooltip");

// Data storage
const homelessData = {};

let selectedYear = 2016; 
let selectedDataType = "gender"; 
let selectedState = "CA"; 
let darkestColor = "#08306b"; 

// Load data
d3.csv("data/homeless/homeless_data_corrected_abbreviated.csv").then(data => {
  
    data = data.filter(d => d.State && stateNameMap.hasOwnProperty(d.State));

    data.forEach(d => {
        
        const yearStr = d.Year ? d.Year.trim() : null;
        const state = d.State ? d.State.trim() : null;

        if (!yearStr || !state) {
            console.warn("Invalid data row, missing Year or State:", d);
            return;
        }

        const year = +yearStr;
        if (isNaN(year)) {
            console.warn("Invalid Year value:", yearStr);
            return;
        }

        homelessData[year] = homelessData[year] || {};
        homelessData[year][state] = {
            total: +d["Overall Homeless"] || 0,
            female: +d["Overall Homeless - Female"] || 0,
            male: +d["Overall Homeless - Male"] || 0,
            transgender: +d["Overall Homeless - Transgender"] || 0,
            nonHispanic: +d["Overall Homeless - Non-Hispanic/Non-Latin(o)(a)(x)"] || 0,
            hispanic: +d["Overall Homeless - Hispanic/Latin(o)(a)(x)"] || 0,
            white: +d["Overall Homeless - White"] || 0,
            black: +d["Overall Homeless - Black, African American, or African"] || 0,
            asian: +d["Overall Homeless - Asian or Asian American"] || 0,
            indigenous: +d["Overall Homeless - American Indian, Alaska Native, or Indigenous"] || 0,
            pacificIslander: +d["Overall Homeless - Native Hawaiian or Other Pacific Islander"] || 0
        };
    });

    if (!homelessData[selectedYear]) {
        console.warn(`No data available for the year ${selectedYear}. Selecting the nearest available year.`);
       
        const availableYears = Object.keys(homelessData).map(d => +d).sort((a, b) => a - b);
        if (availableYears.length === 0) {
            console.error("No data available in the dataset.");
            return;
        }
        
        let closestYear = availableYears[0];
        availableYears.forEach(year => {
            if (Math.abs(year - selectedYear) < Math.abs(closestYear - selectedYear)) {
                closestYear = year;
            }
        });
        selectedYear = closestYear;
        console.warn(`Selected Year set to ${selectedYear}.`);
    }

    
    const years = [
        { year: 2015, color: "blue" },
        { year: 2016, color: "blue" },
        { year: 2017, color: "blue" },
        { year: 2018, color: "blue" },
        { year: 2019, color: "red" },
        { year: 2020, color: "red" },
        { year: 2021, color: "red" },
        { year: 2022, color: "red" }
    ];

    const availableYearsSet = new Set(Object.keys(homelessData).map(d => +d));
    const filteredYears = years.filter(d => availableYearsSet.has(d.year));

    const sliderWidth = 600;
    const sliderHeight = 50;


    const sliderGroup = svgMap.append("g")
        .attr("class", "quality-slider-container")
        .attr("transform", `translate(${(svgMapWidth - sliderWidth) / 2}, ${svgMapHeight - sliderHeight - 70})`);

    sliderGroup.append("rect")
        .attr("class", "quality-slider-track")
        .attr("x", 0)
        .attr("y", 15)
        .attr("width", sliderWidth)
        .attr("height", 10)
        .attr("fill", "white")
        .attr("stroke", "black");

    sliderGroup.selectAll(".quality-year-bg")
        .data(filteredYears)
        .enter()
        .append("rect")
        .attr("class", "quality-year-bg")
        .attr("x", (d, i) => i * (sliderWidth / filteredYears.length))
        .attr("y", 25)
        .attr("width", sliderWidth / filteredYears.length)
        .attr("height", 20)
        .attr("fill", d => d.color)
        .on("click", (event, d) => {
            selectedYear = d.year;
            console.log(`Year selected: ${selectedYear}`);
            updateVisualization();
            handle.transition()
                .duration(300)
                .attr("x", filteredYears.findIndex(year => year.year === selectedYear) * (sliderWidth / filteredYears.length));
            
            updateBarChart(selectedState);
        });


    sliderGroup.selectAll(".quality-year-label")
        .data(filteredYears)
        .enter()
        .append("text")
        .attr("class", "quality-year-label")
        .attr("x", (d, i) => i * (sliderWidth / filteredYears.length) + (sliderWidth / filteredYears.length) / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(d => d.year)
        .attr("fill", "black")
        .style("font-size", "14px");

    const handle = sliderGroup.append("rect")
        .attr("class", "quality-slider-handle")
        .attr("x", filteredYears.findIndex(year => year.year === selectedYear) * (sliderWidth / filteredYears.length))
        .attr("y", 10)
        .attr("width", sliderWidth / filteredYears.length)
        .attr("height", 40)
        .attr("fill", "rgba(0, 0, 0, 0.5)")
        .attr("cursor", "pointer");

    updateVisualization();
    updateBarChart(selectedState);
});


function updateVisualization() {
    const yearData = homelessData[selectedYear] || {};

    const values = stateGrid.map(d => yearData[d.state]?.total || 0);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);


    const colorScale = d3.scaleSequential()
        .domain([Math.log(minValue + 1), Math.log(maxValue + 1)]) 
        .interpolator(d3.interpolateBlues);

    darkestColor = colorScale(Math.log(maxValue + 1));

    console.log(`Darkest color for year ${selectedYear}: ${darkestColor}`);

    updateToggleButtonColor(darkestColor);

    d3.select("#quality-map-svg").selectAll(".quality-map-group").remove();


    const mapGroup = d3.select("#quality-map-svg").append("g")
        .attr("class", "quality-map-group")
        .attr("transform", `translate(80, 0)`); 

    mapGroup.selectAll(".quality-tile")
        .data(stateGrid)
        .join("circle")
        .attr("class", "quality-tile")
        .attr("cx", d => d.x * tileSize)
        .attr("cy", d => d.y * tileSize)
        .attr("r", 25)
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            const data = yearData[d.state] || {};
            const stateFullName = stateNameMap[d.state] || d.state;
            d3.select(".quality-tooltip")
                .transition()
                .duration(200)
                .style("opacity", .9);
            d3.select(".quality-tooltip")
                .html(`<strong>${stateFullName}</strong><br/>Homeless: ${data.total || 0}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select(".quality-tooltip")
                .transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function(event, d) {
            const state = d.state;
            selectedState = state;
            console.log(`State selected: ${selectedState}`);
            updateBarChart(state);
        })
        .attr("fill", d => {
            const value = yearData[d.state]?.total || 0;
            return value > 0 ? colorScale(Math.log(value + 1)) : "#f0f0f0"; 
        });


    mapGroup.selectAll(".quality-label")
        .data(stateGrid)
        .join("text")
        .attr("class", "quality-label")
        .attr("x", d => d.x * tileSize)
        .attr("y", d => d.y * tileSize + 5)
        .text(d => d.state)
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .attr("fill", "#fff")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle");


    addLegend(colorScale, minValue, maxValue);
}


function addLegend(colorScale, minValue, maxValue) {

    d3.select("#quality-map-svg").selectAll(".quality-legend").remove();
    d3.select("#quality-map-svg").selectAll("defs").remove(); 

    const legendWidth = 20;
    const legendHeight = 300;

    const legendGroup = d3.select("#quality-map-svg").append("g")
        .attr("class", "quality-legend")
        .attr("transform", `translate(30, ${(svgMapHeight - legendHeight) / 2})`);

    const legendScale = d3.scaleLog()
        .domain([minValue + 1, maxValue + 1]) 
        .range([legendHeight, 0]); 

    const legendAxis = d3.axisRight(legendScale)
        .ticks(6, "~s"); 

    const defs = d3.select("#quality-map-svg").append("defs");

    const gradient = defs.append("linearGradient")
        .attr("id", "quality-legend-gradient")
        .attr("x1", "0%")
        .attr("x2", "0%")
        .attr("y1", "100%")
        .attr("y2", "0%"); 

    const numStops = 10;
    const legendData = d3.range(numStops).map(i => {
        const value = minValue + (i / (numStops - 1)) * (maxValue - minValue);
        return {
            offset: `${(i / (numStops - 1)) * 100}%`,
            color: colorScale(Math.log(value + 1))
        };
    });

    gradient.selectAll("stop")
        .data(legendData)
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legendGroup.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#quality-legend-gradient)");

 
    legendGroup.append("g")
        .attr("transform", `translate(${legendWidth}, 0)`)
        .call(legendAxis);
}

function addToggleButtons(darkestColor) {
    const buttonGroup = svgBarChart.append("g")
        .attr("class", "quality-bar-chart-button-group")
        .attr("transform", `translate(${barChartWidth - 150}, 50)`);

    const buttonWidth = 120;
    const buttonHeight = 40;
    const buttonSpacing = 20;

    const toggleButtons = [
        { type: "gender", label: "Gender" },
        { type: "race", label: "Race" }
    ];

    toggleButtons.forEach((btn, index) => {
        const yPosition = index * (buttonHeight + buttonSpacing);

        const buttonGroupElement = buttonGroup.append("g")
            .attr("class", "quality-toggle-button-group")
            .attr("transform", `translate(0, ${yPosition})`);

        buttonGroupElement.append("rect")
            .attr("class", "quality-toggle-button")
            .attr("width", buttonWidth)
            .attr("height", buttonHeight)
            .attr("rx", 10) // Rounded corners
            .attr("ry", 10) // Rounded corners
            .classed("selected", selectedDataType === btn.type)
            .on("click", function() {
                if (selectedDataType !== btn.type) {
                    selectedDataType = btn.type;
                    console.log(`Data type selected: ${selectedDataType}`);
                    updateBarChart(selectedState);
                }
            })
            .attr("fill", darkestColor)
            .attr("stroke", darkestColor);

        buttonGroupElement.append("text")
            .attr("class", "quality-toggle-text")
            .attr("x", buttonWidth / 2)
            .attr("y", buttonHeight / 2 + 5) 
            .attr("text-anchor", "middle")
            .text(btn.label)
            .classed("selected", selectedDataType === btn.type)
            .attr("fill", "white");
    });
}


function updateToggleButtonColor(darkestColor) {
    svgBarChart.selectAll(".quality-toggle-button")
        .transition()
        .duration(300)
        .attr("fill", darkestColor)
        .attr("stroke", darkestColor);
}

function updateButtonStyles() {
    svgBarChart.selectAll(".quality-toggle-button")
        .classed("selected", function() {
            const buttonText = d3.select(this.parentNode).select("text").text().toLowerCase();
            return buttonText === selectedDataType;
        });

    svgBarChart.selectAll(".quality-toggle-text")
        .classed("selected", function() {
            const buttonText = d3.select(this).text().toLowerCase();
            return buttonText === selectedDataType;
        });
}

function updateBarChart(state) {
    const yearData = homelessData[selectedYear];
    if (!yearData) {
        console.error(`No data available for the year ${selectedYear}.`);
        console.log("Available Years:", Object.keys(homelessData).sort());
        return;
    }
    const data = yearData[state];
    if (!data) {
        console.error(`No data available for state ${state} in year ${selectedYear}.`);
        console.log(`Available States for ${selectedYear}:`, Object.keys(yearData));
        return;
    }

    const stateFullName = stateNameMap[state] || state;

    let categories;

    if (selectedDataType === "gender") {
        categories = [
            { label: "Female", value: data.female || 0 },
            { label: "Male", value: data.male || 0 },
            { label: "Transgender", value: data.transgender || 0 }
        ];
    } else if (selectedDataType === "race") {
        categories = [
            { label: "Non-Hispanic", value: data.nonHispanic || 0 },
            { label: "Hispanic", value: data.hispanic || 0 },
            { label: "White", value: data.white || 0 },
            { label: "Black or African American", value: data.black || 0 },
            { label: "Asian", value: data.asian || 0 },
            { label: "Indigenous", value: data.indigenous || 0 },
            { label: "Pacific Islander", value: data.pacificIslander || 0 }
        ];
    }

    console.log(`Categories for ${selectedDataType}:`, categories);

    categories.forEach(cat => {
        cat.value = isNaN(cat.value) ? 0 : cat.value;
    });

    const xScale = d3.scaleBand()
        .domain(categories.map(d => d.label))
        .range([100, barChartWidth - 150]) 
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(categories, d => d.value)])
        .nice()
        .range([barChartHeight - 70, 50]);

    
    let barColorScale;
    if (selectedDataType === "gender") {
        barColorScale = d3.scaleOrdinal()
            .domain(categories.map(d => d.label))
            .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); 
    } else if (selectedDataType === "race") {
        barColorScale = d3.scaleOrdinal()
            .domain(categories.map(d => d.label))
            .range(["#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#9467bd", "#ff9896"]); 
    }

    svgBarChart.selectAll(".quality-axis").remove();

    svgBarChart.append("g")
        .attr("class", "quality-axis quality-x-axis")
        .attr("transform", `translate(0, ${barChartHeight - 70})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svgBarChart.append("g")
        .attr("class", "quality-axis quality-y-axis")
        .attr("transform", `translate(100, 0)`)
        .call(d3.axisLeft(yScale));


    const bars = svgBarChart.selectAll(".quality-bar")
        .data(categories, d => d.label); 

    bars.transition()
        .duration(800)
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => barChartHeight - 70 - yScale(d.value))
        .attr("fill", d => barColorScale(d.label));

    bars.enter()
        .append("rect")
        .attr("class", "quality-bar")
        .attr("x", d => xScale(d.label))
        .attr("y", yScale(0))
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", d => barColorScale(d.label))
        .transition()
        .duration(800)
        .attr("y", d => yScale(d.value))
        .attr("height", d => barChartHeight - 70 - yScale(d.value));


    bars.exit()
        .transition()
        .duration(800)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

    svgBarChart.selectAll(".quality-chart-title").remove();
    svgBarChart.append("text")
        .attr("class", "quality-chart-title")
        .attr("x", barChartWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text(`Homeless Population in ${stateFullName} (${selectedYear}) - ${capitalizeFirstLetter(selectedDataType)}`);

    updateToggleButtonColor(darkestColor);
    updateButtonStyles();
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}