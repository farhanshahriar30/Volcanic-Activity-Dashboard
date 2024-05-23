//importing functions to be used later in the file for updating the informaiton presented by the graphs
import { updateTable } from "./table.js";
import { updateHistogram } from "./histograminteract.js";
import { updatePieChart } from "./pieinteract.js";

//initializing the choropleth map which shows the number of volcanoes
export function initchoroplethMap(d3) {
    const width = 960, height = 800;

// creating the projection for the map
const projection = d3.geoMercator()
    .scale(110)
    .translate([width / 2.65, height / 2.4]);

const path = d3.geoPath().projection(projection);

// Creating the SVG element
const svg = d3.select("#maps").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("outline", "1px solid #00a9ff");

//add an svg element to get the zooming 
const gLand = svg.append("g");

//calling the zoom function from d3 to add the zooming interaction to the map
const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (event) => {
        // Applying zoom and pan transformations to the groups
        gLand.attr('transform', event.transform);
    });
svg.call(zoom);

//making the tooltip for hover effects
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load ingthe volcano data and the world GeoJSON concurrently
Promise.all([
    d3.csv("data/volcano.csv"),
    d3.json("data/custom.geo.json")
]).then(function([volcanoData, world]) {
    // Processing the volcano data to count the number of volcanoes per country
    const volcanoCounts = d3.rollup(volcanoData, v => v.length, d => d.country);

    console.log(volcanoCounts)
    // adding the map with countries colored(choropleth) based on the number of volcanoes
    gLand.selectAll(".country")
        .data(world.features)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", function(d) {
            const country = d.properties.name;
            const numVolcanoes = volcanoCounts.get(country) || 0;
            return d3.interpolateBlues(numVolcanoes / 90); //value adjusted after seeing the max number of volcanoes in country(US:99)
        })

        //adding a 3d hover effect for teh country when the mouse hovers over them
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "red")  //red colour to highlight its been hovered over
                .style("stroke-width", 5)  
                .attr("transform", "scale(1.01)");  // Slightly scale up the path to give the 3d effect
            const country = d.properties.name;
            const numVolcanoes = volcanoCounts.get(country) || 'No';
            tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                tooltip.style("display", "inline")
                .html(`${country}: ${numVolcanoes} volcano(es)`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        //removing the hover 3d effect after the moves away
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .style("stroke", "none")  
                .style("stroke-width", 1)  
                .attr("transform", "scale(1)");  // Resetting the scale

            tooltip.style("display", "none");
        })
        //adding click so when a country is clicked the maps(histogram, pie, table) get updated according to the country selected
        .on("click", function(event, d) {
            const selectedCountry = d.properties.name;
            console.log(volcanoData);
            console.log(selectedCountry);
            updateTable(volcanoData, selectedCountry);
            updateHistogram(volcanoData, selectedCountry);
            updatePieChart(volcanoData,selectedCountry);
        });
        // Drawing the legend
        const legendData = [0, 10, 20, 50, 100]; // Example breakpoints for the legend
        const legend = svg.append("g")
            .attr("transform", "translate(" + (width-100) + "," + (height-100 ) + ")");

        legend.selectAll("rect")
            .data(legendData)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 22)
            .attr("width", 20)
            .attr("height", 20)
            .style("fill", d => d3.interpolateBlues(d / 90));

        legend.selectAll("text")
            .data(legendData)
            .enter().append("text")
            .attr("x", 25)
            .text(d => d + '+')
            .attr("y", (d, i) => i * 23 + 13)
            .style("fill", "#FFFFFF") // Explicitly set text color
            .text(d => `${d}+ Volcano(es)`); // Legend text;
});
}