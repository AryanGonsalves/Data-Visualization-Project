/** Class implementing the bar chart view. */
class BarChart {

    constructor(allData) {
        this.width = 600;
        this.height = 800;
        this.data = allData

        //Create SVG element and append map to the SVG
        this.svg = d3.select('#bar-chart')
            .append('svg')
            .attr('class', 'chart')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('style', 'padding-left: 8px;')
    }

    /**
     * Render and update the bar chart based on the selection of the data type in the drop-down box
     */
    updateBarChart(selectedDimension) {

        var value = this.getCSVPropertyName(selectedDimension)
        //sorted data
        this.data.sort(function(a, b) {
            return b[value] - a[value]
        });

        var yMax = d3.max(this.data, function(d) {
            return d[value]
        });
        var yMin = d3.min(this.data, function(d) {
            return d[value]
        });
        // Create colorScale

        var color = "rgb(217,91,67)"
        var colorScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

        var chart = this.svg.selectAll("rect")
            .data(this.data);

        chart.exit().attr("opacity", 0.5)
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            .remove();

        chart = chart.enter().append("rect")
            .merge(chart);

        chart.transition()
            .duration(2000)
            .attr("x", 100)
            .attr("id", function(d) {
                return d["RegionName"]
            })
            .attr("width", function(d) {
                if (selectedDimension == 'unemployement' || selectedDimension == 'mortality') {
                    return d[value] * 35
                } else if (selectedDimension == 'population') {
                    return d[value] / 90000
                } else if (selectedDimension == 'salary') {
                    return d[value] / 250
                } else if (selectedDimension == 'price') {
                    return d[value] * 110
                }
            })
            .attr("y", function(d, i) {
                return (i * 15) + 10;
            })
            .attr("height", 15)
            .attr("fill", function(d) {
                return colorScale(d[value])
            })

        chart.on("click", function(d) {
            createTableForClickedState(d)
        });



        var national_avg;
        if (selectedDimension == 'unemployement' || selectedDimension == 'mortality') {
            national_avg = parseFloat(national_avg_val * 35) + 100;
        } else if (selectedDimension == 'population') {
            national_avg = parseFloat(national_avg_val / 90000) + 100;
        } else if (selectedDimension == 'salary') {
            national_avg = parseFloat(national_avg_val / 250) + 100;
        } else if (selectedDimension == 'price') {
            national_avg = parseFloat(national_avg_val * 110) + 100;
        }

        this.svg.append("rect")
            .style("fill", '#000000')
            .style("stroke-dasharray", ("1, 5"))
            .attr('class', 'avg')
            .transition()
            .duration(2000)
            .attr("x", national_avg)
            .attr("y", 5)
            .attr("width", 1)
            .attr("height", this.height - 20)

        d3.select('#nationalAvgLegend').selectAll('svg').remove();

        var legend = d3.select("#nationalAvgLegend").append("svg")
            .attr("class", "legend")
            .attr("width", 200)
            .attr("height", 30)
            .selectAll("g")
            .data('b')
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 20 + ")";
            });

        legend.append("rect")
            .style("stroke-dasharray", ("1, 5"))
            .attr("width", 18)
            .attr("height", 3)
            .style("fill", '#000000');

        var national_avg_val
        if (selectedDimension == 'unemployement' || selectedDimension == 'mortality') {
            national_avg_val = this.data[0]['NA ' + value] + '%'
        } else if (selectedDimension == 'population') {
            national_avg_val = this.data[0]['NA ' + value]
        } else if (selectedDimension == 'salary') {
            national_avg_val = '$' + this.data[0]['NA ' + value]
        } else if (selectedDimension == 'price') {
            national_avg_val = '$' + this.data[0]['NA ' + value] + '/sq. feet'
        }

        
        legend.append("text")
            .attr("x", 24)
            .attr("y", 4)
            .attr("dy", ".35em")
            .text("National Average: " + national_avg_val);

        var score = this.svg.selectAll("text.score")
            .data(this.data)

        var newScores = score
            .enter()
            .append("text");

        score.exit().attr("opacity", 1)
            .transition()
            .duration(2000)
            .attr("opacity", 0).remove();
        score = newScores.merge(score);

        score
            .transition()
            .duration(2000)
            .attr("x", function(d) {
                if (selectedDimension == 'unemployement' || selectedDimension == 'mortality') {
                    return (d[value] * 35) + 100
                } else if (selectedDimension == 'population') {
                    return (d[value] / 90000) + 155
                } else if (selectedDimension == 'salary') {
                    return (d[value] / 250) + 100
                } else if (selectedDimension == 'price') {
                    return (d[value] * 110) + 100
                }
            })
            .attr("y", function(d, i) {
                return (i * 15) + 17;
            })
            .attr("dx", -5)
            .attr("dy", ".36em")
            .attr("text-anchor", "end")
            .attr('class', 'score')
            .text(function(d) {
                return d[value]
            });



        var states = this.svg.selectAll("text.name")
            .data(this.data)

        var updated_states = states
            .enter()
            .append("text");

        states.exit().attr("opacity", 1)
            .transition()
            .duration(2000)
            .attr("opacity", 0).remove();
        states = updated_states.merge(states);

        states
            .transition()
            .duration(2000)
            .attr("x", 0)
            .attr("y", function(d, i) {
                return (i * 15) + 17;
            })
            .attr('class', 'name')
            .attr("dy", ".36em")
            .text(function(d) {
                return d['RegionName']
            });
    }

    highlightState(stateName) {
        d3.select("#bar-chart").selectAll("rect").classed("highlight-class", false)
        var element = d3.select("#" + stateName)
        element.classed("highlight-class", true)
        console.log(stateName)
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
}