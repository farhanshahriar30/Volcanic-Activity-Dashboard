// bubble.js
export function initBubbleChart(d3) {
    // -----------------------Bubble chart---------------------
    //------------- no of volcanos vs elevation range ---------
    //for the entire world

    //filtering passed on a dropdown menu based on the kilometer radius
    const populationSelect = d3.select("#populationSelect");
    console.log(populationSelect)
    // Loading the dataset
    d3.csv("data/volcano.csv", d => {
        return {
        elevation: +d.elevation,
        population_within_5_km: +d.population_within_5_km,
        population_within_10_km: +d.population_within_10_km,
        population_within_30_km: +d.population_within_30_km,
        population_within_100_km: +d.population_within_100_km
        };
    }).then(data => {
        //creating the dimensions for the svg
        const margin = {top: 50, right: 40, bottom: 60, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
        //making teh svg
        const svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

        
        //definig updatechart so that it can update based on the selection of the user
        function updateChart(populationKey) {
        
            // Appending Y-axis label
        svg.append("text")
        .attr("class", "y label")
        .attr("y", -55)
        .attr("x", 0 - (height/2) -75 )
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("fill", "white")
        .text("Number of Volcanoes");

        // Appending X-axis label
        svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", height+45)
        .style("fill", "white")
        .text("Elevation Range (km)");
        

        //generating the elevation ranges
        const elevationRanges = d3.range(-3000, 8000, 1000); 
        //binning teh data on basis of the ranges
        let binnedData = d3.bin()
        .value(d => d.elevation)
        .thresholds(elevationRanges)(data)
        .map(bin => ({
            elevationRange: `${bin.x0} to ${bin.x1}`,
            numVolcanoes: bin.length,
            sumPopulation: d3.sum(bin, d => +d[populationKey])
        }));

    //x axis
    const xScale = d3.scaleBand()
    .domain(binnedData.map(d => d.elevationRange))
    .rangeRound([0, width])
    .padding(0.1);

    //y axis
    const yScale = d3.scaleLinear()
    .domain([0, d3.max(binnedData, d => d.numVolcanoes)])
    .range([height, 0]);

    const populationScale = d3.scaleSqrt()
    .domain([0, d3.max(binnedData, d => d.sumPopulation)])
    .range([2, 40]); 
        
    //making tooltip for hovering effect
    const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    //hover effect on the bubbles by expanding
    const hoverScale = d3.scaleSqrt()
    .domain(populationScale.domain())
    .range([populationScale.range()[0] + 5, populationScale.range()[1] + 10]);

    //adding the hover and graph elements
    svg.selectAll(".bubble")
    .data(binnedData)
    .enter().append("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.elevationRange) + xScale.bandwidth() / 2)
    .attr("cy", d => yScale(d.numVolcanoes))
    .attr("r", d => populationScale(d.sumPopulation))
    .style("fill", "#31FBFB")
    .style("fill-opacity", 0.9)
    .style("stroke", "#151373")
    .style("stroke-width", 2)
    //hover effect when over the object
    .on("mouseover", function (event, d) {
        d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d => hoverScale(d.sumPopulation));

        tooltip.transition()
        .duration(200)
        .style("opacity", 1);
        tooltip.html(`Elevation Range: ${d.elevationRange}<br>No Of Volcanos: ${d.numVolcanoes}<br>Population: ${d.sumPopulation}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 15) + "px");
    })
    //unhover effect after the mouse has moved
    .on("mouseout", function (d) {
    
        d3.select(this)
        .transition()
        .duration(200)
        .attr("r", d => populationScale(d.sumPopulation));

        tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    //addded svg elements to give the labels to the graph
    //x axis
    svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

    //y axis
    svg.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale));
    }


    // Initial chart
    updateChart("population_within_5_km");

    // Update the chart when dropdown changes
    populationSelect.on("change", function(event) {
    //const svg = d3.select("#chart").select("svg");
    svg.selectAll("*").remove();
    updateChart(event.target.value);})
    });
  }
