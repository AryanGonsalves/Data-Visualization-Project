function drawOutro() {
    d3.selectAll("svg");

    const svg = d3.select("#visualization-outro");
    svg.selectAll("*").remove();
}

const outro_voteCount = [306, 232];

function outro_animatePoints() {
    const svg = d3.select("#visualization-outro");
    svg.selectAll("*").remove();

    const width = +svg.attr("width");
    const height = +svg.attr("height");

    const bluePoints = d3.range(outro_voteCount[0]).map(() => ({
        group: "blue",
        x: Math.random() * width,
        y: -550,
    }));
    const redPoints = d3.range(outro_voteCount[1]).map(() => ({
        group: "red",
        x: Math.random() * width,
        y: -550,
    }));

    const points = [...bluePoints, ...redPoints];
    // Create a force simulation
    const simulation = d3.forceSimulation(points)
        .force(
            "x",
            d3.forceX(d => {
                if (d.group === "blue") {
                    return (width / 3);
                } else {
                    return (3 * width / 3);
                }
            }).strength(0.1)
        )
        .force("y", d3.forceY(d => 7*(height/4)).strength(0.1))
        .force("collide", d3.forceCollide(11))
        .alphaDecay(0.05);

    // Create circles for the points
    const circles = svg.selectAll(".point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 8)
        .attr("fill", d => (d.group === "blue" ? "blue" : "red"))
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    svg.append("text")
        .attr("x", width/1.5)
        .attr("y", 80)
        .attr("text-anchor", "middle")
        .attr("font-size", "44px")
        .attr("font-weight", "bold")
        .text("2020 Presidential Election Votes by Candidate");

    svg.append("text")
        .attr("x", width/1.5)
        .attr("y", 180)
        .attr("text-anchor", "middle")
        .attr("font-size", "54px")
        .attr("font-weight", "bold")
        .text("Who will you vote for?");


    svg.append("text")
        .attr("x", width / 3)
        .attr("y", 300)
        .attr("text-anchor", "middle")
        .attr("font-size", "40px")
        .text(`Biden: ${outro_voteCount[0]} votes`);

    svg.append("text")
        .attr("x", (3 * width / 3))
        .attr("y", 300)
        .attr("text-anchor", "middle")
        .attr("font-size", "40px")
        .text(`Trump: ${outro_voteCount[1]} votes`);

    simulation.on("tick", () => {
        circles.attr("cx", d => d.x).attr("cy", d => d.y);
    });
    setTimeout(() => simulation.alpha(1).restart(), 100);
}

