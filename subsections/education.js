
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

var education_isAgeData = false;
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
    education_ageDropDown = document.getElementById('ageGroupDropdown');
    education_raceDropDown = document.getElementById('raceGroupDropdown');

    education_ageButton = document.getElementById('ageButton');
    raeducation_ceButton = document.getElementById('raceButton');
    education_mapButton = document.getElementById('mapButton');
    education_barButton = document.getElementById('barButton');
    education_hsButton = document.getElementById('hsButton');
    education_bachButton = document.getElementById('bachButton');
    education_totalButton = document.getElementById('totalButton');

    // Default settings to have these on
    education_mapButton.classList.add('selected');
    education_ageButton.classList.add('selected');
    education_totalButton.classList.add('selected');
    education_raceDropDown.disabled = true;

    // Load data and draw
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
    education_ageDropDown.addEventListener('change', function () {
        education_State_Age();
        education_selectedAgeGroup = this.value;
        if (education_isMapChart){
            education_drawMapChart();
        }
        else {
            education_drawBarChart();
        }
    });
    education_raceDropDown.addEventListener('change', function () {
        education_State_Race();
        education_selectedRaceGroup = this.value;
        if (education_isMapChart){
            education_drawMapChart();
        }
        else {
            education_drawBarChart();
        }
    });
    education_mapButton.addEventListener('click', function() {
        education_toggleSelected([education_mapButton, education_barButton]);
        education_ageButton.disabled = false;
        raeducation_ceButton.disabled = false;
        if (education_isAgeData){
            education_State_Age();
            education_ageDropDown.disabled = false;
            education_raceDropDown.disabled = true;
        }
        else{
            education_State_Race();
            education_ageDropDown.disabled = true;
            education_raceDropDown.disabled = false;
            raeducation_ceButton.classList.add('selected');
        }
        education_raceDropDown.disabled = true;
        education_drawMapChart();
    });
    education_barButton.addEventListener('click', function() {
        education_toggleSelected([education_mapButton, education_barButton]);
        education_ageDropDown.disabled = true;
        education_raceDropDown.disabled = true;
        education_drawBarChart();
    });

    education_hsButton.addEventListener('click', function() {
        education_State_HS();
        education_toggleSelected([education_hsButton, education_bachButton, education_totalButton]);
    });
    education_bachButton.addEventListener('click', function() {
        education_State_Bach();
        education_toggleSelected([education_hsButton, education_bachButton, education_totalButton]);
    });
    education_totalButton.addEventListener('click', function() {
        education_State_Total();
        education_toggleSelected([education_hsButton, education_bachButton, education_totalButton]);
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
// Update Age Group based on dropdown selection
function education_updateAgeGroup(input) {
    education_selectedAgeGroup = input;
}
function education_updateRaceGroup(input) {
    education_selectedRaceGroup = input;
}
function education_toggleSelected(group) {
    group.forEach(button => button.classList.remove('selected')); 
    event.target.classList.add('selected');
}


// Load data helper functions
function education_loadData() {
    return new Promise(function(resolve, reject) {
        try {
            education_loadCall();

            setTimeout(function() {
                resolve(); 
            }, 1000);

        } catch (error) {
            reject('Error loading data: ' + error);
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

                    // Initialize the population group for that state if not present
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

            if (property.includes('_HighSchool')) {
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
function education_drawHS(){
    education_State_HS();
    if (education_isMapChart){
        education_drawMapChart();
    }
    else{
        education_drawBarChart();
    }
}
function education_drawBach(){
    education_State_Bach();
    if (education_isMapChart){
        education_drawMapChart();
    }
    else{
        education_drawBarChart();
    }
}
function education_drawTotal(){
    education_State_Total();
    if (education_isMapChart){
        education_drawMapChart();
    }
    else{
        education_drawBarChart();
    }
}

function education_drawAge(){
    education_State_Age();
    if (education_isMapChart){
        education_drawMapChart();
    }
    else{
        education_drawBarChart();
    }
}
function education_drawRace(){
    education_State_Race();
    if (education_isMapChart){
        education_drawMapChart();
    }
    else{
        education_drawBarChart();
    }
}


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
function education_filterDataBarChartAge(){
    var data = [];
    if (education_isAgeData){ // age data
        if (education_isHSData){
            data = education_getSelectedYearData(education_ageHighSchoolData);
            data = education_getUSOnlyBarChart(data);
        }
        else if (education_isBachData){
            data = education_getSelectedYearData(education_ageBachelorData);
            data = education_getUSOnlyBarChart(data);
        }
        else{
            data = education_getSelectedYearData(education_ageTotalData);
            data = education_getUSOnlyBarChart(data);
        }
    }
    else {  // race data
        if (education_isHSData){
            data = education_getSelectedYearData(education_raceHighSchoolData);
            data = education_getUSOnlyBarChart(data);
        }
        else if (education_isBachData){
            data = education_getSelectedYearData(education_raceBachelorData);
            data = education_getUSOnlyBarChart(data);
        }
        else{
            data = education_getSelectedYearData(education_raceTotalData);
            data = education_getUSOnlyBarChart(data);
        }
    }
    return data;
}


function education_drawMapChart(){
    const svg = d3.select("#visualization-education");
    // State management
    if (education_isMapChart){
        education_State_Map();
    }
    else{
        education_State_Map();
        svg.selectAll('*').remove();
    }

    var data = education_filterData();

    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox

    // Set up the projection and path
    const projection = d3.geoAlbersUsa()
        .scale(width * 1.2) 
        .translate([width / 2, height / 2]);  
    const path = d3.geoPath().projection(projection);


    const cleanedData = Object.entries(data).map(([stateName, stateData]) => {
        return {
            name: stateName,
            Estimate: parseInt(stateData.Estimate.replace(/,/g, ''), 10),
        };
    });

    const minEstimate = d3.min(cleanedData, d => d.Estimate);
    const maxEstimate = d3.max(cleanedData, d => d.Estimate);

    const radiusScale = d3.scaleLinear()
        .domain([minEstimate, maxEstimate]) 
        .range([5, 130]);

    // Load US states GeoJSON
    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then(function (us) {
        svg.selectAll(".state")
            .data(topojson.feature(us, us.objects.states).features)
            .enter().append("path")
            .attr("class", "state")
            .attr("d", path);

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
                            // const stateData = data[d.properties.name];
                            const stateData = cleanedData.find(state => state.name === d.properties.name);

                            if (stateData && stateData.Estimate) {
                                // return parseInt(stateData.Estimate);
                                // return Math.log(parseInt(stateData.Estimate) + 10) *6; 
                                return radiusScale(stateData.Estimate); 
                            }
                            return 0;
                        }),
                update => update
                    .transition()
                    .duration(500)
                    .attr("r", function(d) {
                        // const stateData = data[d.properties.name];
                        const stateData = cleanedData.find(state => state.name === d.properties.name);

                        if (stateData && stateData.Estimate) {
                            // return Math.sqrt(parseInt(stateData.Estimate));
                            // return Math.log(parseInt(stateData.Estimate) + 10) *6;  
                            return radiusScale(stateData.Estimate);
                        }
                        return 0;
                    }),
                exit => exit.remove()
            );
    }).catch(function(error) {
        console.error("Error loading GeoJSON data: ", error);
    });

    
    
}

const education_xAxisLabels = [
    { value: "18to24", label: "18-24" },
    { value: "25Over", label: "25 and Over" },
    { value: "25to34", label: "25-34" },
    { value: "35to44", label: "35-44" },
    { value: "45to64", label: "45-64" },
    { value: "65Over", label: "65 and Over" },
    { value: "AmericanIndianAlaskaNative_", label: "American Indian/Alaskan" },
    { value: "Asian_", label: "Asian" },
    { value: "Black_", label: "Black" },
    { value: "HispanicLatino_", label: "Hispanic/Latino" },
    { value: "NativeHawaiianOtherPacificIslander_", label: "Hawaiian/Pacific Is." },
    { value: "OtherRace_", label: "Other Race" },
    { value: "TwoOrMoreRace_", label: "Two+ Races" },
    { value: "WhiteNotHispanicLatino_", label: "White(Not Hisp./Lat.)" },
    { value: "White_", label: "White" }
];


const education_customColors = ['#223843', '#DBD3D8', '#D8B4A0', '#D77A61', '#4B543B', '#132A13'];
const education_colorNames = ['Deep Navy', 'Pale Lavender', 'Muted Peach', 'Warm Coral', 'Earthy Olive', 'Dark Forest Green'];
const education_colorScale = d3.scaleOrdinal()
    .domain(education_colorNames)  
    .range(education_customColors);

function education_drawBarChart(){
    const svg = d3.select("#visualization-education");

    if (education_isMapChart){
        education_State_Bar();
        svg.selectAll('*').remove();
    }
    else{
        education_State_Bar();
    }

    var data = education_filterDataBarChartAge();

    const chartData = Object.keys(data).map(key => {
        let match = '';
        if (education_isAgeData){
            match = education_xAxisLabels.find(item => key.includes(item.value));
        }
        else{
            match = education_xAxisLabels.find(item => key.startsWith(item.value));
        }
        return {
            group: match ? match.label : key,
            population: parseInt(data[key].Estimate.replace(/,/g, ''), 10)
        };
    });
    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox

    // Set margins and dimensions
    const margin = { top: 40, right: 40, bottom: 40, left: 100 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleBand()
        .domain(chartData.map(d => d.group))
        .range([0, innerWidth])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.population)])
        .range([innerHeight, 0]);

    // Create the SVG group to hold chart elements
    const chartGroup = svg

    chartGroup.selectAll(".bar").attr("transform", `translate(${margin.left}, ${margin.top})`);
    chartGroup.selectAll(".bar")
        .data(chartData, d => d.group) 
        .join(
            // Enter: Create new bars
            enter => enter.append("rect")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .attr("class", "bar")
                .attr("x", d => xScale(d.group))
                .attr("y", innerHeight) 
                .attr("width", xScale.bandwidth())
                .attr("height", 0) 
                .attr("fill", d => education_colorScale(d.group))
                .transition().duration(500)
                .attr("y", d => yScale(d.population))
                .attr("height", d => innerHeight - yScale(d.population)), 
            update => update
                .transition().duration(500) 
                .attr("y", d => yScale(d.population))
                .attr("height", d => innerHeight - yScale(d.population)),
            exit => exit
                .transition().duration(500)
                .attr("y", innerHeight)
                .attr("height", 0)
                .remove()
        );

    // Add x-axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    // Add x-axis
    svg.selectAll(".x-axis")
        .data([0]) 
        .join(
            enter => enter.append("g")
                .attr("class", "x-axis")
                .style("font-size", "13px")
                .attr("transform", `translate(${margin.left}, ${innerHeight + margin.top})`)
                .call(xAxis), 
            update => update
                .style("font-size", "13px")
                .transition()
                .duration(500)
                .call(xAxis)
        );

        // Add y-axis
        svg.selectAll(".y-axis")
        .data([0])
        .join(
            enter => enter.append("g")
                .style("font-size", "16px")
                .attr("class", "y-axis")
                .attr("transform", `translate(${margin.left}, ${margin.top})`)
                .call(yAxis), 
            update => update
                .style("font-size", "16px")
                .transition()
                .duration(500)
                .call(yAxis) 
        );
}

function drawEducation() { //initial function
    const svg = d3.select("#visualization-education");

    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Welcome to Education!")
        .attr("font-size", "24px")
        .attr("fill", "steelblue");

    //Default - Map of Total education by age
    education_State_Age();
    education_State_Total();
    education_State_Map();

    education_drawMapChart();
}


function education_State_Map(){
    education_isMapChart = true; 
    education_isBarChart = false;
}
function education_State_Bar(){
    education_isMapChart = false; 
    education_isBarChart = true;
}
function education_State_Age(){
    education_isAgeData = true;
    education_isRaceData = false;
}
function education_State_Race(){
    education_isAgeData = false;
    education_isRaceData = true;
}
function education_State_HS(){
    education_isHSData = true;
    education_isBachData = false;
    education_isTotalData = false;
}
function education_State_Bach(){
    education_isHSData = false;
    education_isBachData = true;
    education_isTotalData = false;
}
function education_State_Total(){
    education_isHSData = false;
    education_isBachData = false;
    education_isTotalData = true;
}
