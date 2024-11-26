
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
var selectedYear = 0;

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
    hsButton.classList.add('selected');

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
    ageButton.addEventListener('click', () => toggleSelected([ageButton, raceButton]));
    raceButton.addEventListener('click', () => toggleSelected([ageButton, raceButton]));
});
// Called by HTML - when slider changes, redraw 
function updateYearLabel(year) {
    selectedYear = parseInt(year);
    console.log("selectedYear", selectedYear);
    document.getElementById('yearLabel').textContent = year;
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
                ageGroupData[type][property] = data[type][property];
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
            if (property.includes(selectedRaceGroup)) {
                raceGroupData[type][property] = data[type][property];
            }
        });
    });
    return raceGroupData;
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
        }
        else if (isBachData){
            console.log("Data: Age, Bach");
            data = getAgeGroupData(ageBachelorData);
        }
        else{
            console.log("Data: Age, Total");
            data = getAgeGroupData(ageTotalData);
        }
    }
    else {  // race data
        if (isHSData){
            console.log("Data: Race, HS");
            data = getRaceGroupData(raceHighSchoolData);
        }
        else if (isBachData){
            console.log("Data: Race, Bach");
            data = getRaceGroupData(raceBachelorData);
        }
        else{
            console.log("Data: Race, Total");
            data = getRaceGroupData(raceTotalData);
        }
    }
    return data;
}


async function drawMapChart(){
    console.log("Drawing Map Chart");

    var data = filterData();
    console.log("Map Data: ", data);

    const svg = d3.select("#visualization-education");

    const width = svg.attr("viewBox").split(" ")[2]; // Get the width from viewBox
    const height = svg.attr("viewBox").split(" ")[3]; // Get the height from viewBox

    const mapDataset = await d3.json(
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"
    );

    // Set up chart dimensions and padding
    const padding = { top: 32, right: 32, bottom: 160, left: 160 };
    const innerHeight = 1000 - padding.top - padding.bottom;
    const innerWidth = 1000 - padding.left - padding.right;



    // Tooltip setup
    const tooltip = d3
        .select("main")
        .append("div")
        .attr("class", "dataTip")
        .attr("id", "tooltip");

    const path = d3.geoPath();

    // // Define color scale based on education level (can be adjusted per dataset type)
    // const bachelorDegree = data.Percent;
    // const maxPercent = d3.max(bachelorDegree) / 100;
    // const minPercent = d3.min(bachelorDegree) / 100;
    // const color = d3
    //     .scaleSequential()
    //     .interpolator(d3.interpolateViridis)
    //     .domain([minPercent, maxPercent]);

    // Draw counties based on GeoJSON data and educational data
    // svg
    //     .append("g")
    //     .selectAll("path")
    //     .data(topojson.feature(mapDataset, mapDataset.objects.counties).features)
    //     .enter()
    //     .append("path")
    //     .attr("d", path)
    //     .attr("class", "county")
    //     .attr("data-fips", (d) => d.id)
    //     .attr("data-education", (d) => data.filter((e) => e.fips == d.id)[0].bachelorsOrHigher)
    //     .attr("fill", (d) => color(data.filter((e) => e.fips == d.id)[0].bachelorsOrHigher))
    //     .on("mouseover", function (d) {
    //     tooltip.transition().style("opacity", 1);
    //     tooltip
    //         .html(
    //         `State: ${educationDataset.filter((e) => e.fips == d.id)[0].state}<br>
    //         County: ${educationDataset.filter((e) => e.fips == d.id)[0].area_name}<br>
    //         % with Bachelor's Degree or Higher: ${educationDataset.filter((e) => e.fips == d.id)[0].bachelorsOrHigher}`
    //         )
    //         .style("left", `${d3.event.pageX}px`)
    //         .style("top", `${d3.event.pageY}px`)
    //         .attr("data-education", educationDataset.filter((e) => e.fips == d.id)[0].bachelorsOrHigher);
    //     d3.select(this).style("opacity", 0.5);
    //     })
    //     .on("mouseout", function () {
    //     tooltip.transition().style("opacity", 0);
    //     d3.select(this).style("opacity", 1);
    //     });

    // // Draw state borders
    // svg
    //     .append("path")
    //     .datum(
    //     topojson.mesh(mapDataset, mapDataset.objects.states, (a, b) => a !== b)
    //     )
    //     .attr("class", "states")
    //     .attr("d", path);

    // // Add legend for color scale
    // let legend = svg
    //     .selectAll(".legend")
    //     .data(color.domain())
    //     .enter()
    //     .append("g")
    //     .attr("id", "legend")
    //     .attr("transform", (d, i) => `translate(${padding.left / 2}, ${innerHeight - padding.top - i * 2})`);

    // legend
    //     .selectAll()
    //     .data(bachelorDegree)
    //     .enter()
    //     .append("rect")
    //     .attr("x", (d, i) => i * 2)
    //     .attr("y", 0)
    //     .attr("width", 2)
    //     .attr("height", 20)
    //     .style("fill", (d) => color(d))
    //     .on("mouseover", function (d) {
    //     tooltip.transition().style("opacity", 1);
    //     tooltip
    //         .html(`% Bachelor's Degrees: ${d}`)
    //         .style("left", `${d3.event.pageX}px`)
    //         .style("top", `${d3.event.pageY}px`);
    //     d3.select(this).style("opacity", 0.5);
    //     })
    //     .on("mouseout", function () {
    //     tooltip.transition().style("opacity", 0);
    //     d3.select(this).style("opacity", 1);
    //     });
    
    
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
