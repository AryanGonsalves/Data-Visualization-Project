/** Class implementing the line chart view. */
class LineChart {
    constructor(option, allData) {
        this.width = 500;
        this.height = 500;
        this.data = allData;
        this.value = option;
        this.colors_arr = ["green", "blue", "red"];
        this.radius = 3.5;

        // Clear existing chart and create SVG element
        document.getElementById('line-chart').innerHTML = '';
        this.svg = d3.select('#line-chart')
            .append('svg')
            .attr('class', 'chart')
            .attr('width', this.width)
            .attr('height', this.height)
            .style('padding-left', '8px');

        this.margin = { top: 30, right: 30, bottom: 30, left: 60 };
    }

    update(topStates) {
        const years_arr = [2016, 2017, 2018, 2019, 2020, 2021, 2022];

        // Define scales
        const xScale = d3.scaleLinear()
            .range([this.margin.left, this.width - this.margin.right])
            .domain([2016, 2022]);

        const data_values = this.data.flatMap(d => d.values);
        const yScale = d3.scaleLinear()
            .range([this.height - this.margin.top, this.margin.bottom])
            .domain([d3.min(data_values), d3.max(data_values)]);

        // Define axes
        const xAxis = d3.axisBottom(xScale).ticks(7);
        const yAxis = d3.axisLeft(yScale).ticks(15);

        this.svg.append("g")
            .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
            .attr("class", "axis")
            .call(xAxis);

        this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},0)`)
            .attr("class", "axis")
            .call(yAxis);

        // Define line generator
        const lineGen = d3.line()
            .x((d, i) => xScale(d.year))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);

        // Plot data for each state
        topStates.forEach((_, index) => {
            this.plotData(index, years_arr, lineGen, xScale, yScale);
        });

        this.drawLegends(topStates);
    }

    tooltip_render(tooltip_data) {
        return `
            <h5>Year: ${tooltip_data.year}</h5>
            <h5>Value: ${tooltip_data.value}</h5>
        `;
    }

    drawLegends(topStates) {
        d3.select('#legend-line-chart').selectAll('svg').remove();

        const legend = d3.select("#legend-line-chart")
            .append("svg")
            .attr("width", 120)
            .attr("height", 80)
            .selectAll("g")
            .data(topStates)
            .enter()
            .append("g")
            .attr("transform", (_, i) => `translate(0, ${i * 20})`);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 3)
            .style("fill", (_, i) => this.colors_arr[i]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 4)
            .attr("dy", ".35em")
            .text((_, i) => topStates[i]);
    }

    plotData(index, years_arr, lineGen, xScale, yScale) {
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip-title")
            .style("opacity", 0);

        const final_data = years_arr.map((year, i) => ({
            year,
            value: this.data[index].values[i],
        }));

        // Add path
        const path = this.svg.append("path")
            .attr("d", lineGen(final_data))
            .attr("stroke", this.colors_arr[index])
            .attr("stroke-width", 2)
            .attr("fill", "none");

        const totalLength = path.node().getTotalLength();

        path
            .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
            .attr("stroke-dashoffset", totalLength)
            .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);

        // Add dots
        const dots = this.svg.selectAll(`.dot-${index}`)
            .data(final_data);

        dots.exit().remove();

        dots.enter()
            .append("circle")
            .merge(dots)
            .attr("class", `dot-${index}`)
            .attr("r", this.radius)
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.value))
            .style("fill", this.colors_arr[index])
            .on("mouseover", (event, d) => {
                d3.select(event.target)
                    .style("fill", "orange")
                    .attr("r", this.radius * 2);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0.9);

                tooltip.html(this.tooltip_render(d))
                    .style("left", `${event.pageX}px`)
                    .style("top", `${event.pageY}px`);
            })
            .on("mouseout", (event) => {
                d3.select(event.target)
                    .style("fill", this.colors_arr[index])
                    .attr("r", this.radius);

                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
            });
    }
}
