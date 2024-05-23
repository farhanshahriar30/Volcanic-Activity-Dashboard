export function initWorldMap(d3) {
    // Setting the dimensions for the map.
    const width = 960, height = 600;
    // Defining the map projection and center it within the given dimensions.
    const projection = d3.geoMercator()
        .scale(110)
        .translate([width / 2, height / 2]);
    // Creating a path generator based on the projection.
    const path = d3.geoPath().projection(projection);
    // Selects the SVG element for the map and set its dimensions and a border.
    const svg = d3.select("#world-map")
        .attr("width", width)
        .attr("height", height)
        .style("outline", "1px solid #00a9ff");

    // Gradient definitions for volcano symbols.
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", "volcano-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

    // Gradient color from soft light red to deeper dark red.
    gradient.append("stop")
    .attr("offset", "50%")
  .attr("stop-color", "#ff3333"); 

    gradient.append("stop")
    .attr("offset", "100%")
  .attr("stop-color", "#b20000"); 

    // Groups to separate landmass and volcanoes for easier zoom and pan handling.
    const gLand = svg.append("g");
    const gVolcanoes = svg.append("g");
    // Zoom functionality setup.
    const zoom = d3.zoom()
        .scaleExtent([1, 8]) // Limiting zoom level.
        .on('zoom', (event) => {
            // Applying zoom and pan transformations to the volcanoes and lands.
            gLand.attr('transform', event.transform);
            gVolcanoes.attr('transform', event.transform);
        });
    // Enabling zooming on the SVG element.
    svg.call(zoom);
    // Tooltip setup for showing information on hover.
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Loads and displays the world map.
    d3.json('data/custom.geo.json').then(worldData => {
        gLand.selectAll("path")
            .data(worldData.features) // Binding each country's data.
            .enter()
            .append("path") 
            .attr("d", path) // Generates path data based on geoJSON
            .attr("fill", "#189BCC"); // Fill color for land.
    }).catch(error => {
        console.error("Error loading the GeoJSON data: ", error);
    });

    // Loads and displays volcanoes.
    d3.csv('data/volcano.csv').then(volcanoData => {
        d3.xml('data/volcanoicon.svg').then((xml) => {
            // Extracts the path data for the volcano icon
            const svgNode = xml.documentElement.querySelector("path");
            const volcanoPath = svgNode.getAttribute("d");

            volcanoData.forEach(d => {
                d.latitude = +d.latitude;
                d.longitude = +d.longitude;
            });

            // Add volcano icons to the map
            gVolcanoes.selectAll(".volcano")
                .data(volcanoData)
                .enter()
                .append("path")
                .attr("class", "volcano")
                .attr("d", volcanoPath) // Use the volcano icon path.
                .attr("transform", d => {
                     // Positions each volcano icon based on its coordinates.
                    const [x, y] = projection([d.longitude - 4 , d.latitude+5]);
                    return `translate(${x},${y}) scale(0.05)`; // Adjust scale for appropriate icon size
                })
                .attr("fill", "url(#volcano-gradient)") // Using the defined gradient for color.
                .attr("stroke", "#333") // Stroke color for better visibility.
                .attr("stroke-width", 4) // Stroke width
                // Showing tooltip with volcano information on hover.
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(
                        "Volcano: " + d.volcano_name + "<br/>" +
                        "Country: " + d.country + "<br/>" +
                        "Region: " + d.region + "<br/>" +
                        "Elevation: " + d.elevation + " m<br/>" +
                        "Last Eruption: " + d.last_eruption_year
                    )
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                // Hiding tooltip when not hovering.
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }).catch(error => {
            console.error("Error loading the volcano icon SVG: ", error);
        });
    });
}
