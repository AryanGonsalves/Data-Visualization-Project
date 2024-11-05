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
            dataObject[year] = {}; // Initialize an object for the year's data

            // Group data by state
            data.forEach(row => {
                // Extract state names from the keys
                const stateKeys = Object.keys(row).filter(key => !key.startsWith('Label (Grouping)'));
                
                stateKeys.forEach(key => {
                    const stateName = key.split('_')[0]; // Extract state name
                    // If the state dont exist in the object, initialize it
                    if (!dataObject[year][stateName]) {
                        dataObject[year][stateName] = {};
                    }

                    // Assign the value to the appropriate state
                    dataObject[year][stateName][key] = row[key];
                });
            });
            // RENAME to remove state prefix
            Object.keys(dataObject[year]).forEach(state => {
                const stateData = dataObject[year][state];
                Object.keys(stateData).forEach(key => {
                    // remove
                    const newKey = key.replace(`${state}_`, '');
                    stateData[newKey] = stateData[key]; // assign old value to new
                    delete stateData[key]; // Delete old
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




function drawEducation() {
    console.log("entered education section!");
    d3.selectAll("svg").style("display", "none");

    const svg = d3.select("#visualization-education").style("display", "block");
    svg.selectAll("*").remove(); 

    const width = svg.attr("width");
    const height = svg.attr("height");

    svg.append("text")
        .attr("x", width / 2) 
        .attr("y", height / 2) 
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text("Welcome to Education!")
        .attr("font-size", "24px")
        .attr("fill", "steelblue");
}
