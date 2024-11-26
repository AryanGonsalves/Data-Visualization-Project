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


// Slider stuff
var slider = '';
var selectedYear = 0;

// Called by HTML - when slider changes, redraw 
function updateYearLabel(year) {
    selectedYear = parseInt(year);
    console.log("selectedYear", selectedYear);
    document.getElementById('yearLabel').textContent = year;
}

// Load data
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

    console.log("highSchoolData", highSchoolData);
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

    console.log("bachelorData", bachelorData);
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

    console.log("totalData", totalData);
    ageTotalData = totalData;
    return totalData;
}

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

// Web page interaction section
document.addEventListener('DOMContentLoaded', function () {
    slider = document.getElementById('yearLabel');
    selectedYear = parseInt(slider.textContent);
    slider.addEventListener('input', function () {
        selectedYear = parseInt(slider.textContent);
        yearLabel.textContent = selectedYear;
    });
    loadData().then(function() {
        drawMap(); // Call drawMap only after data is loaded
    });
});

function drawHS(){
    State_HS();
    getHighSchoolAgeData();
    getHighSchoolRaceData();
}

function drawBach(){
    State_Bach();
    getBachelorAgeData();
    getBachelorRaceData();

}

function drawTotal(){
    State_Total();
    getTotalEducationAgeData();
    getTotalEducationRaceData();

}

function drawAge(){
    State_Age();

}

function drawRace(){
    State_Race();

}

function drawMapChart(){
    const svg = d3.select("#visualization-education");

    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox


    var map = d3.choropleth()
        .geofile('/d3-geomap/topojson/countries/USA.json')
        .projection(d3.geoAlbersUsa)
        .column(selectedYear)
        .unitId('fips')
        .scale(1000)
        .legend(true);

    d3.csv('/data/venture-capital.csv').then(data => {
        map.draw(svg.datum(data));
    });
}

function drawBarChart(){
    const svg = d3.select("#visualization-education");

    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox

}

function drawEducation() { //initail function

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
    drawMap();
    drawAge();
    drawTotal();
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