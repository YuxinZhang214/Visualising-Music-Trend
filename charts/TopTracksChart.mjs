import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { BaseChart } from './template/BashChart.mjs';

export class TopTracksChart extends BaseChart {

  constructor(chartId) {
    super(chartId); 
  }

  drawChart(data) {

    const trackStreams = d3.rollup(data, v => d3.sum(v, d => d.streams), d => d.track_name);
    const sortedTracks = Array.from(trackStreams).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const container = d3.select(`#${this.chartId}`);
    const containerRect = container.node().getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
  
    const margin = { top: 30, right: 50, bottom: 50, left: 50 };
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
    const x = d3.scaleLinear()
    .domain([0, d3.max(sortedTracks, d => d[1])])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(sortedTracks.map(d => d[0]))
    .rangeRound([0, height])
    .paddingInner(0.1);
  
    // Add the x-axis to the chart
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top)
      .text("Date")
      .style("fill", 'white')
      .style("font-size", "20px")
  
    // Add the y-axis to the chart
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top - height/2 )
      .text("Streams")
      .style("fill", 'white')
      .style("font-size", "20px"); 

    const barWidth = Math.max((width - margin.left - margin.right) / data.length - 1, 1);

    console.log(barWidth, data.length)
  
    // Draw the bars for the bar chart
    svg.selectAll(".bar")
      .data(sortedTracks)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', 0)
      .attr('y', d => y(d[0]))
      .attr('width', d => x(d[1]))
      .attr('height', y.bandwidth())
      .attr('fill', '#4c51bf');

    const legend = svg.append("g")
     .attr("transform", `translate(${width - 100},${20})`);

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#4c51bf"); 

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .text("Label") // TODO: Replace with actual label
      .style("font-size", "14px") // Adjust font size as needed
      .style("fill", 'white');

  }
}