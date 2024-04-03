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
  
    const margin = { top: 30, right: 100, bottom: 100, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
   
    container.select('svg').remove();

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "1px solid #000")
      .style("padding", "5px")
      .style("color", "black");
  
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
      .padding(0.2);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedArtists, d => d.streams)])
      .range([height-margin.bottom, 0]);
  
    // Add the x-axis to the chart
    svg.append("g")
      .attr("transform", `translate(0,${height-margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "16px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)"); // Rotate axis labels to prevent overlap
  
    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width/2)
      .attr("y", height + 30)
      .text("Artists")
      .style("fill", 'white')
      .style("font-size", "20px");
  
    // Add the y-axis to the chart
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
      .style("font-size", "16px")

    const yAxisDashedLines = svg.append("g")
      .selectAll("line")
      .data(y.ticks()) // Use the y scale's internal tick generator to create lines at each tick
      .enter().append("line")
      .attr("class", "y-dashed-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .style("stroke", "#ccc") // Use a lighter color for dashed lines
      .style("stroke-dasharray", "3,3") // Dashed pattern: 3px stroke, 3px space
      .style("opacity", 0.7); // Slightly transparent dashed lines for a sub
  
    // Draw the bars
    svg.selectAll(".bar")
      .data(sortedArtists)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.artist))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.streams))
      .attr("height", d => height-margin.bottom - y(d.streams))
      .attr("fill", "#4c51bf")
      .on('mouseover', function(event, d) {
          
        // Scale up the bar
        d3.select(this)
        .transition()
        .duration(200)
        .attr("y", y(d.streams) - 10) // Move bar up by 10px
        .attr("height", d => height - margin.bottom - y(d.streams) + 10) // Increase bar height by 10px
        .attr('fill', '#ffab00');
      
        // Display detailed information in tooltip
        tooltip.html(`Artist: ${d.artist}<br/>Total Streams: ${d.streams.toLocaleString()}`)
          .style("visibility", "visible")
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on('mousemove', function(event) {
        tooltip.style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on('mouseout', function(event, d) {
        // Scale down the bar to its original size
        d3.select(this)
        .transition()
        .duration(200)
        .attr("y", d => y(d.streams))
        .attr("height", d => height - margin.bottom - y(d.streams))
        .attr('fill', '#4c51bf');
      
        // Hide tooltip
        tooltip.style("visibility", "hidden");
      })
      .on('click', (event, d) => {
        // Construct a URL for the artist's Wikipedia page
        console.log(d.artist)
        const url = `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(d.artist)}`;
        // Open the URL in a new tab
        window.open(url, '_blank');
      });

     // Legend (example for one legend item)
    const legend = svg.append("g")
     .attr("transform", `translate(${width - 120},${-30})`); // Adjust position as needed

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#4c51bf"); // Example color

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .text("Stream Count") 
      .style("font-size", "14px") // Adjust font size as needed
      .style("fill", 'white');

   
  }
}