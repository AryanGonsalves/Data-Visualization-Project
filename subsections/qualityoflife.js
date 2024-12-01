export function drawQualityOfLife() {
    d3.selectAll("svg");

    const svg = d3.select("#visualization-quality-of-life");
    svg.selectAll("*").remove(); 

    const width = svg.attr("width");
    const height = svg.attr("height");

    svg.append("text")
        .attr("x", width / 2) 
        .attr("y", height / 2) 
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .text("Welcome to Quality of Life!")
        .attr("font-size", "24px")
        .attr("fill", "steelblue");
}
