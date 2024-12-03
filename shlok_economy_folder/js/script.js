var usaMap;
var data;
var employmentData =[];
var populationData=[];
var mortalityData=[];
var rentalData=[];
var salaryData=[];
var index = 0;
var topStates = []
d3.csv("2022_us_states_data.csv", function(error, allData) {

    allData.forEach(function(d) {
        // Convert numeric values to 'numbers'
        d['total_population'] = +d['total_population'];
        d['Unemployment_rate'] = +d['Unemployment_rate'];
        d['salary_avg'] = +d['salary_avg'];
        d['Mortality_rate'] = +d['Mortality_rate'];
        d['cost_per_sqft'] = +d['cost_per_sqft'];
    });

    var rank = 1
    allData.sort(function(a, b){return b['total_population'] - a['total_population']});
    allData.forEach(function(d) {
        d['total_population_RANK'] = rank ++
    });

    rank = 51
    allData.sort(function(a, b){return b['salary_avg'] - a['salary_avg']});
    allData.forEach(function(d) {
        d['salary_avg_RANK'] = rank
        rank--
    });

    rank = 1
    allData.sort(function(a, b){return b['Unemployment_rate'] - a['Unemployment_rate']});
    allData.forEach(function(d) {
        d['Unemployment_rate_RANK'] = rank
        rank++
    });

    rank = 1
    allData.sort(function(a, b){return b['Mortality_rate'] - a['Mortality_rate']});
    allData.forEach(function(d) {
        d['Mortality_rate_RANK'] = rank
        rank++
    });

    rank = 1
    allData.sort(function(a, b){return b['cost_per_sqft'] - a['cost_per_sqft']});
    allData.forEach(function(d) {
        d['cost_per_sqft_RANK'] = rank
        rank++
    });

    data=allData;
    usaMap = new Map(allData);
    window.barChart = new BarChart(allData);

    d3.json("us-state-centroid.json", function(json) {
        usaMap.drawMap(json, 'unemployement');
        barChart.updateBarChart('unemployement');
    });
});

function get2022Data() {
    d3.csv("2022_us_states_data.csv", function(error, allData) {
        allData.forEach(function(d) {
            // Convert numeric values to 'numbers'
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        employmentData[index] = new Object();
        employmentData[index].year= 2022;
        employmentData[index].data= new Array();

        populationData[index]= new Object()
        populationData[index].year = 2022
        populationData[index].data= new Array()

        salaryData[index]= new Object()
        salaryData[index].year = 2022
        salaryData[index].data = new Array()

        mortalityData[index]= new Object()
        mortalityData[index].year=2022
        mortalityData[index].data = new Array()

        rentalData[index]= new Object()
        rentalData[index].year=2022
        rentalData[index].data= new Array()

        for(var j=0;j<topStates.length;j++) {
            for (var i = 0; i < allData.length; i++) {
                if(topStates[j]==allData[i]["RegionName"]) {
                    employmentData[index]['data'][j] = allData[i]['Unemployment_rate'];
                    populationData[index]['data'][j] = allData[i]['total_population']
                    salaryData[index]['data'][j] = allData[i]['salary_avg']
                    mortalityData[index]['data'][j] = allData[i]['Mortality_rate']
                    rentalData[index]['data'][j] = allData[i]['cost_per_sqft']
                }
            }
        }
        index++;
        get2021Data()
    });

}

function get2021Data() {

    d3.csv("2021_us_states_data.csv", function(error, allData) {
        allData.forEach(function(d) {
            // Convert numeric values to 'numbers'
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        employmentData[index] = new Object();
        employmentData[index].year= 2021;
        employmentData[index].data= new Array();

        populationData[index]= new Object()
        populationData[index].year = 2021
        populationData[index].data= new Array()

        salaryData[index]= new Object()
        salaryData[index].year = 2021
        salaryData[index].data = new Array()

        mortalityData[index]= new Object()
        mortalityData[index].year=2021
        mortalityData[index].data = new Array()

        rentalData[index]= new Object()
        rentalData[index].year=2021
        rentalData[index].data= new Array()

        for(var j=0;j<topStates.length;j++) {
            for (var i = 0; i < allData.length; i++) {
                if(topStates[j]==allData[i]["RegionName"]) {
                    employmentData[index]['data'][j] = allData[i]['Unemployment_rate'];
                    populationData[index]['data'][j] = allData[i]['total_population']
                    salaryData[index]['data'][j] = allData[i]['salary_avg']
                    mortalityData[index]['data'][j] = allData[i]['Mortality_rate']
                    rentalData[index]['data'][j] = allData[i]['cost_per_sqft']
                }
            }
        }
        index++;
        get2020Data()
    });
}

function get2020Data() {
    d3.csv("2020_us_states_data.csv", function(error, allData) {
        allData.forEach(function(d) {
            // Convert numeric values to 'numbers'
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        employmentData[index] = new Object();
        employmentData[index].year= 2020;
        employmentData[index].data= new Array();

        populationData[index]= new Object()
        populationData[index].year = 2020
        populationData[index].data= new Array()

        salaryData[index]= new Object()
        salaryData[index].year = 2020
        salaryData[index].data = new Array()

        mortalityData[index]= new Object()
        mortalityData[index].year=2020
        mortalityData[index].data = new Array()

        rentalData[index]= new Object()
        rentalData[index].year=2020
        rentalData[index].data= new Array()
        for(var j=0;j<topStates.length;j++) {
            for (var i = 0; i < allData.length; i++) {
                if(topStates[j]==allData[i]["RegionName"]) {
                    employmentData[index]['data'][j] = allData[i]['Unemployment_rate'];
                    populationData[index]['data'][j] = allData[i]['total_population']
                    salaryData[index]['data'][j] = allData[i]['salary_avg']
                    mortalityData[index]['data'][j] = allData[i]['Mortality_rate']
                    rentalData[index]['data'][j] = allData[i]['cost_per_sqft']
                }
            }
        }
        index++;
        get2019Data()
    });

}

function get2019Data() {
    d3.csv("2019_us_states_data.csv", function(error, allData) {
        
        allData.forEach(function(d) {
            
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        employmentData[index] = new Object();
        employmentData[index].year= 2019;
        employmentData[index].data= new Array();

        populationData[index]= new Object()
        populationData[index].year = 2019
        populationData[index].data= new Array()

        salaryData[index]= new Object()
        salaryData[index].year = 2019
        salaryData[index].data = new Array()

        mortalityData[index]= new Object()
        mortalityData[index].year=2019
        mortalityData[index].data = new Array()

        rentalData[index]= new Object()
        rentalData[index].year=2019
        rentalData[index].data= new Array()
        for(var j=0;j<topStates.length;j++) {
            for (var i = 0; i < allData.length; i++) {
                if(topStates[j]==allData[i]["RegionName"]) {
                    employmentData[index]['data'][j] = allData[i]['Unemployment_rate'];
                    populationData[index]['data'][j] = allData[i]['total_population']
                    salaryData[index]['data'][j] = allData[i]['salary_avg']
                    mortalityData[index]['data'][j] = allData[i]['Mortality_rate']
                    rentalData[index]['data'][j] = allData[i]['cost_per_sqft']
                }
            }
        }
        index++;
        
        get2018Data()
    });
}

function get2018Data() {
    d3.csv("2018_us_states_data.csv", function(error, allData) {
        allData.forEach(function(d) {
            // Convert numeric values to 'numbers'
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        employmentData[index] = new Object();
        employmentData[index].year= 2018;
        employmentData[index].data= new Array();

        populationData[index]= new Object()
        populationData[index].year = 2018
        populationData[index].data= new Array()

        salaryData[index]= new Object()
        salaryData[index].year = 2018
        salaryData[index].data = new Array()

        mortalityData[index]= new Object()
        mortalityData[index].year=2018
        mortalityData[index].data = new Array()

        rentalData[index]= new Object()
        rentalData[index].year=2018
        rentalData[index].data= new Array()
        for(var j=0;j<topStates.length;j++) {
            for (var i = 0; i < allData.length; i++) {
                if(topStates[j]==allData[i]["RegionName"]) {
                    employmentData[index]['data'][j] = allData[i]['Unemployment_rate'];
                    populationData[index]['data'][j] = allData[i]['total_population']
                    salaryData[index]['data'][j] = allData[i]['salary_avg']
                    mortalityData[index]['data'][j] = allData[i]['Mortality_rate']
                    rentalData[index]['data'][j] = allData[i]['cost_per_sqft']
                }
            }
        }
        index++;
        get2017Data()
    });

}

function get2017Data() {
    d3.csv("2017_us_states_data.csv", function(error, allData) {
     
        allData.forEach(function(d) {
           
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        employmentData[index] = new Object();
        employmentData[index].year= 2017;
        employmentData[index].data= new Array();

        populationData[index]= new Object()
        populationData[index].year = 2017
        populationData[index].data= new Array()

        salaryData[index]= new Object()
        salaryData[index].year = 2017
        salaryData[index].data = new Array()

        mortalityData[index]= new Object()
        mortalityData[index].year=2017
        mortalityData[index].data = new Array()

        rentalData[index]= new Object()
        rentalData[index].year=2017
        rentalData[index].data= new Array()
        for(var j=0;j<topStates.length;j++) {
            for (var i = 0; i < allData.length; i++) {
                if(topStates[j]==allData[i]["RegionName"]) {
                    employmentData[index]['data'][j] = allData[i]['Unemployment_rate'];
                    populationData[index]['data'][j] = allData[i]['total_population']
                    salaryData[index]['data'][j] = allData[i]['salary_avg']
                    mortalityData[index]['data'][j] = allData[i]['Mortality_rate']
                    rentalData[index]['data'][j] = allData[i]['cost_per_sqft']
                }
            }
        }
        index++;
        
        get2016Data()
    });
}

function get2016Data() {
    d3.csv("2016_us_states_data.csv", function (error, allData) {
        


        allData.forEach(function (d) {
            
            d['total_population'] = +d['total_population'];
            d['Unemployment_rate'] = +d['Unemployment_rate'];
            d['salary_avg'] = +d['salary_avg'];
            d['Mortality_rate'] = +d['Mortality_rate'];
            d['cost_per_sqft'] = +d['cost_per_sqft'];
        });

        employmentData[index] = new Object();
        employmentData[index].year = 2016;
        employmentData[index].data = new Array();

        populationData[index] = new Object()
        populationData[index].year = 2016
        populationData[index].data = new Array()

        salaryData[index] = new Object()
        salaryData[index].year = 2016
        salaryData[index].data = new Array()

        mortalityData[index] = new Object()
        mortalityData[index].year = 2016
        mortalityData[index].data = new Array()

        rentalData[index] = new Object()
        rentalData[index].year = 2016
        rentalData[index].data = new Array()
        for (var j = 0; j < topStates.length; j++) {
            for (var i = 0; i < allData.length; i++) {
                if (topStates[j] == allData[i]["RegionName"]) {
                    employmentData[index]['data'][j] = allData[i]['Unemployment_rate'];
                    populationData[index]['data'][j] = allData[i]['total_population']
                    salaryData[index]['data'][j] = allData[i]['salary_avg']
                    mortalityData[index]['data'][j] = allData[i]['Mortality_rate']
                    rentalData[index]['data'][j] = allData[i]['cost_per_sqft']
                }
            }
        }
        index++;
        console.log(employmentData)
        drawLineChart();
        

    });
}




function updateMap(value) {
    var map = d3.select("#map-view").selectAll("path");
    map.remove().exit();
    d3.select("#bar-chart").selectAll("rect").classed("highlight-class", false)
    document.getElementById('table').innerHTML = '';
    usaMap.updateMap(value)
    barChart.updateBarChart(value)
    clearFields()
    document.getElementById("ShowButton").innerText= "Give my top states"
    document.getElementById("ShowButton").style.backgroundColor='#8b221b'
    document.getElementById("infoPanel").style.display="none"
}

function clearFields() {
    document.getElementById('population').value=''
    document.getElementById('population').innerHTML=''
    document.getElementById('unemployement').value=''
    document.getElementById('unemployement').innerHTML=''
    document.getElementById('mortality').value=''
    document.getElementById('mortality').innerHTML=''
    document.getElementById('salary').value=''
    document.getElementById('salary').innerHTML=''
    document.getElementById('rental').value=''
    document.getElementById('rental').innerHTML=''
    document.getElementById('line-chart').innerHTML = ''
    document.getElementById('legend-line-chart').innerHTML=''
    document.getElementById('brush-section').style.display="none"
}
function getTopStates(){

    document.getElementById("ShowButton").innerText= "Scroll Down to see results";
    document.getElementById("ShowButton").style.backgroundColor="green";
    document.getElementById("infoPanel").style.display="block"
    var unemployement=document.getElementById('unemployement')
    var mortality=document.getElementById('mortality')
    var salary=document.getElementById('salary')
    var rental=document.getElementById('rental')
    var population=document.getElementById('population')
    if(unemployement && mortality && salary && rental && population) {
        if (unemployement.value != '' && mortality.value != '' && salary.value != '' &&
            rental.value != '' && population.value != '') {
            if(checkRange(unemployement.value)&&checkRange(mortality.value)&&checkRange(salary.value)
                &&checkRange(rental.value)&&checkRange(population.value)){

                var statesDataArr= new Array()
                for(i=0;i<data.length;i++){
                    statesDataArr[i]=new Array();
                    statesDataArr[i][0]=data[i]["RegionName"]
                    // data[i]["POPULATION"]=1
                    var calculatedVal= (parseFloat(data[i]["Unemployment_rate_RANK"]*unemployement.value))+
                        parseFloat((data[i]["total_population_RANK"]*population.value))+
                        parseFloat((data[i]["salary_avg_RANK"]*salary.value))+
                        parseFloat((data[i]["cost_per_sqft_RANK"]*rental.value))+
                        parseFloat((data[i]["Mortality_rate_RANK"]*mortality.value))
                    statesDataArr[i][1] = calculatedVal
                    statesDataArr[i][2] = parseFloat(data[i]["Unemployment_rate_RANK"]*unemployement.value)
                    statesDataArr[i][3] = parseFloat((data[i]["total_population_RANK"]*population.value))
                    statesDataArr[i][4] = parseFloat((data[i]["salary_avg_RANK"]*salary.value))
                    statesDataArr[i][5] = parseFloat((data[i]["cost_per_sqft_RANK"]*rental.value))
                    statesDataArr[i][6] = parseFloat((data[i]["Mortality_rate_RANK"]*mortality.value))

                }
                var labels=["Aggregated Sum of Weights","Unemployement Rate","Population","Average Salary/Mon","Price per sq.ft.","Mortality Rate"]
                statesDataArr.sort(function(a, b){return b[1] - a[1]});

                topStates=[statesDataArr[0][0],statesDataArr[1][0],statesDataArr[2][0]]
                var arr_state1=[ statesDataArr[0][1],statesDataArr[0][2],statesDataArr[0][3],statesDataArr[0][4],statesDataArr[0][5]
                    ,statesDataArr[0][6] ]
                var arr_state2=[statesDataArr[1][1],statesDataArr[1][2],statesDataArr[1][3],statesDataArr[1][4],statesDataArr[1][5]
                    ,statesDataArr[1][6]]
                var arr_state3=[statesDataArr[2][1],statesDataArr[2][2],statesDataArr[2][3],statesDataArr[2][4],statesDataArr[2][5]
                    ,statesDataArr[2][6] ]


                document.getElementById("state1").innerHTML="1. "+statesDataArr[0][0]
                document.getElementById("state2").innerHTML="2. "+statesDataArr[1][0]
                document.getElementById("state3").innerHTML="3. "+statesDataArr[2][0]
                usaMap.displayWeights(arr_state1,'weight1',labels)
                usaMap.displayWeights(arr_state2,'weight2',labels)
                usaMap.displayWeights(arr_state3,'weight3',labels)

                usaMap.highlightMap(topStates)

            }
        }
    }
    clearFields()

}

function checkRange(value){
    if(value>=0 && value <= 5){
        return true;
    }else{
        return false;
    }
}

var option
function plotLineChart(parameter){
    option = parameter
    employmentData =[];
    populationData=[];
    mortalityData=[];
    rentalData=[];
    salaryData=[];
    index=0;
    get2016Data()
    document.getElementById('brush-section').style.display="block"
}

function drawLineChart() {
    var unemp_arr = new Array();

    for(var i=0;i<topStates.length;i++){
        unemp_arr[i] = new Array()
        unemp_arr[i].state=topStates[i];
        unemp_arr[i].values = new Array();
        for(var j=0;j<employmentData.length;j++){
            unemp_arr[i]['values'][j]=employmentData[j]['data'][i]
        }
    }

    var pop_arr = new Array();

    for(var i=0;i<topStates.length;i++){
        pop_arr[i] = new Array()
        pop_arr[i].state=topStates[i];
        pop_arr[i].values = new Array();
        for(var j=0;j<populationData.length;j++){
            pop_arr[i]['values'][j]=populationData[j]['data'][i]
        }
    }

    var sal_arr = new Array();

    for(var i=0;i<topStates.length;i++){
        sal_arr[i] = new Array()
        sal_arr[i].state=topStates[i];
        sal_arr[i].values = new Array();
        for(var j=0;j<salaryData.length;j++){
            sal_arr[i]['values'][j]=salaryData[j]['data'][i]
        }
    }

    var rent_arr = new Array();

    for(var i=0;i<topStates.length;i++){
        rent_arr[i] = new Array()
        rent_arr[i].state=topStates[i];
        rent_arr[i].values = new Array();
        for(var j=0;j<rentalData.length;j++){
            rent_arr[i]['values'][j]=rentalData[j]['data'][i]
        }
    }

    var mor_arr = new Array();

    for(var i=0;i<topStates.length;i++){
        mor_arr[i] = new Array()
        mor_arr[i].state=topStates[i];
        mor_arr[i].values = new Array();
        for(var j=0;j<mortalityData.length;j++){
            mor_arr[i]['values'][j]=mortalityData[j]['data'][i]
        }
    }

    var line
    if(option=="unemployement") {
        line = new LineChart(option, unemp_arr);
    }else if(option=="population"){
        line = new LineChart(option, pop_arr);
    }else if(option=="salary"){
        line = new LineChart(option, sal_arr);
    }else if(option=="rental"){
        line = new LineChart(option, rent_arr);
    }else{
        line = new LineChart(option, mor_arr);
    }
    line.update(topStates)
}

function createTableForClickedState(selectedState) {
    var body = document.getElementById("table");
    body.innerHTML = '';

    
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    cell.setAttribute("class", "bold");
    var cellText = document.createTextNode("Parameters");
    cell.appendChild(cellText);
    row.appendChild(cell);

    var cell = document.createElement("td");
    cell.setAttribute("class", "bold");
    var cellText = document.createTextNode(selectedState["RegionName"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    var cell = document.createElement("td");
    cell.setAttribute("class", "bold");
    var cellText = document.createTextNode("National Average");
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    row = document.createElement("tr");
    cell = document.createElement("td");
    cell.setAttribute("class", "bold");

    cellText = document.createTextNode("Rental Price($/sq. ft.)");
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["cost_per_sqft"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["NA cost_per_sqft"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    row = document.createElement("tr");
    cell = document.createElement("td");
    cell.setAttribute("class", "bold");
    cellText = document.createTextNode("Mortality Rate (%)");
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["Mortality_rate"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["NA MORTALITY_RATE"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    row = document.createElement("tr");
    cell = document.createElement("td");
    cell.setAttribute("class", "bold");
    cellText = document.createTextNode("Population");
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["total_population"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["NA POPULATION"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    row = document.createElement("tr");
    cell = document.createElement("td");
    cell.setAttribute("class", "bold");
    cellText = document.createTextNode("Unemployement Rate (%)");

    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["Unemployment_rate"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["NA UNEMPLOYMENT_RATE"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    row = document.createElement("tr");
    cell = document.createElement("td");
    cell.setAttribute("class", "bold");

    cellText = document.createTextNode("Average Salary ($)");
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["salary_avg"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    cell = document.createElement("td");
    cellText = document.createTextNode(selectedState["NA AVERAGE_SALARY/MON"]);
    cell.appendChild(cellText);
    row.appendChild(cell);

    tblBody.appendChild(row);

    tbl.appendChild(tblBody);
    body.appendChild(tbl);
    tbl.setAttribute("border", "2");
    tbl.setAttribute("class", "table-class table")
}

