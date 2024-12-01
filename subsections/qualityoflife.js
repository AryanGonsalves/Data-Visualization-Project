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
  
  // State grid positions
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

const tileSize = 60;
const svgWidth = 1000; 
const svgHeight = 600;
const barChartWidth = 1000;
const barChartHeight = 600;

const svgMap = d3.select("#quality-map-svg");
const svgBarChart = d3.select("#quality-bar-chart-svg");

const tooltip = d3.select("body").append("div")
    .attr("class", "quality-tooltip");

const validStates = new Set(stateGrid.map(d => d.state));

let selectedYear = 2016; 
let selectedDataType = "gender"; 
let selectedState = "CA"; 

const homelessData = {};

// Load data
d3.csv("/data/homeless/homeless_data_corrected_abbreviated.csv").then(data => {
  
    data = data.filter(d => d.State && validStates.has(d.State));

    data.forEach(d => {
        const year = +d.Year;
        const state = d.State;
        homelessData[year] ??= {};
        homelessData[year][state] = {
            total: +d["Overall Homeless"],
            female: +d["Overall Homeless - Female"],
            male: +d["Overall Homeless - Male"],
            transgender: +d["Overall Homeless - Transgender"],
            nonHispanic: +d["Overall Homeless - Non-Hispanic/Non-Latin(o)(a)(x)"],
            hispanic: +d["Overall Homeless - Hispanic/Latin(o)(a)(x)"],
            white: +d["Overall Homeless - White"],
            black: +d["Overall Homeless - Black, African American, or African"],
            asian: +d["Overall Homeless - Asian or Asian American"],
            indigenous: +d["Overall Homeless - American Indian, Alaska Native, or Indigenous"],
            pacificIslander: +d["Overall Homeless - Native Hawaiian or Other Pacific Islander"]
        };
    });

    
    const years = [
        { year: 2015, color: "blue" },
        { year: 2016, color: "blue" },
        { year: 2017, color: "blue" },
        { year: 2018, color: "red" },
        { year: 2019, color: "red" },
        { year: 2020, color: "red" },
        { year: 2021, color: "red" },
        { year: 2022, color: "red" }
    ];

    const sliderWidth = 600;
    const sliderHeight = 50;

    const sliderGroup = svgMap.append("g")
        .attr("class", "quality-slider-container")
        .attr("transform", `translate(${(svgWidth - sliderWidth) / 2}, ${svgHeight - sliderHeight - 70})`);

    // Slider 
    sliderGroup.append("rect")
        .attr("class", "quality-slider-track")
        .attr("x", 0)
        .attr("y", 15)
        .attr("width", sliderWidth)
        .attr("height", 10)
        .attr("fill", "white")
        .attr("stroke", "black");

    // Year background rectangles
    sliderGroup.selectAll(".quality-year-bg")
        .data(years)
        .enter()
        .append("rect")
        .attr("class", "quality-year-bg")
        .attr("x", (d, i) => i * (sliderWidth / years.length))
        .attr("y", 25)
        .attr("width", sliderWidth / years.length)
        .attr("height", 20)
        .attr("fill", d => d.color)
        .on("click", (event, d) => {
            selectedYear = d.year;
            updateVisualization();
            handle.transition()
                .duration(300)
                .attr("x", years.findIndex(year => year.year === selectedYear) * (sliderWidth / years.length));
            updateBarChart(selectedState);
        });

    // Year labels
    sliderGroup.selectAll(".quality-year-label")
        .data(years)
        .enter()
        .append("text")
        .attr("class", "quality-year-label")
        .attr("x", (d, i) => i * (sliderWidth / years.length) + (sliderWidth / years.length) / 2)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(d => d.year)
        .attr("fill", "black")
        .style("font-size", "14px");

    // Slider handle
    const handle = sliderGroup.append("rect")
        .attr("class", "quality-slider-handle")
        .attr("x", years.findIndex(year => year.year === selectedYear) * (sliderWidth / years.length))
        .attr("y", 10)
        .attr("width", sliderWidth / years.length)
        .attr("height", 40)
        .attr("fill", "rgba(0, 0, 0, 0.5)")
        .attr("cursor", "pointer");

    updateVisualization();
    updateBarChart(selectedState);
});

// Function to update the map visualization
function updateVisualization() {
    const yearData = homelessData[selectedYear] || {};

    const values = stateGrid.map(d => yearData[d.state]?.total || 0);
    const minValue = d3.min(values);
    const maxValue = d3.max(values);
   
    const colorScale = d3.scaleSequential()
        .domain([Math.log(minValue + 1), Math.log(maxValue + 1)]) 
        .interpolator(d3.interpolateBlues);

    svgMap.selectAll(".quality-map-group").remove();

    const mapGroup = svgMap.append("g")
        .attr("class", "quality-map-group")
        .attr("transform", `translate(120, 0)`); 

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
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`<strong>${stateFullName}</strong><br/>Homeless: ${data.total || 0}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function(event, d) {
            const state = d.state;
            selectedState = state;
            updateBarChart(state);
        })
        .transition()
        .duration(500)
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

    // Add legend
    addLegend(colorScale, minValue, maxValue);
}


function addLegend(colorScale, minValue, maxValue) {

    svgMap.selectAll(".quality-legend").remove();
    svgMap.selectAll("defs").remove(); 

    const legendWidth = 20;
    const legendHeight = 300;

    const legendGroup = svgMap.append("g")
        .attr("class", "quality-legend")
        .attr("transform", `translate(50, ${(svgHeight - legendHeight) / 2})`);

    const legendScale = d3.scaleLog()
        .domain([minValue + 1, maxValue + 1]) 
        .range([legendHeight, 0]); 

    const legendAxis = d3.axisRight(legendScale)
        .ticks(6, "~s"); 


    const defs = svgMap.append("defs");

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

function updateBarChart(state) {
    const yearData = homelessData[selectedYear];
    if (!yearData) {
        console.error(`No data available for the year ${selectedYear}.`);
        return;
    }
    const data = yearData[state];
    if (!data) {
        console.error(`No data available for state ${state} in year ${selectedYear}.`);
        return;
    }

    const stateFullName = stateNameMap[state] || state;

    let categories;

    if (selectedDataType === "gender") {
        categories = [
            { label: "Female", value: data.female },
            { label: "Male", value: data.male },
            { label: "Transgender", value: data.transgender }
        ];

    } else if (selectedDataType === "race") {
        categories = [
            { label: "Non-Hispanic", value: data.nonHispanic },
            { label: "Hispanic", value: data.hispanic },
            { label: "White", value: data.white },
            { label: "Black or African American", value: data.black },
            { label: "Asian", value: data.asian },
            { label: "Indigenous", value: data.indigenous },
            { label: "Pacific Islander", value: data.pacificIslander }
        ];
    }

    const xScale = d3.scaleBand()
        .domain(categories.map(d => d.label))
        .range([100, barChartWidth - 50]) 
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(categories, d => d.value)])
        .nice()
        .range([barChartHeight - 70, 50]);

    
    svgBarChart.selectAll("*").remove();

  
    svgBarChart.append("g")
        .attr("transform", `translate(0, ${barChartHeight - 70})`) 
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("dx", "-0.8em")
        .attr("dy", "-0.15em")
        .style("text-anchor", "end");

    svgBarChart.append("g")
        .attr("transform", `translate(100, 0)`) 
        .call(d3.axisLeft(yScale));

    
    svgBarChart.selectAll(".quality-bar")
        .data(categories)
        .enter()
        .append("rect")
        .attr("class", "quality-bar")
        .attr("x", d => xScale(d.label))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => barChartHeight - 70 - yScale(d.value)); 

   
    svgBarChart.append("text")
        .attr("x", barChartWidth / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text(`Homeless Population in ${stateFullName} (${selectedYear}) - ${selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1)}`);

    
    svgBarChart.append("text")
        .attr("x", barChartWidth / 2)
        .attr("y", barChartHeight - 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Category");

    svgBarChart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -barChartHeight / 2)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Number of Homeless Individuals");
}


d3.select("#quality-gender-button").on("click", function() {
    selectedDataType = "gender";
    d3.selectAll(".quality-toggle-button").classed("selected", false);
    d3.select(this).classed("selected", true);
    updateBarChart(selectedState);
});

d3.select("#quality-race-button").on("click", function() {
    selectedDataType = "race";
    d3.selectAll(".quality-toggle-button").classed("selected", false);
    d3.select(this).classed("selected", true);
    updateBarChart(selectedState);
});