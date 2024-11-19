function drawEconomy() {
    d3.selectAll("svg");

    const svg = d3.select("#visualization-economy");
    svg.selectAll("*").remove(); 

    const width = svg.attr("width");
    const height = svg.attr("height");

    const margin = {top: 20, right: 30, bottom: 40, left: 50};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform",`translate(${margin.left}, ${margin.top})`);
    promise.all([
        d3.csv("path_to_job_placement.csv"),
        d3.csv("path_to_unemployment.csv"),
        d3.csv("path_to_gdp_per_capita.csv"),
        d3.csv("path_to_wages_by_education.csv")
    ]).then(function([jobPlacementData, unemploymentData, gdpData, wagesData]) {
        gdpData.forEach(d => d.year = +d.year);
        unemploymentData.forEach(d => d.year = +d.year);
        wagesData,forEach(d => d.year = +d.year);

        const mergedData = gdpData.map(gdpRow => {
            const year = gdpRow.year;
            const unemploymentRow = unemploymentData.find(d => d.year === year) || {};
            const wagesRow = wagesData.find(d => d.year === year) || {};
            return { ...gdpRow, ...unemploymentRow, ...wagesRow };
        });

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d=>d.year))
            .range([0, innerWidth]);

        const y = d3.scaleLinear()
            .domain([0,d3.max(data, d => d.gdp_per_capita)]).nice()
            .range([innerHeight, 0]);

        const y2 = d3.scalelinear()
            .domain([0, d3.max(data, d => d.unemployment_rate)]).nice()
            .range([innerHeight, 0]);

        g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).tickFormat(d3.format("d")));

        g.append("g")
            .call(d3.axisLeft(y))
            .attr("text")
            .attr("fill","black ")
            .attr("transform","rotate(-90)")
            .attr("y", -margin.left + 15)
            .attr("x", -innerHeight / 2)
            .attr("text-anchor", "middle")
            .attr("dy", "-1.5em")
            .text("GDP per Capita");

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.gdp_per_capita));

        g.append("path")
            .datum(mergedData)
            .attr("fill", "none")
            .attr("Stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);

        const barWidth = innerWidth / data.length * 0.8;

        g.selectAll(".bar")
            .data(mergedData)
         .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.year) - 5)
            .attr("y", d => y2(+d["Percent (%) of Labor Force Unemployed in State/Area"]))
            .attr("width", 10)
            .attr("height", d => innerHeight - y2(d.unemployment_rate))
            .attr("fill", "orange")
            .attr("opacity", 0.6);

    }).catch(error => console.error(error));


    svg.append("text")
        .attr("x", width / 2) 
        .attr("y", height / 2) 
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text("Welcome to Economy!")
        .attr("font-size", "24px")
        .attr("fill", "steelblue");
}
