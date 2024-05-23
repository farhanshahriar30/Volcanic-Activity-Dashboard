//piechart initialization for world volcanoes types information
// interactive with the choropleth map
export function initPieChartInteract(d3) {
    //creating the svg for the histogram
    const width = 300;
    const height = 300;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;
    const svg = d3.select("#pie-chart-interact")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

    //loading the dataset
    d3.csv("data/volcano.csv").then(function(data) {
        //filtering the data and getting the neccessary information
        let typeDetails = d3.rollups(data, 
            (v) => {
                const countries = d3.rollup(v, vv => vv.length, d => d.country);
                const topCountryEntry = [...countries.entries()].reduce((a, b) => a[1] > b[1] ? a : b);
                const topCountry = topCountryEntry[0];
                const exampleVolcano = v.find(d => d.country === topCountry); 
                return {
                    count: v.length, 
                    population: d3.sum(v, d => +d.population_within_5_km),
                    topCountry: topCountry, 
                    exampleVolcanoName: exampleVolcano ? exampleVolcano.volcano_name : 'N/A'
                };
            }, 
            d => d.primary_volcano_type);

        // assigning/storing all the information
        let pieData = typeDetails.map(([type, details]) => ({
            type: type, 
            count: details.count, 
            population: details.population,
            topCountry: details.topCountry,
            exampleVolcanoName: details.exampleVolcanoName
        }));

        //creating the color scheme for the pie sectors
        const color = d3.scaleSequential()
            .domain([pieData.length - 1, 0]) 
            .interpolator(d3.interpolateBlues);

        //creating the pie cahrt
        const pie = d3.pie()
            .value(function(d) { return d.count; });

        const data_ready = pie(pieData);

        //generating pie
        const arcGenerator = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius);

        //generating the hover effect radius
        const arcHover = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius + 20);

        //creating a tooltip for the hover effect
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        //adding elements of hover and the graphs elements
        svg.selectAll('path')
            .data(data_ready)
            .enter()
            .append('path')
                .attr('d', arcGenerator)
                .attr('fill', function(d, i) { return color(i); }) 
                .attr("stroke", "black")
                .style("stroke-width", "0.5px")
                .style("opacity", 0.7)
                //hover effect when over the object
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('d', arcHover)
                        .style("opacity", 1)
                        .style("stroke-width", "2px");
                    //the data/information shown when hovering
                    tooltip.html(`<strong>Type:</strong> ${d.data.type}<br>
                                  <strong>Count:</strong> ${d.data.count}<br>
                                  <strong>Population within 5km:</strong> ${d.data.population.toLocaleString()}<br>
                                  <strong>Top Country:</strong> ${d.data.topCountry}<br>
                                  <strong>Example Volcano:</strong> ${d.data.exampleVolcanoName}`)
                        .style("opacity", 1)
                        .style("position", "absolute")
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY + 10) + "px")
                        .style("background-color", "black")
                        // .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "5px")
                        .style("padding", "5px");
                })
                //unhover effect after the mouse has moved
                .on('mouseout', function() {
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('d', arcGenerator)
                        .style("opacity", 0.7)
                        .style("stroke-width", "0.5px");
                    tooltip.style("opacity", 0);
                });

      
    }).catch(function(error){
        console.log(error);
    });
}




//function to update the informatin in the pie chat based on the country clicked
export function updatePieChart(volcanoData, selectedCountry) {
    //getting the filtered information based on the country
    const filteredData = volcanoData.filter(d => d.country === selectedCountry);

    // Recalculating the pie data based on the filtered dataset
    const typeDetails = d3.rollups(filteredData, 
        v => ({ count: v.length }), 
        d => d.primary_volcano_type);

    //saving the neccessary data
    const pieData = typeDetails.map(([type, details]) => ({
        type: type, 
        count: details.count
    }));

    //generating pie chart
    const pie = d3.pie()
        .value(d => d.count);

    const data_ready = pie(pieData);

    const svg = d3.select("#pie-chart-interact g");
    const radius = Math.min(300, 300) / 2 - 20;
    
    const arcGenerator = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius);

    const color = d3.scaleSequential()
        .domain([pieData.length - 1, 0]) 
        .interpolator(d3.interpolateBlues);

    // Select all existing pie segments and bind them to the new data
    const paths = svg.selectAll('path')
        .data(data_ready);

    // Removing old svg segments
    paths.exit().remove();

    //generating the hover effect radius
    const arcHover = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius + 20);

    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    // Adding svg new segments
    paths.enter().append('path')
        .merge(paths)  // Merging enter selection with update selection
        .attr('d', arcGenerator)
        .attr('fill', (d, i) => color(i))
        .attr("stroke", "black")
        .style("stroke-width", "0.5px")
        .style("opacity", 0.7)
        //hover effect when over the object
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(300)
                .attr('d', arcHover)
                .style("opacity", 1)
                .style("stroke-width", "2px");

            //the data/information shown when hovering
            tooltip.html(`<strong>Type:</strong> ${d.data.type}<br>
                          <strong>Count:</strong> ${d.data.count}`)
                .style("opacity", 1)
                .style("position", "absolute")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px")
                .style("background-color", "black")
                // .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px");
        })
        //unhover effect after the mouse has moved
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(300)
                .attr('d', arcGenerator)
                .style("opacity", 0.7)
                .style("stroke-width", "0.5px");
            tooltip.style("opacity", 0);
        });
}
