# Volcanic-Activity-Dashboard

# Volcanic Activity Dashboard

The Volcanic Activity Dashboard is an interactive web application that visualizes various aspects of global volcanic activity. This dashboard combines multiple data-driven visualizations including a world map of volcanoes, a timeline of eruptions per decade, pie charts, bar charts, histograms, and bubble charts to convey insightful information about volcanic activity, its impact on human populations, and geographical distribution.

## Features

- **Linked Data Visualizations**: Clicking on a country on the world map triggers the histogram and pie chart to update, reflecting the total number of volcanoes within that country and the types of volcanoes present, respectively.
- **World Map Visualization**: A dynamic map showcasing the locations of volcanoes around the globe. Zoom in/out and pan across different regions and hover the volcano icons to explore volcanic features.
- **Timeline Visualization**: Displays eruption frequencies per decade, highlighting temporal trends in volcanic activity.
- **Pie Chart**: Categorizes volcanoes by type, providing insights into the global distribution of various volcanic features.
- **Bar Chart with Slider**: Shows the duration of each volcanic eruption, with an interactive slider to filter the data range.
- **Histogram**: Depicts the number of volcanoes at varying elevation ranges, offering a visual summary of how altitude correlates with volcanic occurrence.
- **Bubble Chart**: Indicates the population density in proximity to volcanoes, allowing for an assessment of potential human impact.
- **Pause/Play Button**: Users can view the animation of timeline of eruptions and pause/play at a particular decade to analyze further.

## Data Source

The data for this dashboard is provided by the Smithsonian's Global Volcanism Program via the R for Data Science Tidy Tuesday project, ensuring high-quality and authoritative information. The dataset's collection methodologies, including the specifics of data gathering, cleaning, and processing steps, are thoroughly documented. For more detailed information about the collection process and data provenance, please refer to the R for Data Science Tidy Tuesday GitHub repository: [Tidy Tuesday Volcano Eruptions Dataset](https://github.com/rfordatascience/tidytuesday).

## Technical Details

The dashboard is built using D3.js version 7, leveraging its powerful data-binding and visualization capabilities. GeoJSON data is used to render the world map, and CSV files contain the volcanic activity records.

## Structure

The dashboard is meticulously structured to ensure modularity, readability, and ease of maintenance. Here's a breakdown of the main components:

### `index.html`
This is the entry point of the dashboard. It defines the overall HTML structure and layout of the dashboard, including div containers for each of the visualizations, and links to the CSS stylesheets and JavaScript scripts.

### `styles/`
This directory houses all the Cascading Style Sheets (CSS) files that are responsible for the styling and visual aesthetics of the dashboard. Each visualization might have its own dedicated stylesheet for specific styling needs, alongside a main stylesheet for global styles such as font family, background colors, and layout configurations.

### `main.css`
The primary stylesheet that includes global styles, defining the look and feel of the dashboard, including background, typography, and layout styles that apply universally.

### `scripts/`
This directory contains all the JavaScript files powered by D3.js that bring the dashboard to life through data binding and dynamic visualization.

- `main.js`: Often serves as the initializer script that might include setup code that's common across all visualizations such as loading datasets, initializing global variables, or shared functions.
- `choroplethmap.js`: Drives the choropleth world map, highlighting volcano density and enabling linked visualizations. Invokes `table.js`, `pieinteract.js`, `histograminteract.js` to update the visualization according to the country selected on the map.
- `table.js`: Generates a dynamic table listing eruptions based on the user's map interaction.
- `pieinteract.js`: Manages interactivity for the pie chart, updating volcano types upon map selection.
- `histograminteract.js`: Controls the histogram update, reflecting volcano elevation data for selected countries.
- `worldMap.js`: Dedicated to creating and managing the world map visualization, including zoom, pan, and tooltip functionalities when volcano is hovered on.
- `timeline.js`: Contains the logic for the timeline visualization, managing the animation, pausing and playing the timeline.
- `pieChart.js`, `barChart.js`, `histogram.js`, `bubbleChart.js`: Scripts for each respective visualization, handling data processing, rendering, and interactivity specific to each chart type.

### `data/`
This directory contains all the data and visual assets used in the project. The data is provided in various formats suitable for different types of visualizations, ranging from geographical maps to statistical charts.

- **GeoJSON files for geographical visualizations**:
  - `custom.geo.json`: Custom GeoJSON file for specific geographic data manipulation or presentation.
- **CSV files for numerical and categorical data**:
  - `filtered_volcano_eruptions.csv`: Filtered dataset containing information on volcanic eruptions.
  - `volcano.csv`: Comprehensive dataset with records of volcanic activities.
- **Images for web visualization headers, icons, and aesthetic elements**:
  - `barchart.png`, `bubble.png`, `eruption.png`, `histogram.png`, `interact.png`, `pie.png`, `worldmap.png`: Visual headers for corresponding chart types.
  - `underline.png`, `underline2.png`, `underline3.png`: Images used for textual emphasis and decoration.
  - `volcanoicon.svg`: Icon representing volcanic activity.
- **Background**:
  - `DashboardPNG.png`: Dashboard background.

### `lib/`
Contains third-party libraries and frameworks used in the project. For this dashboard, it includes D3.js library files, which are essential for creating data-driven visualizations.

- `d3.v7.min.js`: The minified version of D3.js library, version 7, included to leverage its comprehensive visualization capabilities without the need to connect to external CDNs.

## Usage

To interact with the visualizations:

- Hover on each chart to learn more information about volcanoes.
- Click on the countries on the choropleth map to view linked chart visualizations of information about each country's volcanoes.
- Click the pause/play button to control the timeline animation.
- Zoom and pan the map using mouse actions, hover over the volcanic icons for detailed information.
- Use the slider to filter the data on the bar chart to view durations of volcanic eruptions.
