function drawIntro() {
    d3.selectAll("svg").style("display", "none");

    const svg = d3.select("#visualization-intro").style("display", "block");
    svg.selectAll("*").remove(); 

    const width = svg.attr("width");
    const height = svg.attr("height");

    svg.append("text")
        .attr("x", width / 2) 
        .attr("y", height / 2) 
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text("Welcome to the Story!")
        .attr("font-size", "24px")
        .attr("fill", "steelblue");
}
