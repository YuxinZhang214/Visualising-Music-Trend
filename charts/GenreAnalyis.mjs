import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { BaseChart } from './template/BashChart.mjs';

export class GenreAnalysis extends BaseChart {

  constructor(chartId) {
    super(chartId); 
  }

  drawChart(data) {

    const genreMetrics = d3.rollup(data, (v) => ({
      sumStreams: d3.sum(v, (d) => d.streams),
      avgStreams: d3.mean(v, (d) => d.streams),
      trackCount: v.length,
    }), (d) => d.genre);

    const genres = Array.from(genreMetrics.keys());
    const genreData = Array.from(genreMetrics.values());

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

    const x = d3.scaleBand()
                .domain(genres)
                .rangeRound([0, width])
                .padding(0.1);

    const y = d3.scaleLinear()
                .domain([0, d3.max(genreData, (d) => d.sumStreams)])
                .range([height, 0]);

    const z = d3.scaleSqrt()
                .domain([0, d3.max(genreData, (d) => d.trackCount)])
                .range([5, 20]);
  
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
      
    svg.selectAll('.bubble')
      .data(genreData)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('cx', (d, i) => x(genres[i]) + x.bandwidth() / 2)
      .attr('cy', (d) => y(d.sumStreams))
      .attr('r', (d) => z(d.trackCount))
      .style('fill', '#69b3a2')
      .style('opacity', '0.7');

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