/** Class implementing the map view. */
class Map {
    /**
     * Creates a Map Object
     */
    constructor(allData) {
        //Width and height of map
        this.width = 760;
        this.height = 500;
        this.data = allData;
        this.colors_arr=["olive","orange","yellow","red","magenta","pink"];
        this.factor_arr = ["Overall Score","Unemployment Rate","Population","Average Salary","Rental Cost","Mortality Rate"]


        //Create SVG element and append map to the SVG
        this.svg = d3.select("#map-view")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

    }

    updateMap(option) {

        var value = this.getCSVPropertyName(option)
        var col = "rgb(217,91,67)"
        var yMin = d3.min(this.data, function(d) {
            return d[value];
        })
        var yMax = d3.max(this.data, function(d) {
            return d[value];
        })

        var color = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([d3.rgb(col).brighter(), d3.rgb(col).darker()]);

        //adding tooltip
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-title")
            .style("opacity", 0);

        for (var i = 0; i < this.data.length; i++) {

            // Grab State Name
            var dataState = this.data[i].RegionName;

            // Grab data value
            var dataValue = this.data[i][value];

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < this.statesJson.features.length; j++) {
                var jsonState = this.statesJson.features[j].properties.name;

                if (dataState == jsonState) {

                    // Copy the data value into the JSON
                    this.statesJson.features[j].properties[value] = dataValue;

                    // Stop looking through the JSON
                    break;
                }
            }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        var self = this;
        this.svg.selectAll("path")
            .data(this.statesJson.features)
            .enter()
            .append("path")
            .attr("id",function(d){
                var stateName = d.properties.name.replace(/\s/g, '');
                return "id_"+stateName
            })
            .attr("d", this.path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function(d) {

                // Get data value
                var val = d.properties[value];

                if (val) {
                    return color(val);
                } else {
                    return "rgb(213,222,217)";
                }
            })
            .on("click", function(d) {

                for (i = 0; i < self.data.length; i++) {
                    if (self.data[i]['RegionName'].toLowerCase() === d.properties["name"].toLowerCase()) {
                        var stateData = self.data[i]
                        createTableForClickedState(stateData)
                    }
                }

            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .on("mouseover", function(d) {

                for (i = 0; i < self.data.length; i++) {
                    if (self.data[i]['RegionName'].toLowerCase() === d.properties["name"].toLowerCase()) {
                        var stateData = self.data[i]
                        var tooltip_data = {
                            "state": stateData["RegionName"],
                            "price": stateData["cost_per_sqft"],
                            "population": stateData["total_population"],
                            "unemployement": stateData["Unemployment_rate"],
                            "salary": stateData["salary_avg"],
                            "mortality": stateData["Mortality_rate"]
                        }
                        var body = self.tooltip_render(tooltip_data)
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(
                            body
                        )
                        tooltip.style("left", (d3.event.pageX) + "px")
                        tooltip.style("top", (d3.event.pageY) + "px");
                        window.barChart.highlightState(self.data[i]['RegionName'])
                    }
                }
            })



        var labels = this.svg.append('g').attr('class', 'labels');
        var path = this.path
        labels.selectAll('.label').data(this.statesJson.features).enter().append('text')
            .attr("class", "label")
            .attr("x", function(d) {
                return path.centroid(d)[0];
            })
            .attr("y", function(d) {
                return path.centroid(d)[1];
            })
            .style('text-anchor', 'middle')
            .text(function(d) {
                return d.properties.name
            })


    }

    /**
     * Renders the actual map
     * @param the json data with the shape of all countries
     */
    drawMap(json, value) {

        this.statesJson = json;
        // D3 Projection
        this.projection = d3.geoAlbersUsa()
            .translate([this.width / 2, this.height / 2]) // translate to center of screen
            .scale([1000]); // scale things down so see entire US

        // Define path generator
        this.path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
            .projection(this.projection); // tell path generator to use albersUsa projection
        this.updateMap(value)
    }

    getCSVPropertyName(value) {
        if (value == 'unemployement') {
            return 'Unemployment_rate'
        }
        if (value == 'salary') {
            return 'salary_avg'
        }
        if (value == 'population') {
            return 'total_population'
        }
        if (value == 'price') {
            return 'cost_per_sqft'
        }
        if (value == 'mortality') {
            return 'Mortality_rate'
        }

    }

    tooltip_render(tooltip_data) {

        var text = "<h5>" + tooltip_data.state + "</h5>";
        text += "<ul>"
        text += "<li> <strong>Population:</strong> " + tooltip_data.population + "</li>"
        text += "<li> <strong>Rental Cost ($/sq. ft.) :</strong> " + tooltip_data.price + "</li>"
        text += "<li> <strong>Mortality Rate (%) : </strong> " + tooltip_data.mortality + "</li>"
        text += "<li> <strong>Average Salary ($) :</strong> " + tooltip_data.salary + "</li>"
        text += "<li> <strong>Unemployement Rate (%) :</strong> " + tooltip_data.unemployement + "</li>"
        text += "</ul>";

        return text;
    }

    highlightMap(arr){
        for(var j=0;j<this.data.length;j++){
            var stateName = this.data[j].RegionName.replace(/\s/g, '');
            var element = d3.select("#id_" + stateName)
            element.classed("highlight-class", false)
        }
        for(i=0;i<arr.length;i++) {
            var stateName = arr[i].replace(/\s/g, '');
           // d3.select("#map-view").classed("highlight-class", false)
            var element = d3.select("#id_" + stateName)
            element.classed("highlight-class", true)
            console.log(arr[i])
        }
    }

    displayWeights(val,obj,labels){
        var self=this;
        var element = d3.select("#"+obj)
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-title")
            .style("opacity", 0);
        var i =0
        for(i=0;i<val.length;i++){
            val[i]=val[i]/4
        }
        var chart = element.selectAll("rect")
            .data(val);

        var col = "rgb(217,91,67)"
        var yMin = d3.min(this.data, function(d) {
            return val[1];
        })
        var yMax = d3.max(this.data, function(d) {
            return val[val.length-1];
        })

        var color = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([d3.rgb(col).brighter(), d3.rgb(col).darker()]);

        chart.exit().attr("opacity", 0.5)
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();

        chart = chart.enter().append("rect")
            .merge(chart);

        chart.transition()
            .duration(2000)
            .attr("x", function (d,i) {

                if(i==0){
                    return 5;
                }else{
                    var v=5
                    for( var j=0;j<i;j++){
                        v= v+ val[j]
                    }
                    return v
                }

            })
            .attr("width", function(d,i){
                    return d;
            })
            .attr("y", 5)
            .attr("height", 15)
            .attr("fill", function(d,i) {
                return self.colors_arr[i]
            })
        element.selectAll("rect").on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            })
            .on("mouseover", function(d,i) {
                var tooltip_data = {
                    "label": labels[i],
                }
               // var body = self.tooltip_render(tooltip_data)
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<h5>" + tooltip_data.label + "</h5>")
                tooltip.style("left", (d3.event.pageX) + "px")
                tooltip.style("top", (d3.event.pageY) + "px");
            })


        var legend = d3.select("#bar-legends-all").append("svg")
            .attr("width", 100)
            .attr("height", 150)
            .selectAll("g")
            .data(self.factor_arr)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .style("stroke-dasharray", ("1, 5"))
            .attr("width", 18)
            .attr("height", 3)
            .style("fill", function(d,i){
                return self.colors_arr[i]
            });


        legend.append("text")
            .attr("x", 24)
            .attr("y", 4)
            .attr("dy", ".35em")
            .text(function (d,i) {
                return self.factor_arr[i]
            });

    }
}
