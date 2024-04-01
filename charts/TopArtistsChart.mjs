import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { BaseChart } from './template/BashChart.mjs';

export class TopArtistsChart extends BaseChart {

  constructor(chartId) {
    super(chartId); 
  }

  drawChart(data) {

    const artistStreams = d3.rollup(data, v => {
      const streamsByArtist = new Map();
      for (const d of v) {
        for (const artist of d.artists) {
          streamsByArtist.set(artist, (streamsByArtist.get(artist) || 0) + d.streams);
        }
      }
      return streamsByArtist;
    }, d => d.trackName); 
    
    const flatArtistStreams = [];
    for (const [trackName, streamsByArtist] of artistStreams) {
      for (const [artist, streams] of streamsByArtist) {
        flatArtistStreams.push({ artist, streams });
      }
    }
    
    const sortedArtists = flatArtistStreams.sort((a, b) => b.streams - a.streams).slice(0, 10);  

    const container = d3.select(`#${this.chartId}`);
    const containerRect = container.node().getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
  
    const margin = { top: 30, right: 50, bottom: 100, left: 100 }; 
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
  
    container.select('svg').remove();
  
    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
  
    // Set up the scales
    const x = d3.scaleBand()
      .domain(sortedArtists.map(d => d.artist)) // Use artist names for domain
      .rangeRound([0, width])
      .padding(0.1);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedArtists, d => d.streams)])
      .range([height, 0]);
  
    // Add the x-axis to the chart
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)"); // Rotate axis labels to prevent overlap
  
    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height + margin.bottom - 5)
      .text("Artists")
      .style("fill", 'white')
      .style("font-size", "16px");
  
    // Add the y-axis to the chart
    svg.append("g")
      .call(d3.axisLeft(y));
  
    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -margin.top)
      .text("Streams")
      .style("fill", 'white')
      .style("font-size", "16px");
  
    // Draw the bars
    svg.selectAll(".bar")
      .data(sortedArtists)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.artist))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.streams))
      .attr("height", d => height - y(d.streams))
      .attr("fill", "#4c51bf");

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