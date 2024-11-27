
const age_files = [
    "/data/education/attainment/age/2016.csv",
    "/data/education/attainment/age/2017.csv",
    "/data/education/attainment/age/2018.csv",
    "/data/education/attainment/age/2019.csv",
    "/data/education/attainment/age/2020.csv",
    "/data/education/attainment/age/2021.csv",
    "/data/education/attainment/age/2022.csv",
    "/data/education/attainment/age/2023.csv"
];
const race_files = [
    "/data/education/attainment/race/2016.csv",
    "/data/education/attainment/race/2017.csv",
    "/data/education/attainment/race/2018.csv",
    "/data/education/attainment/race/2019.csv",
    "/data/education/attainment/race/2020.csv",
    "/data/education/attainment/race/2021.csv",
    "/data/education/attainment/race/2022.csv",
    "/data/education/attainment/race/2023.csv"
];

let ageData = [];
let raceData = [];

let ageHighSchoolData = [];
let raceHighSchoolData = [];

let ageBachelorData = [];
let raceBachelorData = [];

let ageTotalData = [];
let raceTotalData = [];


// State management
var isMapChart = false;
var isBarChart = false;

var isAgeData = false;
var isRaceData = false;

var isHSData = false;
var isBachData = false;
var isTotalData = false;

var selectedAgeGroup = "18to24";
var selectedRaceGroup = "AmericanIndianAlaskaNative";

// Slider stuff
var slider = '';
var selectedYear = 2016;

var ageDropDown = "";
var raceDropDown = "";


// Button stuff
var ageButton = '';
var raceButton = '';
var mapButton = '';
var barButton = '';
var hsButton = '';
var bachButton = '';
var totalButton = '';

// Web page interaction section
document.addEventListener('DOMContentLoaded', function () {
    ageDropDown = document.getElementById('ageGroupDropdown');
    raceDropDown = document.getElementById('raceGroupDropdown');

    ageButton = document.getElementById('ageButton');
    raceButton = document.getElementById('raceButton');
    mapButton = document.getElementById('mapButton');
    barButton = document.getElementById('barButton');
    hsButton = document.getElementById('hsButton');
    bachButton = document.getElementById('bachButton');
    totalButton = document.getElementById('totalButton');

    // Default settings to have these on
    mapButton.classList.add('selected');
    ageButton.classList.add('selected');
    totalButton.classList.add('selected');
    raceDropDown.disabled = true;

    // Load data and draw
    loadData().then(function() {
        getHighSchoolAgeData();
        getHighSchoolRaceData();
        getBachelorAgeData();
        getBachelorRaceData();
        getTotalEducationAgeData();
        getTotalEducationRaceData();
        drawMapChart(); // Call drawMapChart only after data is loaded
    });

    // Event listeners 
    slider = document.getElementById('yearLabel');
    selectedYear = parseInt(slider.textContent);
    slider.addEventListener('input', function () {
        selectedYear = parseInt(slider.textContent);
        yearLabel.textContent = selectedYear;
    });
    ageDropDown.addEventListener('change', function () {
        selectedAgeGroup = this.value;
        console.log("selectedAgeGroup",selectedAgeGroup);
        if (isMapChart){
            drawMapChart();
        }
        else {
            drawBarChart();
        }
    });
    raceDropDown.addEventListener('change', function () {
        selectedRaceGroup = this.value;
        console.log("selectedRaceGroup",selectedRaceGroup);
        if (isMapChart){
            drawMapChart();
        }
        else {
            drawBarChart();
        }
    });
    mapButton.addEventListener('click', () => toggleSelected([mapButton, barButton]));
    barButton.addEventListener('click', () => toggleSelected([mapButton, barButton]));
    hsButton.addEventListener('click', () => toggleSelected([hsButton, bachButton, totalButton]));
    bachButton.addEventListener('click', () => toggleSelected([hsButton, bachButton, totalButton]));
    totalButton.addEventListener('click', () => toggleSelected([hsButton, bachButton, totalButton]));
    ageButton.addEventListener('click', function() {
        toggleSelected([ageButton, raceButton]);
        raceDropDown.disabled = true;
        ageDropDown.disabled = false;
    });
    raceButton.addEventListener('click', function() {
        toggleSelected([ageButton, raceButton]);
        ageDropDown.disabled = true;
        raceDropDown.disabled = false;
    });
});
// Called by HTML - when slider changes, redraw 
function updateYearLabel(year) {
    selectedYear = parseInt(year);
    document.getElementById('yearLabel').textContent = year;
    console.log("selectedYear",selectedYear);
    if (isMapChart){
        drawMapChart();
    }
    else {
        drawBarChart();
    }
}
// Update Age Group based on dropdown selection
function updateAgeGroup(input) {
    selectedAgeGroup = input;
    console.log("selectedAgeGroup", selectedAgeGroup);
}
function updateRaceGroup(input) {
    selectedRaceGroup = input;
    console.log("selectedRaceGroup", selectedRaceGroup);
}
function toggleSelected(group) {
    group.forEach(button => button.classList.remove('selected')); 
    event.target.classList.add('selected');
}


// Load data helper functions
function loadData() {
    return new Promise(function(resolve, reject) {
        try {
            loadCall();

            setTimeout(function() {
                resolve(); 
            }, 1000);

        } catch (error) {
            reject('Error loading data: ' + error);
        }
    });
}
function loadCall(){
    loadCSVFiles(age_files, ageData, function() {
        // After age files are loaded, load race files
        console.log("education - ageData loaded", ageData);
        loadCSVFiles(race_files, raceData, function() {
            // After both datasets are loaded, draw the education visualization
            console.log("education - raceData loaded", raceData);
        });
    });
}
function loadCSVFiles(files, dataObject, callback) {
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
function getHighSchoolRaceData() {
    const highSchoolData = {};

    // Loop through each year in the raceData
    Object.keys(raceData).forEach(year => {
        highSchoolData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(raceData[year]).forEach(property => {

            if (property.includes('_HighSchool')) {
                highSchoolData[year][property] = raceData[year][property];
            }
        });
    });

    raceHighSchoolData = highSchoolData;
    return highSchoolData;
}
function getHighSchoolAgeData(){
    const highSchoolData = {};

    // Loop through each year in the raceData
    Object.keys(ageData).forEach(year => {
        highSchoolData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(ageData[year]).forEach(property => {

            if (property.includes('_HighSchool')) {
                highSchoolData[year][property] = ageData[year][property];
            }
        });
    });
    ageHighSchoolData = highSchoolData;
    return highSchoolData;
}
function getBachelorRaceData() {
    const bachelorData = {};

    // Loop through each year in the raceData
    Object.keys(raceData).forEach(year => {
        bachelorData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(raceData[year]).forEach(property => {

            if (property.includes('_Bachelor')) {
                bachelorData[year][property] = raceData[year][property];
            }
        });
    });

    raceBachelorData = bachelorData;
    return bachelorData;
}
function getBachelorAgeData(){
    const bachelorData = {};

    // Loop through each year in the raceData
    Object.keys(ageData).forEach(year => {
        bachelorData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(ageData[year]).forEach(property => {

            if (property.includes('_Bachelor')) {
                bachelorData[year][property] = ageData[year][property];
            }
        });
    });
    ageBachelorData = bachelorData;
    return bachelorData;
}
function getTotalEducationRaceData() {
    const totalData = {};

    // Loop through each year in the raceData
    Object.keys(raceData).forEach(year => {
        totalData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(raceData[year]).forEach(property => {

            if (property.includes('_Total')) {
                totalData[year][property] = raceData[year][property];
            }
        });
    });

    raceTotalData = totalData;
    return totalData;
}
function getTotalEducationAgeData(){
    const totalData = {};

    // Loop through each year in the raceData
    Object.keys(ageData).forEach(year => {
        totalData[year] = {};

        // Loop through each property (state or other grouping) in the year
        Object.keys(ageData[year]).forEach(property => {

            if (property.includes('_Total')) {
                totalData[year][property] = ageData[year][property];
            }
        });
    });

    ageTotalData = totalData;
    return totalData;
}


function getAgeGroupData(data) {
    const ageGroupData = {};
    Object.keys(data).forEach(type => {
        ageGroupData[type] = {};
        Object.keys(data[type]).forEach(property => {
            if (property.includes(selectedAgeGroup)) {
                let value = data[type][property];
                if (value === 'N') {
                    value = 1; // Set to 0 if the value is 'N'
                }
                ageGroupData[type][property] = value;
            }
        });
    });
    return ageGroupData;
}
function getRaceGroupData(data) {
    const raceGroupData = {};
    Object.keys(data).forEach(type => {
        raceGroupData[type] = {};
        Object.keys(data[type]).forEach(property => {
            if (property.startsWith(selectedRaceGroup)) {
                let value = data[type][property];
                if (value === 'N') {
                    value = 1;
                }
                raceGroupData[type][property] = value;
            }
        });
    });
    return raceGroupData;
}

function getSelectedYearData(data){
    var yearData = [];
    Object.keys(data).forEach(year => {
        if (year == selectedYear) {
            yearData = data[year];
        }
    });
    return yearData;
}

function drawHS(){
    console.log("High School button selected");
    State_HS();
    if (isMapChart){
        drawMapChart();
    }
    else{
        drawBarChart();
    }
}
function drawBach(){
    console.log("Bachelor button selected");
    State_Bach();
    if (isMapChart){
        drawMapChart();
    }
    else{
        drawBarChart();
    }
}
function drawTotal(){
    console.log("Total button selected");
    State_Total();
    if (isMapChart){
        drawMapChart();
    }
    else{
        drawBarChart();
    }
}

function drawAge(){
    console.log("Age button selected");
    State_Age();
    if (isMapChart){
        drawMapChart();
    }
    else{
        drawBarChart();
    }
}
function drawRace(){
    console.log("Race button selected");
    State_Race();
    if (isMapChart){
        drawMapChart();
    }
    else{
        drawBarChart();
    }
}


function filterData(){
    var data = [];
    if (isAgeData){ // age data
        if (isHSData){
            console.log("Data: Age, HS");
            data = getAgeGroupData(ageHighSchoolData);
            data = getSelectedYearData(data);
        }
        else if (isBachData){
            console.log("Data: Age, Bach");
            data = getAgeGroupData(ageBachelorData);
            data = getSelectedYearData(data);
        }
        else{
            console.log("Data: Age, Total");
            data = getAgeGroupData(ageTotalData);
            data = getSelectedYearData(data);
        }
    }
    else {  // race data
        if (isHSData){
            console.log("Data: Race, HS");
            data = getRaceGroupData(raceHighSchoolData);
            data = getSelectedYearData(data);
        }
        else if (isBachData){
            console.log("Data: Race, Bach");
            data = getRaceGroupData(raceBachelorData);
            data = getSelectedYearData(data);
        }
        else{
            console.log("Data: Race, Total");
            data = getRaceGroupData(raceTotalData);
            data = getSelectedYearData(data);
        }
    }
    var returnData = [];
    Object.keys(data).forEach(property => { 
        returnData = data[property]
    });
    return returnData;
}

function drawMapChart(){
    console.log("Drawing Map Chart");
    var data = filterData();
    console.log("Map Data: ", data);

    const svg = d3.select("#visualization-education");
    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox


    // var controlData = [];
    // if (isAgeData){
    //     controlData = ageData;
    // }
    // else{
    //     controlData = raceData;
    // }

    // const maxEstimate = d3.max(Object.values(controlData), d => d.Estimate);
    // const minEstimate = d3.min(Object.values(controlData), d => d.Estimate);
    // const normalizedValue = (stateData.Estimate - minEstimate) / (maxEstimate - minEstimate);



    // Set up the projection and path
    const projection = d3.geoAlbersUsa()
        .scale(width * 1.2) 
        .translate([width / 2, height / 2]);  
    const path = d3.geoPath().projection(projection);
    const scaleFactor = 70000;
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
                    .style("fill", "rgba(143, 188, 143, 0.6)")
                    .style("stroke", "black")
                    .style("stroke-width", 0.5)
                    .transition().duration(1000)
                        .attr("r", function(d) {
                            const stateData = data[d.properties.name];
                            if (stateData && stateData.Estimate) {
                                return Math.sqrt(parseInt(stateData.Estimate)); // Amplify the difference
                            }
                            return 0;
                        }),

                update => update
                    .transition()
                    .duration(500)
                    .attr("r", function(d) {
                        const stateData = data[d.properties.name];
                        if (stateData && stateData.Estimate) {
                            return Math.sqrt(parseInt(stateData.Estimate));
                        }
                        return 0;
                    }),

                exit => exit.remove() // Remove any circles that no longer exist
            );
    }).catch(function(error) {
        console.error("Error loading GeoJSON data: ", error);
    });

    
    
}

function drawBarChart(){
    console.log("Drawing Bar Chart");

    var data = filterData();
    console.log("Bar Data: ", data);


    const svg = d3.select("#visualization-education");

    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox

}

function drawEducation() { //initial function
    console.log("Education Initialized");
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
    State_Age();
    State_Total();
    State_Map();

    console.log("isMapChart", isMapChart);
    console.log("isBarChart", isBarChart);

    drawMapChart();
}


function State_Map(){
    isMapChart = true; 
    isBarChart = false;
}
function State_Bar(){
    isMapChart = false; 
    isBarChart = true;
}
function State_Age(){
    isAgeData = true;
    isRaceData = false;
}
function State_Race(){
    isAgeData = false;
    isRaceData = true;
}
function State_HS(){
    isHSData = true;
    isBachData = false;
    isTotalData = false;
}
function State_Bach(){
    isHSData = false;
    isBachData = true;
    isTotalData = false;
}
function State_Total(){
    isHSData = false;
    isBachData = false;
    isTotalData = true;
}
