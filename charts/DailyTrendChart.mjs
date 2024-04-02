import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { BaseChart } from './template/BashChart.mjs';

export class DailyTrendChart extends BaseChart{

  constructor(chartId) {
    super(chartId); 
  }

  drawChart(data) {

    const container = d3.select(`#${this.chartId}`);
    const containerRect = container.node().getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
  
    const margin = { top: 30, right: 100, bottom: 50, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    container.select('svg').remove();

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set up the x scale
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date)) // Use the extent of the date data as the domain
      .range([0, width]);
  
    // Set up the y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.streams)]) // Use the max value of streams as the domain
      .range([height - margin.bottom, margin.top]);
  
    // Add the x-axis to the chart
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2)
      .attr("y", height + margin.top)
      .text("Date")
      .style("fill", 'white')
      .style("font-size", "20px")
  
    // Add the y-axis to the chart
    svg.append("g")
      .attr("transform", `translate(${0},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".1s")));

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", - height/2 + 50 )
      .text("Streams")
      .style("fill", 'white')
      .style("font-size", "20px"); 

    const barWidth = Math.max((width - margin.left - margin.right) / data.length - 1, 1);

    console.log(barWidth, data.length)
  
    // Draw the bars for the bar chart
    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.streams))
      .attr("width", barWidth)
      .attr("height", d => height - margin.bottom - y(d.streams))
      .attr("fill",  "#4c51bf")
      .on("click", d => {
        // window.location.href = `/song-details-page?date=${d.date.toISOString()}&country=${encodeURIComponent(d.country_fullname)}`;
    })

     // Legend (example for one legend item)
     const legend = svg.append("g")
     .attr("transform", `translate(${width - 100},${20})`); // Adjust position as needed

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#4c51bf"); // Example color

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .text("Label") // Replace with actual label
      .style("font-size", "14px") // Adjust font size as needed
      .style("fill", 'white');

  }
}