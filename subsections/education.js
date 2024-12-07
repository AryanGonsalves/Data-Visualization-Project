
const education_age_files = [
    "data/education/attainment/age/2016.csv",
    "data/education/attainment/age/2017.csv",
    "data/education/attainment/age/2018.csv",
    "data/education/attainment/age/2019.csv",
    "data/education/attainment/age/2020.csv",
    "data/education/attainment/age/2021.csv",
    "data/education/attainment/age/2022.csv",
    "data/education/attainment/age/2023.csv"
];
const education_race_files = [
    "data/education/attainment/race/2016.csv",
    "data/education/attainment/race/2017.csv",
    "data/education/attainment/race/2018.csv",
    "data/education/attainment/race/2019.csv",
    "data/education/attainment/race/2020.csv",
    "data/education/attainment/race/2021.csv",
    "data/education/attainment/race/2022.csv",
    "data/education/attainment/race/2023.csv"
];

const americanGovColors = [
    "#B22234",
    "#0033A0",
    "#005A8B",
    "#B0C4DE",
    "#C8102F",
    "#003B49",
    "#FFD700",
    "#A7A8AA",
    "#E6E6E6"
];

// Stuff for the circle chart   
const ageGroups = [
    "Population18to24_Total",
    "Population25to34_Total",
    "Population35to44_Total",
    "Population45to64_Total",
    "Population65Over_Total"
];
const raceGroups = [
    "AmericanIndianAlaskaNative_Total",
    "Asian_Total",
    "Black_Total",
    "HispanicLatino_Total",
    "NativeHawaiianOtherPacificIslander_Total",
    "OtherRace_Total",
    "TwoOrMoreRace_Total",
    "WhiteNotHispanicLatino_Total",
    "White_Total"
];

let education_ageData = [];
let education_raceData = [];

let education_ageHighSchoolData = [];
let education_raceHighSchoolData = [];

let education_ageBachelorData = [];
let education_raceBachelorData = [];

let education_ageTotalData = [];
let education_raceTotalData = [];


// State management
var education_isMapChart = false;
var education_isBarChart = false;

var education_isAgeData = true;
var education_isRaceData = false;

var education_isHSData = false;
var education_isBachData = false;
var education_isTotalData = false;

var education_selectedAgeGroup = "18to24";
var education_selectedRaceGroup = "AmericanIndianAlaskaNative";

// Slider stuff
var education_slider = '';
var education_selectedYear = 2016;

var education_ageDropDown = "";
var education_raceDropDown = "";


// Button stuff
var education_ageButton = '';
var raeducation_ceButton = '';
var education_mapButton = '';
var education_barButton = '';
var education_hsButton = '';
var education_bachButton = '';
var education_totalButton = '';

// Web page interaction section
document.addEventListener('DOMContentLoaded', function () {   
    education_ageButton = document.getElementById('ageButton');
    raeducation_ceButton = document.getElementById('raceButton');
    // Default settings to have these on
    education_ageButton.classList.add('selected');

    // Load data, filger data, then draw
    education_loadData().then(function() {
        education_getHighSchoolAgeData();
        education_getHighSchoolRaceData();
        education_getBachelorAgeData();
        education_getBachelorRaceData();
        education_getTotalEducationAgeData();
        education_getTotalEducationRaceData();
        education_drawMapChart(); // Call drawMapChart only after data is loaded
    });

    // Event listeners 
    education_slider = document.getElementById('yearLabel');
    education_selectedYear = parseInt(education_slider.textContent);
    education_slider.addEventListener('input', function () {
        education_selectedYear = parseInt(education_slider.textContent);
        yearLabel.textContent = education_selectedYear;
    });
    education_ageButton.addEventListener('click', function() {
        education_State_Age();
        education_toggleSelected([education_ageButton, raeducation_ceButton]);
        if (education_isMapChart){
            education_raceDropDown.disabled = true;
            education_ageDropDown.disabled = false;
        }
    });
    raeducation_ceButton.addEventListener('click', function() {
        education_State_Race();
        education_toggleSelected([education_ageButton, raeducation_ceButton]);
        if (education_isMapChart){
            education_ageDropDown.disabled = true;
            education_raceDropDown.disabled = false;
        }   
    });
});
// Called by HTML - when slider changes, redraw 
function education_updateYearLabel(year) {
    education_selectedYear = parseInt(year);
    document.getElementById('yearLabel').textContent = year;
    if (education_isMapChart){
        education_drawMapChart();
    }
    else {
        education_drawBarChart();
    }
}
// Button update to toggle mode - selected mode
function education_toggleSelected(group) {
    group.forEach(button => button.classList.remove('selected')); 
    event.target.classList.add('selected');
}

// Gets called when page loads -- or when svg loads
function education_loadData() {
    // Use promise
    return new Promise((resolve, reject) => {
        try {
            education_loadCall();
            setTimeout(resolve, 1000);
        } catch (error) {
            reject(`Error getting data: ${error}`);
        }
    });
}
function education_loadCall(){
    education_loadCSVFiles(education_age_files, education_ageData, function() {
        // After age files are loaded, load race files
        education_loadCSVFiles(education_race_files, education_raceData, function() {
            // After both datasets are loaded, draw the education visualization
        });
    });
}
function education_loadCSVFiles(files, dataObject, callback) {
    let remainingFiles = files.length;

    files.forEach(file => {
        const year = file.split('/').pop().split('.')[0]; // Get year from filename

        d3.csv(file).then(function(data) {
            if (!dataObject[year]) {
                dataObject[year] = {}; // Initialize the object for the year if it doesn't exist
            }

            // Iterate over each row of data
            data.forEach(row => {
                const state = row['Label (Grouping)']; // State name is in the Label (Grouping) column

                // Initialize state object if not already present
                if (!dataObject[year][state]) {
                    dataObject[year][state] = {};
                }

                // Iterate over each key in the row and check for 'Estimate' or 'Percent' columns
                Object.keys(row).forEach(key => {
                    if (key === 'Label (Grouping)') return; // Skip the 'Label (Grouping)' column

                    const isEstimate = key.includes('Total_Estimate');
                    const isPercent = key.includes('Percent_Estimate');

                    // Extract the population category (before the first underscore)
                    const groupName = key.split('_')[0];

                    // Initialize the population group for that state if not there already
                    if (!dataObject[year][state][groupName]) {
                        dataObject[year][state][groupName] = {};
                    }

                    // Initialize the Estimate and Percent sub-objects if not already present
                    if (isEstimate) {
                        if (!dataObject[year][state][groupName].Estimate) {
                            dataObject[year][state][groupName].Estimate = {};
                        }
                        dataObject[year][state][groupName].Estimate = row[key];
                    } else if (isPercent) {
                        if (!dataObject[year][state][groupName].Percent) {
                            dataObject[year][state][groupName].Percent = {};
                        }
                        dataObject[year][state][groupName].Percent = row[key];
                    }
                });
            });

            remainingFiles--;
            if (remainingFiles === 0) {
                callback();
            }
        }).catch(function(error) {
            console.error('Error loading CSV file:', error);
            remainingFiles--; // Ensure to decrement even if there's an error
            if (remainingFiles === 0) {
                callback();
            }
        });
    });
}

// Get Education Type Data for each Race and Age
function education_getHighSchoolRaceData() {
    const highSchoolData = {};

    // Loop through each year in the raceData
    Object.keys(education_raceData).forEach(year => {
        highSchoolData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(education_raceData[year]).forEach(property => {

            if (property.includes('_HighSchool')) {
                highSchoolData[year][property] = education_raceData[year][property];
            }
        });
    });

    education_raceHighSchoolData = highSchoolData;
    return highSchoolData;
}
function education_getHighSchoolAgeData(){
    const highSchoolData = {};

    // Loop through each year in the raceData
    Object.keys(education_ageData).forEach(year => {
        highSchoolData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(education_ageData[year]).forEach(property => {

            if (property.includes('_HighSchool') && !property.includes("Percent")) {
                highSchoolData[year][property] = education_ageData[year][property];
            }
        });
    });
    education_ageHighSchoolData = highSchoolData;
    return highSchoolData;
}
function education_getBachelorRaceData() {
    const bachelorData = {};

    // Loop through each year in the raceData
    Object.keys(education_raceData).forEach(year => {
        bachelorData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(education_raceData[year]).forEach(property => {

            if (property.includes('_Bachelor')) {
                bachelorData[year][property] = education_raceData[year][property];
            }
        });
    });

    education_raceBachelorData = bachelorData;
    return bachelorData;
}
function education_getBachelorAgeData(){
    const bachelorData = {};

    // Loop through each year in the raceData
    Object.keys(education_ageData).forEach(year => {
        bachelorData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(education_ageData[year]).forEach(property => {

            if (property.includes('_Bachelor')) {
                bachelorData[year][property] = education_ageData[year][property];
            }
        });
    });
    education_ageBachelorData = bachelorData;
    return bachelorData;
}
function education_getTotalEducationRaceData() {
    const totalData = {};

    // Loop through each year in the raceData
    Object.keys(education_raceData).forEach(year => {
        totalData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(education_raceData[year]).forEach(property => {

            if (property.includes('_Total')) {
                totalData[year][property] = education_raceData[year][property];
            }
        });
    });

    education_raceTotalData = totalData;
    return totalData;
}
function education_getTotalEducationAgeData(){
    const totalData = {};

    // Loop through each year in the raceData
    Object.keys(education_ageData).forEach(year => {
        totalData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(education_ageData[year]).forEach(property => {

            if (property.includes('_Total')) {
                totalData[year][property] = education_ageData[year][property];
            }
        });
    });

    education_ageTotalData = totalData;
    return totalData;
}

// Gets data for selected age/race group - and cleaned
function education_getAgeGroupData(data) {
    const ageGroupData = {};
    Object.keys(data).forEach(type => {
        ageGroupData[type] = {};
        Object.keys(data[type]).forEach(property => {
            if (property.includes(education_selectedAgeGroup)) {
                let value = data[type][property];
                if (value === 'N'  || value === 'NA') {
                    value = 1; // Set to 0 if the value is 'N'
                }
                ageGroupData[type][property] = value;
            }
        });
    });
    return ageGroupData;
}
function education_getRaceGroupData(data) {
    const raceGroupData = {};
    Object.keys(data).forEach(type => {
        raceGroupData[type] = {};
        Object.keys(data[type]).forEach(property => {
            if (property.startsWith(education_selectedRaceGroup)) {
                let value = data[type][property];
                if (value === 'N' || value === 'NA') {
                    value = 1;
                }
                raceGroupData[type][property] = value;
            }
        });
    });
    return raceGroupData;
}

function education_getSelectedYearData(data){
    var yearData = [];
    Object.keys(data).forEach(year => {
        if (year == education_selectedYear) {
            yearData = data[year];
        }
    });
    return yearData;
}


function education_getUSOnlyBarChart(data){
    var usData = [];
    Object.keys(data).forEach(type => {
        Object.keys(data[type]).forEach(state => {
            if (state == "UnitedStates") {
                usData[type] = data[type][state];
            }
        });
    });
    return usData;
}

// Functions triggered by buttons
function education_drawAge(){
    education_State_Age();
    education_drawMapChart();
}
function education_drawRace(){
    education_State_Race();
    education_drawMapChart();
}

// State management functions
function education_State_Age(){
    education_isAgeData = true;
    education_isRaceData = false;
}
function education_State_Race(){
    education_isAgeData = false;
    education_isRaceData = true;
}

// specific for the map
function education_filterData(){
    var data = [];
    if (education_isAgeData){ // age data
        if (education_isHSData){
            data = education_getAgeGroupData(education_ageHighSchoolData);
            data = education_getSelectedYearData(data);
        }
        else if (education_isBachData){
            data = education_getAgeGroupData(education_ageBachelorData);
            data = education_getSelectedYearData(data);
        }
        else{
            data = education_getAgeGroupData(education_ageTotalData);
            data = education_getSelectedYearData(data);
        }
    }
    else {  // race data
        if (education_isHSData){
            data = education_getRaceGroupData(education_raceHighSchoolData);
            data = education_getSelectedYearData(data);
        }
        else if (education_isBachData){
            data = education_getRaceGroupData(education_raceBachelorData);
            data = education_getSelectedYearData(data);
        }
        else{
            data = education_getRaceGroupData(education_raceTotalData);
            data = education_getSelectedYearData(data);
        }
    }
    var returnData = [];
    Object.keys(data).forEach(property => { 
        returnData = data[property]
    });
    return returnData;
}


function education_drawMapChart(){
    const svg = d3.select("#visualization-education");

    var data = education_filterData();

    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox
    const center = [width / 2, height / 2];
    const outerRadius = Math.min(width, height)*3.7/10; 
    const innerRadius = outerRadius - 40;  // CHANGE RADIUS HERE


    // Set up the projection and path
    const projection = d3.geoAlbersUsa()
        .scale(width * 0.85)    //CHANGE SIZE OF MAP HERE
        .translate([width / 2, height / 2]);  
    const path = d3.geoPath().projection(projection);


    const cleanedData = Object.entries(data)
        .filter(([stateName]) => stateName !== "UnitedStates")  // Exclude "United States"
        .map(([stateName, stateData]) => {
            return {
                name: stateName,
                Estimate: parseInt(stateData.Estimate.replace(/,/g, ''), 10),
            };
    });

    const minEstimate = d3.min(cleanedData, d => d.Estimate);
    const maxEstimate = d3.max(cleanedData, d => d.Estimate);

    const radiusScale = d3.scaleLinear()
        .domain([minEstimate, maxEstimate]) 
        .range([5, 45]);

    var thisYearTotalData = [];
    var thisYearHSData = []; // these have each state
    var thisYearBachData = [];

    //This holds each group's UnitedStates data for Total Education or Total Race
    if (education_isAgeData){
        thisYearTotalData = education_getSelectedYearData(education_ageTotalData);
        thisYearHSData = education_getSelectedYearData(education_ageHighSchoolData); 
        thisYearBachData = education_getSelectedYearData(education_ageBachelorData);

        thisYearTotalData = ageGroups.map(group => ({
            group: group,
            value: parseInt(thisYearTotalData[group].UnitedStates.Estimate.replace(/,/g, ''), 10)
        }));
        thisYearHSData = education_averageEstimateByState(thisYearHSData, education_isAgeData);
        thisYearBachData = education_averageEstimateByState(thisYearBachData, education_isAgeData);
    }
    else{
        thisYearTotalData = education_getSelectedYearData(education_raceTotalData);
        thisYearHSData = education_getSelectedYearData(education_raceHighSchoolData);
        thisYearBachData = education_getSelectedYearData(education_raceBachelorData);

        thisYearTotalData = raceGroups.map(group => ({
            group: group,
            value: parseInt(thisYearTotalData[group].UnitedStates.Estimate.replace(/,/g, ''), 10)
        }));
        thisYearHSData = education_averageEstimateByState(thisYearHSData, education_isAgeData);
        thisYearBachData = education_averageEstimateByState(thisYearBachData, education_isAgeData);
    }

    
    // MAP PART --------------------------------------------------------------------------------------
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(function (us) {
        svg.selectAll(".state")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path);

        // create circles here. use projection if there is a value
        svg.selectAll(".state-circle")
            .data(topojson.feature(us, us.objects.states).features)
            .join(
                enter => enter.append("circle")
                    .attr("class", "state-circle")
                    .attr("cx", function(d) {
                        const centroid = projection(d3.geoCentroid(d));
                        return centroid ? centroid[0] : null; 
                    })
                    .attr("cy", function(d) {
                        const centroid = projection(d3.geoCentroid(d));
                        return centroid ? centroid[1] : null;
                    })
                    .attr("r", 0) 
                    .style("fill", "#2980b9")
                    .style("stroke", "black")
                    .style("stroke-width", 0.5)
                    .transition().duration(1000)
                        .attr("r", function(d) {
                            const stateData = cleanedData.find(state => state.name === d.properties.name);
                            if (stateData && stateData.Estimate) {
                                return radiusScale(stateData.Estimate); 
                            }
                            return 0;
                        }),
                update => update
                    .transition()
                    .duration(500)
                    .attr("r", function(d) {
                        const stateData = cleanedData.find(state => state.name === d.properties.name);
                        if (stateData && stateData.Estimate) {
                            return radiusScale(stateData.Estimate);
                        }
                        return 0;
                    }),
                exit => exit.remove()
            );
    }).catch(function(error) {
        console.error("Error loading GeoJSON data: ", error);
    });
    // add tool tip with percentage?

    // SET UP PIE CHART
    const pieData = d3.pie()
        .value(d => d.value)
        .sort(null)(thisYearTotalData);

    const arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    svg.selectAll('.arc').remove();
    svg.selectAll('.arc-label').remove();

    const group = svg.append("g")
        .attr("transform", `translate(${center[0]}, ${center[1]})`);

    console.log("piedata", pieData);
    // Clean data
    pieData.forEach(d => {
        d.data.group = d.data.group.replace("_Total", "").replace("Population", "");
    });

    // BAR CHART PART --------------------------------------------------------------------------------------
    // this will be average of all groups for HS and Bachelors, since the rest were for Total
    const combinedData = Object.keys(thisYearHSData).reduce((acc, state) => {
        acc[state] = {
            HS: thisYearHSData[state], // each state will have hs data
            Bach: thisYearBachData[state] // and bach data
        };
        return acc;
    }, {});

    // Convert the combinedData object to an array
    const dataArray = Object.entries(combinedData);
    const barWidth = 20;
    const radius = 50;
    const barOffset = 330;

    svg.select(".chartGroup").remove();

    const chartGroup = group.append("g").attr("class", "chartGroup");

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "white")
        .style("padding", "5px")
        .style("border-radius", "3px")
        .style("font-size", "18px");

    // Loop through each state and create radial bars
    dataArray.forEach(([state, data], index) => {
        const angle = (index / dataArray.length) * 2 * Math.PI; 
        const maxValue = Math.max(data.HS, data.Bach); 

        // Create a group for each state's bars
        const barGroup = chartGroup.append("g")
            .attr("transform", `rotate(${angle * 180 / Math.PI}) translate(0, ${radius})`);
    
        // Create bars for HS data (scaled by maxValue)
        barGroup.append("rect")
            .attr("x", -barWidth / 2) 
            .attr("y", barOffset)
            .attr("width", barWidth)
            .attr("height", (data.HS / maxValue) * radius)
            .style("fill", "#A7A8AA")
            .on("mouseover", function(event) {
                tooltip.style("visibility", "visible")
                .text(`High School Degree or Higher: ${Math.round(data.HS)}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY + 5) + "px")
                    .style("left", (event.pageX + 5) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    
        // Create bars for Bach data (scaled by maxValue)
        barGroup.append("rect")
            .attr("x", -barWidth / 2)
            .attr("y", (data.HS / maxValue) * radius + barOffset)
            .attr("width", barWidth)
            .attr("height", (data.Bach / maxValue) * radius)
            .style("fill", "#B0C4DE")
            .on("mouseover", function(event) {
                tooltip.style("visibility", "visible")
                .text(`Bachelors Degree or Higher: ${Math.round(data.Bach)}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY + 5) + "px")
                    .style("left", (event.pageX + 5) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    
        // Optional: Add state labels at the end of each bar
        barGroup.append("text")
            .attr("x", 0)
            .attr("y", (data.HS / maxValue) * radius + (data.Bach / maxValue) * radius + barOffset  +20)
            .attr("text-anchor", "middle")
            .text(state)
            .style("font-size", "12px");
    });


    // ARC PART PIE CHART  --------------------------------------------------------------------------------------
    // Bind pie data for arcs
    const arcs = group.selectAll(".arc")
        .data(pieData)
        .join(
            enter => enter.append("path")
                .attr("class", "arc")
                .attr("d", arc)
                .style("fill", (d, i) => americanGovColors[i % americanGovColors.length])
                .style("stroke", "#fff")
                .style("stroke-width", 1)
                .transition().duration(500)
                .attrTween("d", function(d) { //https://stackoverflow.com/questions/54852791/angular-d3-understanding-attrtween-function for d3.interpolate and attrTween
                    const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                    return function(t) {
                        return arc(i(t));
                    };
                }),
            update => update
                .transition().duration(500)
                .attr("d", arc)
                .style("fill", (d, i) => americanGovColors[i % americanGovColors.length]),

            exit => exit
                .transition().duration(500)
                .attrTween("d", function(d) {
                    const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                    return function(t) {
                        return arc(i(t));
                    };
                })
                .remove()
        );
    
    // add labels, tool tip wouldnt work
    const labels = group.selectAll(".arc-label")
        .data(pieData)
        .join(
            enter => enter.append("text")
                .attr("class", "arc-label")
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .attr("text-anchor", "middle")
                .style("font-size", "18px")
                .style("fill", "#000")
                .text(d => `${d.data.group.replace("_Total", "").replace("Population", "")} - ${Math.round(d.data.value / d3.sum(pieData.map(d => d.value)) * 100)}%`)  //calc percentage since I didnt use Percentage data...
                .style("opacity", 0)
                .transition().duration(500) 
                .style("opacity", 1),
    
            update => update
                .transition().duration(500)
                .attr("transform", d => `translate(${arc.centroid(d)})`)
                .text(d => `${d.data.group.replace("_Total", "").replace("Population", "")} - ${Math.round(d.data.value / d3.sum(pieData.map(d => d.value)) * 100)}%`), //calc percentage since I didnt use Percentage data...
    
            exit => exit
                .transition().duration(200)
                .style("opacity", 0)
                .remove()
    );
}


function education_averageEstimateByState(data) {
    let result = {};

    // Loop through each group in the data then state
    for (let group in data) {
        for (let state in data[group]) {
            if (state !== "UnitedStates") {  // Exclude UnitedStates
                const estimate = data[group][state].Estimate;
                const cleanedEstimate = parseInt(estimate.replace(',', ''));
                if (estimate && !isNaN(cleanedEstimate)) {
                    // Initialize state in result if not there already
                    if (!result[state]) {
                        result[state] = { sum: 0, count: 0 };
                    }
                    // Add the cleaned estimate to the state's sum and increment count
                    result[state].sum += cleanedEstimate;
                    result[state].count++;
                }
            }
        }
    }
    // Calculate the average estimate for each state
    for (let state in result) { 
        if (result[state].count > 0) {
            result[state] = result[state].sum / result[state].count;
        } else {
            result[state] = 0;
        }
    }
    return result;
}

function drawEducation() { //initial function
    //Default - Map of Total education by age
    education_State_Age();
    education_drawMapChart();
}
