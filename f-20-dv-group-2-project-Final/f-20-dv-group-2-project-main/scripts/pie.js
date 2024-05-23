// Define a function to initialize a pie chart 
export function initPieChart(d3) {
    // Define the dimensions of the chart
    const width = 500;
    const height = 500;
    const margin = 40;// Margin around the pie chart
    // Calculating the radius of the pie chart
    const radius = Math.min(width, height) / 2 - margin;
    // Creating an SVG element within the element and set its dimensions
    const svg = d3.select("#pie-chart")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g") // Append a group element to make it centeriod
            .attr("transform", `translate(${width / 2}, ${height / 2})`);
    // Loading data from a CSV file
    d3.csv("data/volcano.csv").then(function(data) {
        // Aggregate the data by primary volcano type
        let typeDetails = d3.rollups(data, 
            (v) => {
                // Aggregate data by country within each volcano type
                const countries = d3.rollup(v, vv => vv.length, d => d.country);
                // Finding the country with the highest count of volcanoes in each type
                const topCountryEntry = [...countries.entries()].reduce((a, b) => a[1] > b[1] ? a : b);
                const topCountry = topCountryEntry[0];
                // Finding an example volcano in the top country for each type
                const exampleVolcano = v.find(d => d.country === topCountry); 
                return {
                    count: v.length, // Total count of volcanoes 
                    population: d3.sum(v, d => +d.population_within_5_km),// Sum of population for 5kn
                    topCountry: topCountry,// Country name with the most volcanoes 
                    exampleVolcanoName: exampleVolcano ? exampleVolcano.volcano_name : 'N/A'
                };
            }, 
            d => d.primary_volcano_type);
        // Mapping into a format suitable for the pie chart
        let pieData = typeDetails.map(([type, details]) => ({
            type: type, 
            count: details.count, 
            population: details.population,
            topCountry: details.topCountry,
            exampleVolcanoName: details.exampleVolcanoName
        }));
        // Defining a color scale
        const color = d3.scaleSequential()
            .domain([pieData.length - 1, 0]) 
            .interpolator(d3.interpolateBlues);
        // Creating a pie layout
        const pie = d3.pie()
            .value(function(d) { return d.count; });
        // Computing the pie slices
        const data_ready = pie(pieData);
        // Defining the arc generator for the pie slices
        const arcGenerator = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius);
        // Defining the arc generator for hovered slices
        const arcHover = d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius + 20);
        // Initialize a tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        // creating the pie slices and its hovering
        svg.selectAll('path') // binding path
            .data(data_ready) // Initializing tha sliding data
            .enter()
            .append('path') // adding to the binded path
                .attr('d', arcGenerator)// Set the shape of the slice
                .attr('fill', function(d, i) { return color(i); }) // filling color the slice
                .attr("stroke", "black")//setting the color to back borde
                .style("stroke-width", "0.5px")// setting border thickness
                .style("opacity", 0.7) // setting border shades colors
                .on('mouseover', function(event, d) { // Adding interactivity for mouseover
                    // while hovering display the tooltip with details
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('d', arcHover)
                        .style("opacity", 1)
                        .style("stroke-width", "2px");
                    // Update and show the tooltip with the slice's data by keeping all the above information
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
                .on('mouseout', function() { // Adding interactivity for mouseout
                    // while not hovering or On mouseout hide the tooltip element
                    d3.select(this)
                        .transition()
                        .duration(300)
                        .attr('d', arcGenerator)
                        .style("opacity", 0.7)
                        .style("stroke-width", "0.5px");
                    tooltip.style("opacity", 0);
                });

      
    }).catch(function(error){
        // logging any error during the data loading process
        console.log(error);
    });
}
