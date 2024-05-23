// main.js
// imports all the necessary functions
import { initWorldMap } from './worldMap.js';
import { initTimeline } from './timeline.js';
import { initPieChart } from './pie.js';
import { initHistogram } from './histogram.js';
import { initBubbleChart } from './bubble.js';
import {initBarChart} from './barchart.js';
import { initchoroplethMap } from './choroplethmap.js';
import { initTable } from './table.js';
import { initHistograminteract } from './histograminteract.js';
import { initPieChartInteract } from './pieinteract.js';

document.addEventListener('DOMContentLoaded', () => {
  
  initWorldMap(d3); // Initializes the world map
  initTimeline(d3); // Initializes the timeline
  initPieChart(d3); // Initializes the pie chart
  initHistogram(d3); // Initializes the histogram chart
  initBubbleChart(d3); // Initializes the bubble chart
  initchoroplethMap(d3);// Initializes the choropleth map
  initTable(d3); //Initializes the table
  initHistograminteract(d3); //Initializes the interactive histogram
  initPieChartInteract(d3); //Initializes the interactive pie chart
  initBarChart(d3); //Initializes the duration bar chart
});

// // document.getElementById('checkbox').addEventListener('change', function(event) {
// //   if (event.target.checked) {
// //       document.body.classList.add('light-mode');
// //   } else {
// //       document.body.classList.remove('light-mode');
// //   }
// });
console.log(`D3 loaded, version ${d3.version}`);
