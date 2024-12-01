const width = 960;
        const height = 600;

        // Create SVG
        const svg = d3.select("#visualization-economy")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        const tooltip = d3.select("#tooltip");

        // Projection and Path
        const projection = d3.geoAlbersUsa()
            .translate([width / 2, height / 2])
            .scale(1000);

        const path = d3.geoPath().projection(projection);

        // Color Scale
        const colorScale = d3.scaleQuantize()
            .range(d3.schemeBlues[9]);

        // Load Data
     Promise.all([
            //d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"), // GeoJSON for US states
            d3.csv("data/Economy/unemployment_data.csv"), // Unemployment Data
            d3.csv("data/Economy/inflation_data.csv"), // Inflation Data
            d3.csv("data/Economy/job_placement_data.csv"), // Job Placement Data
            d3.csv("data/Economy/usa_gdp_per_capita.csv") // GDP Data
        ]).then(function (values) {
            unemploymentData = values[0];
            //inflationData = values[1];
            unemploymentData.forEach(function(d) {
                d.fips = parseFIPS(d.FIPS);
                State.forEach(function(state) {
                    d[state] = +d[state];
                }); 
                d.year = parseYear(d.year);
                d.Month = parseMonth(d.Month);
                d.Non_institutional_Population = parseNon_Institutional_Population(d.Non_Institutional_Population);
                d.LaborForce = parseLaborForce(d.LaborForce);
                d.Area_Population= parseArea_Population(d.Area_Population);
                d.TotalEmployment= parseTotalEmployment(d.TotalEmployment);
                d.LaborForce_percent = parseLaborForce_percent(d.LaborForce_percent);
                d.TotalUnemployment = parseTotalUnemployment(d.TotalUnemployment);
                d.Unemployment_rate = parseUnemployment_rate(d.Unemployment_rate);
            });



            // Process data
            //const unemploymentData = {};
            //unemployment.forEach(d => {
              //  unemploymentData[d["State/Area"]] = +d["Unemployment_rate"];
            //});

            inflationData = values[1];
            //inflation.forEach(d => {
              //  inflationData[d["id"]] = +d["inflation_rate"];
            //});
            inflationData.forEach(function(d) {
                d.id = parseId(d.id);
                d.rate = parserate(d.rate);
            });


            gdpData = values[2];
            //gdp.forEach(d => {
              //  gdpData[d["year"]] = +d["gdp per capita"];
            //});
            gdpData.forEach(function(d) {
                d.year = parseyear(d.year);
                d.gdp_per_capita = parsegdp_per_capita(d.gdp_per_capita);

            });

            jobPlacementData = values[3];
            //jobPlacement.forEach(d => {
              //  jobPlacementData[d["college_name"]] = {
                //    placement_rate: d["placement_status"] === "Placed" ? 1 : 0,
                  //  salary: +d["salary"]
                //};
            //});
            jobPlacementData.forEach(function(d) {
                d.id = parseid(d.id);
                Name.forEach(function(d) {
                    d[Name] = +d[Name];


                }); 
                gender.forEach(function(d) {
                    d[gender] = +d[gender];
                });
                degree.forEach(function(d) {
                    d[degree] = +d[degree];
                });
                stream.forEach(function(d) {
                    d[stream] = +d[stream];
                }) 
                college_name.forEach(function(d) {
                    d[college_name] = +d[college_name]
                }) 
                placement_status.forEach(function(d) {
                    d[placement_status] = +d[placement_status];
                }) 
                d.salary = parsesalary(d.salary);
                d.gpa = parsegpa(d.gpa);
                d.years_of_experience = parseyears_of_experience(d.years_of_experience);
            });

            // Merge GeoJSON with Data
            const states = topojson.feature(us, us.objects.states).features;

            states.forEach(state => {
                const stateName = state.properties.name;
                state.properties.unemployment_rate = unemploymentData[stateName] || 0;
                state.properties.inflation_rate = inflationData[stateName] || 0;
            });

            // Draw States
            svg.selectAll(".state")
                .data(states)
                .enter()
                .append("path")
                .attr("class", "state")
                .attr("d", path)
                .style("fill", d => {
                    const rate = d.properties.unemployment_rate;
                    return rate ? colorScale(rate) : "#ccc";
                })
                .on("mouseover", (event, d) => {
                    tooltip.transition().duration(200).style("opacity", 1);
                    tooltip.html(`
                        <strong>${d.properties.name}</strong><br>
                        Unemployment Rate: ${d.properties.unemployment_rate || "N/A"}%<br>
                        Inflation Rate: ${d.properties.inflation_rate || "N/A"}%<br>
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(200).style("opacity", 0);
                });

            // Add Legend
            const legend = svg.append("g")
                .attr("transform", `translate(${width - 200}, ${height - 300})`);

            const legendScale = d3.scaleLinear()
                .domain(d3.extent(Object.values(unemploymentData)))
                .range([0, 200]);

            legend.selectAll("rect")
                .data(colorScale.range().map(d => colorScale.invertExtent(d)))
                .enter()
                .append("rect")
                .attr("x", d => legendScale(d[0]))
                .attr("width", d => legendScale(d[1]) - legendScale(d[0]))
                .attr("height", 10)
                .style("fill", d => colorScale(d[0]));

            legend.append("text")
                .attr("x", 0)
                .attr("y", -10)
                .text("Unemployment Rate");
        }).catch(error => {
            console.error("Error loading data: ", error);
        });
