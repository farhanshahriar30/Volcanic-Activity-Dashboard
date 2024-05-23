//table.js for showing the information about the volcanoes
//initialzing the
export function initTable(d3) {

    //loading the dataset
    d3.csv("data/volcano.csv").then(function(volcanoData) {
    const table = d3.select("#volcanoTable").append("table").attr("class", "volcano-table");

    //making the header for the table
    const header = table.append("thead").append("tr");
    header.selectAll("th")
        .data(["Name", "Elevation(m)", "Country", "Last Eruption"])
        .enter().append("th")
        .text(d => d)
        .attr("class", "table-header");  // Class for styling the header to match the entire dashboard

    //making the body of the table
    const body = table.append("tbody");
    const rows = body.selectAll("tr")
        .data(volcanoData)
        .enter().append("tr");
    //adding to the information to the body/rows
    rows.selectAll("td")
        .data(d => [d.volcano_name, d.elevation, d.country, d.last_eruption_year])
        .enter().append("td")
        .text(d => d)
        .attr("class", "table-cell");  // Class for styling the rows
    });
}

//function to update the informatin in the table
export function updateTable(volcanoData, selectedCountry = null) {
    //getting the filtered information based on the country clicked
    const filteredData = selectedCountry ? volcanoData.filter(d => d.country === selectedCountry) : volcanoData;
    console.log(filteredData);
    // Clearing existing table and seting up a new one
    const table = d3.select("#volcanoTable").html("")
        .append("table")
        .attr("class", "volcano-table"); // Assuming you have styles defined for this class

    // Appending header row
    const header = table.append("thead").append("tr");
    header.selectAll("th")
        .data(["Name", "Elevation (m)", "Country", "Last Eruption"])
        .enter().append("th")
        .text(d => d)
        .attr("class", "table-header");

    // Appending data rows
    const body = table.append("tbody");
    const rows = body.selectAll("tr")
        .data(filteredData)
        .enter().append("tr");

    // Appending data cells
    rows.selectAll("td")
        .data(d => [d.volcano_name, d.elevation, d.country, d.last_eruption_year])
        .enter().append("td")
        .text(d => d)
        .attr("class", "table-cell");
}