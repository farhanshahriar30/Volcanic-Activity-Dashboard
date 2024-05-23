export function initBarChart(d3) {
    // Defining margins and dimensions for the bar chart container
    const margin = { top: 20, right: 20, bottom: 0, left: 100 },
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Creating an SVG element and append it to the chart container.
    const svg = d3.select("#bar-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Configuring the x-axis scale
    const x = d3.scaleLinear()
        .range([0, width]);
    // Initializing the x-axis group element
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`);

    // Setting up the y-axis scale with padding between bands
    const y = d3.scaleBand()
        .range([height, 0])
        .padding(.1);
    // Initializing the y-axis group element and add CSS class
    const yAxis = svg.append("g")
        .attr("class", "myYaxis");

    // Adding labels to the axes
    xAxis.append("text")
        .attr("class", "axis-label")
        .attr("y", 40)
        .attr("x", width / 2)
        .attr("text-anchor", "middle")
        .text("Duration in Days");

    yAxis.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Volcanoes");

    // Styling the slider for controlling the number of bars displayed
    d3.select("#duration-slider")
        .style("width", "30%") 
        .style("height", "15px");

    // Loading the data from a CSV file.
    d3.csv("data/filtered_volcano_eruptions.csv").then(function (loadedData) {
        // Calculating the duration of eruptions and filter by a minimum duration.
        const data = loadedData.map(d => {
            const startDate = new Date(+d.start_year, d.start_month - 1, d.start_day);
            const endDate = new Date(+d.end_year, d.end_month - 1, d.end_day);
            // Calculating the duration in days.
            const duration_days = (endDate - startDate) / (24 * 60 * 60 * 1000);
            return {
                ...d,
                duration_days: duration_days
            };
        }).filter(d => d.duration_days >= 2); // Excluding eruptions with durations less than 2 days.

        // Sorting the filtered data by duration in descending order.
        data.sort(function (b, a) {
            return a.duration_days - b.duration_days;
        });

        // Initial call to update the graph with the first 20 eruptions.
        update(data.slice(0, 20));

        // Slider input event that updates the chart based on the selection
        d3.select("#duration-slider")
            .attr("max", data.length - 20)
            .on("input", function (event) {
                // Dynamically updating the chart as the slider is adjusted.
                const index = +event.target.value;
                const numVisibleBars = 20;
                update(data.slice(index, index + numVisibleBars));
            });
    });

    // Creating a tooltip div for displaying data points details
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function update(data) {
        // Configuring the domain of the x-axis based on the maximum duration found in the data
        x.domain([0, d3.max(data, d => d.duration_days)]);
        // Transitionining the x-axis to reflect any changes
        xAxis.transition().duration(1000).call(d3.axisBottom(x));

        // Setting the y-axis domain with the names of the volcanoes
        y.domain(data.map(d => d.volcano_name));
        // Transitioning the y-axis to update its scale based on the new data
        yAxis.transition().duration(1000).call(d3.axisLeft(y));

        // Binding the data to the bar elements
        var bars = svg.selectAll("rect")
            .data(data, function (d) { return d.volcano_name; });

        // Appending new bars for new data entries.
        bars.enter()
            .append("rect")
            .attr("x", x(0))
            .attr("y", d => y(d.volcano_name))
            .attr("height", y.bandwidth())
            .attr("fill", "#31FBFB")
            // Adding stroke conditionally based on the specific value
            .style("stroke", d => d.duration_days === 151753 ? "black" : "none")
            .style("stroke-width", d => d.duration_days === 151753 ? "2px" : "0")
            // Defining interaction behaviors: on mouseover, change bar color and display tooltip
            .on("mouseover", function (event, d) {
                d3.select(this).attr("fill", "#6495ED"); // Color change on hover
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(
                    "Volcano: " + d.volcano_name + "<br/>" +
                    "Country: " + d.country + "<br/>" +
                    "Start Date: " + d.start_year + "-" + d.start_month + "-" + d.start_day + "<br/>" +
                    "End Date: " + d.end_year + "-" + d.end_month + "-" + d.end_day + "<br/>" +
                    "Duration: " + Math.round(d.duration_days) + " days"
                )
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            // On mouseout, reverts bar color and hide tooltip
            .on("mouseout", function (d) {
                d3.select(this).attr("fill", "#ADD8E6"); // Revert color on mouse out
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            // Animating the entrance of new bars from left to right
            .transition().duration(1000)
            .attr("width", d => x(d.duration_days));

        // Update the properties of existing bars to match new data
        bars.transition().duration(1000)
            .attr("y", d => y(d.volcano_name))
            .attr("width", d => x(d.duration_days))
            .attr("height", y.bandwidth())
            .attr("fill", "#31FBFB")
            .style("stroke", d => d.duration_days === 151753 ? "black" : "none")
            .style("stroke-width", d => d.duration_days === 151753 ? "2px" : "0");

        // Remove bars not present in data
        bars.exit().transition().duration(1000)
            .attr("width", 0)
            .remove();
    }

    // Event listener to update the chart when the slider is moved.
    d3.select("#duration-slider").on("input", function (event) {
        const index = +event.target.value;
        const numVisibleBars = 20;

        const slicedData = data.slice(index, index + numVisibleBars);
        update(slicedData);
    });
}
