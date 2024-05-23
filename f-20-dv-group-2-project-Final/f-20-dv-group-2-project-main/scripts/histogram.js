// histogram.js
export function initHistogram(d3) {
    // -----------------------histogram------------------------
    //------------- no of volcanos vs elevation range ---------
    //----------world wide------------
    //loading the dataset
    d3.csv("data/volcano.csv").then(function(data) {
        
        data.forEach(function(d) {
        d.elevation = +d.elevation; 
        });

    //making the ranges for binning
    const elevationRanges = d3.range(-3000, 7000, 1000);

    //making the thresholded binned data
    let binnedData = d3.bin()
        .value(d => d.elevation)
        .thresholds(elevationRanges)(data);


    // binnedData = binnedData.filter(bin => bin.length > 0);

    // const histWidth = 400;
    // const histHeight = 400;

    //creating the svg for the histogram
    const histWidth = 400;
    const histHeight = 400;
    const histMargin = { top: 10, right: 30, bottom: 40, left: 50 };

    const svgHistogram = d3.select("#histogram").append("svg")
    .attr("width", histWidth + histMargin.left + histMargin.right)
    .attr("height", histHeight + histMargin.top + histMargin.bottom)
    .append("g")
    // .style("outline", "1px solid white")
    .attr("transform", `translate(${histMargin.left},${histMargin.top})`);

    //width of graph
    const x = d3.scaleLinear()
    .domain([d3.min(binnedData, d => d.x0), d3.max(binnedData, d => d.x1)]) 
    .range([0, histWidth]);

    //height of the graph
    const y = d3.scaleLinear()
    .domain([0, d3.max(binnedData, d => d.length)])
    .range([histHeight, 0]);

    //making tooltip for hovering effect
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    //hover information definition
    function getTooltipText(d) {
    return `Elevation Range: ${d.x0} to ${d.x1}<br>Number of Volcanoes: ${d.length}`;
    }

    //adding elements of hover and the graphs elements
    svgHistogram.selectAll("rect")
    .data(binnedData)
    .enter()
    .append("rect")
    .attr("x", d => x(d.x0) + 1)
    .attr("y", d => y(d.length))
    .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1)) 
    .attr("height", d => Math.max(0, histHeight - y(d.length))) 
    .style("fill", "#31FBFB")
    .style("stroke", "#151373")
    .style("stroke-width", 2)

    //hover effect when over the object
    .on("mouseover", (event, d) => {
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        tooltip.html(getTooltipText(d))
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");

        d3.select(this)
        .transition()
        .duration(200)
        .attr("y", y(d.length) - 10)
        .attr("height", histHeight - y(d.length) + 10); 
    })

    //unhover effect after the mouse has moved
    .on("mouseout", () => {
        tooltip.transition()
        .duration(500)
        .style("opacity", 0);

        d3.select(this)
        .transition()
        .duration(200)
        .attr("y", y(d.length))
        .attr("height", histHeight - y(d.length));
    });
    //addded svg elements to give the labels to the graph
    //x axis
    svgHistogram.append("g")
    .attr("transform", `translate(0,${histHeight})`)
    .call(d3.axisBottom(x));

    //y axis
    svgHistogram.append("g")
    .call(d3.axisLeft(y));

      //text fot the x axis
    svgHistogram.append("text")
    .attr("transform", `translate(${histWidth / 2}, ${histHeight + histMargin.top + 25})`) 
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text("Elevation (km)");

    //text for the y axis
    svgHistogram.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - histMargin.left)
    .attr("x", 0 - (histHeight / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("fill", "white")
    .text("No Of Volcanos");

    }).catch(function(error){
        console.log(error);
    });
  }
