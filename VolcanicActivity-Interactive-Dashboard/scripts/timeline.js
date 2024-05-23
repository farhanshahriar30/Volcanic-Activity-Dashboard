export function initTimeline(d3) {
    // Setting up the dimensions and margins for our SVG container.
    const margin = { top: 20, right: 20, bottom: 30, left: 50 },
        width = 960 - margin.left - margin.right, // Calculates the width after accounting for margins.
        height = 500 - margin.top - margin.bottom; // Calculates the height after accounting for margins.
 
    // Creates an SVG element in the #eruption-timeline-container div and set its dimensions.
    const svg = d3.select("#eruption-timeline-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right) // Full width including margins.
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`); // Offset the SVG group by the left and top margins.

    // Prepares a tooltip for displaying info when hovering over circles. Starts it off as invisible.
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0) // Initially transparent.
        .style("position", "absolute") // Positioning it absolutely to follow the cursor.
        .style("background", "#fff") // White background for readability.
        .style("border", "1px solid #000") // Solid border to make it stand out.
        .style("padding", "5px"); // Some padding for aesthetics.
 
    // Fetch and process the data from a CSV file.
    d3.csv('data/filtered_volcano_eruptions.csv').then(data => {
        // Filtering data for eruptions starting from the year 1600 and converting start years to numbers.
        let filteredData = data.filter(d => d.start_year >= 1600).map(d => {
            d.start_year = +d.start_year;
            return d;
        });
        // Groups data by decade and count the number of eruptions in each decade.
        let eruptionCountsByDecade = d3.rollups(filteredData,
            v => v.length, // Counts the number of items in each group.
            d => Math.floor(d.start_year / 10) * 10 // Groups by decade.
        ).map(([decade, count]) => ({ decade, count })) // Convert the rollup output to a nicer format.
            .sort((a, b) => a.decade - b.decade); // Sorts by decade.

        // Defining the x scale as time scale, covering the range of decades in the data.
        const x = d3.scaleTime()
            .domain([new Date(d3.min(eruptionCountsByDecade, d => d.decade), 0, 1), d3.max(eruptionCountsByDecade, d => new Date(d.decade, 0, 1))])
            .range([0, width]); // Maps these dates to our SVG width.

        // Defining the y scale as a linear scale, covering the range of eruption counts.
        const y = d3.scaleLinear()
            .domain([0, d3.max(eruptionCountsByDecade, d => d.count)])
            .range([height, 0]); // Inverts so higher values are at the top.

        // Adding the x-axis to the SVG, positioned at the bottom.
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`) // Position it at the bottom.
            .call(d3.axisBottom(x).ticks(d3.timeYear.every(10))) // Use year ticks, every 10 years.
            .selectAll("text")
            .style("fill", "white"); // Style the text to be white for visibility.

        // Adding y-axis to the SVG, positioned on the left.
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y)) // Uses the y scale for ticks.
            .selectAll("text")
            .style("fill", "white"); // Styles the text to be white for visibility.

        // Define a line generator using the x and y scales.
        const lineGenerator = d3.line()
            .x(d => x(new Date(d.decade, 0, 1))) // Positions horizontally based on the decade.
            .y(d => y(d.count)) // Positions vertically based on the eruption count.
            .curve(d3.curveMonotoneX); // Uses a curve to smooth the line.

        // Defining an area generator similar to the line but filling down to the x-axis.
        const areaGenerator = d3.area()
            .x(d => x(new Date(d.decade, 0, 1))) // Horizontal position like the line.
            .y0(height) // Starts filling from the bottom of the SVG.
            .y1(d => y(d.count)) // Fills up to the eruption count.
            .curve(d3.curveMonotoneX); // Uses a curve to smooth the area edge.
 
        let isPlaying = true; // Flag to track whether the animation is playing.
        let currentDecade = 1610; // Starts the animation from the decade after 1600.
 
        // Function to update the chart based on the current decade. It redraws the line, area, and circles.
        function updateChart() {
            let startDecade = Math.max(1600, currentDecade - 90); // Don't go earlier than 1600.
            // Gets visible data based on current decade.
            let visibleData = eruptionCountsByDecade.filter(d => d.decade >= startDecade && d.decade <= currentDecade); 
 
            // Updates the x domain to reflect the current time window.
            x.domain([new Date(startDecade, 0, 1), new Date(currentDecade, 0, 1)]);
            // Updates the x-axis with smooth transition.
            svg.select(".x-axis").transition().duration(700).call(d3.axisBottom(x).ticks(d3.timeYear.every(10)));
 
            /// Updates the line path to reflect new data.
            svg.selectAll(".line-path")
                .data([visibleData]) // Bind the visible data.
                .join("path")
                .attr("class", "line-path")
                .transition().duration(700) // Smooth transition to new position.
                .attr("d", lineGenerator); // Updates the line path.

            // Updates the area path similarly to the line path.
            svg.selectAll(".area-path")
                .data([visibleData])
                .join("path")
                .attr("class", "area-path")
                .transition().duration(700) // Smooth transition to new position.
                .attr("d", areaGenerator); // Update the area path.
 
            // Updates circles to reflect new data.
            svg.selectAll("circle").data(visibleData, d => d.decade) // Using decade as key for data join.
                .join(
                    enter => enter.append("circle") // For new data points, create new circles.
                        .attr("cx", d => x(new Date(d.decade, 0, 1))) // Setting initial positions.
                        .attr("cy", d => y(d.count))
                        .attr("r", 5)  // Fixed radius for circles.
                        .attr("fill", "#189BCC"), // Color of circles.
                    update => update.transition().duration(700) // For existing points, smoothly transition to new positions.
                        .attr("cx", d => x(new Date(d.decade, 0, 1)))
                        .attr("cy", d => y(d.count)),
                    exit => exit.remove() // Remove circles for data points that are no longer visible.
                );
        }
 
        // Appends Play/Pause button to control the animation.
        d3.select("#eruption-timeline-container").append("button")
            .attr("id", "play-pause-button")
            .text("Pause") // Initial text is "Pause" because the animation starts automatically.
            .on("click", function () {
                isPlaying = !isPlaying; // Toggle play state.
                d3.select(this).text(isPlaying ? "Pause" : "Play");  // Updates button text based on play state.
                if (isPlaying) {
                    // If resuming play, restart the interval to update the chart.
                    interval = setInterval(() => {
                        currentDecade += 10; // Moves to the next decade.
                        if (currentDecade > 2020) currentDecade = 1600; // Loops back to the start if we reach the present.
                        updateChart(); // Updating the chart for the new decade.
                    }, 1000); // Updates every second.
                } else {
                    clearInterval(interval); // If pausing, clear the interval to stop updates.
                }
            });
 
        // Start the animation loop.
        let interval = setInterval(() => {
            currentDecade += 10; // Increment the decade.
            if (currentDecade > 2020) currentDecade = 1600; // Looping back to the start if we reach the present.
            updateChart();
        }, 1000);
    });
}
