import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { BaseChart } from './template/BashChart.mjs';

export class TopTracksChart extends BaseChart {

  constructor(chartId) {
    super(chartId); 
  }

  drawChart(data) {

    const trackStreams = d3.rollup(data, v => d3.sum(v, d => d.streams), d => d.name);
    const sortedTracks = Array.from(trackStreams).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const container = d3.select(`#${this.chartId}`);
    const containerRect = container.node().getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
  
    const margin = { top: 30, right: 100, bottom: 100, left: 80 };
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
    const x = d3.scaleBand()
      .range([0, width])
      .domain(sortedTracks.map(d => d[0]))
      .padding(0.2);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2 + margin.left)
      .attr('y', height + margin.top + 20)
      .text('Songs');

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedTracks, d => d[1])])
      .range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format(".1s")));
  
    svg.selectAll(".bar")
      .data(sortedTracks)
      .enter().append('rect')
      .attr('x', d => x(d[0])) // Use track name for x position
      .attr('y', d => y(d[1])) // Use stream sum for y position
      .attr('width', x.bandwidth())
      .attr("height", d => height - y(d[1])) // Use stream sum for height
      .attr('fill', '#4c51bf'); 

    const legend = svg.append("g")
    .attr("transform", `translate(${width - 100},-30)`);

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