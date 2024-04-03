import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { BaseChart } from './template/BashChart.mjs';

export class GenreAnalysis extends BaseChart {

  constructor(chartId) {
    super(chartId); 
  }

  drawChart(data) {
    
    let genreAccumulation = new Map();

    data.forEach(d => {
      d.genres.forEach(genre => {
        let genreData = genreAccumulation.get(genre) || { totalStreams: 0, artistSet: new Set() };
        genreData.totalStreams += d.streams;
        d.artists.forEach(artist => genreData.artistSet.add(artist));
        genreAccumulation.set(genre, genreData);
      });
    });
    
   let genreData = Array.from(genreAccumulation, ([genre, { totalStreams, artistSet }]) => ({
      genre,
      totalStreams,
      artistCount: artistSet.size
    }));
  
    let top10 = genreData.sort((a, b) => b.totalStreams - a.totalStreams).slice(0, 30);
    let reversed_top10 = top10.sort((a, b) => a.totalStreams - b.totalStreams).slice(0, 30);

    const container = d3.select(`#${this.chartId}`);
    const containerRect = container.node().getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height*0.75;
  
    const margin = { top: 30, right: 150, bottom: 50, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    container.select('svg').remove();

    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("pointer-events", "none") 
      .style("background", "white")
      .style("border", "1px solid #000")
      .style("padding", "5px")
      .style("text-align", "left")
      .style("display", "none")
      .style("color", 'black')

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .range([0, width])
      .domain([0, d3.max(top10, d => d.artistCount)*1.1])

    svg.append("g")
      .attr("transform", `translate(${0},${height-20})`)
      .call(d3.axisBottom(x))
      .style("font-size", "16px");

    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 20)
      .text("Number of artists")
      .style("fill", 'white')
      .style("font-size", "24px")

    const y = d3.scaleLinear()
      .domain([0, d3.max(top10, d => d.totalStreams)*1.2])
      .range([height-20, 0]);
  
    // Add the y-axis to the chart
    svg.append("g")
      .attr("transform", `translate(${0},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".2s")))
      .style("font-size", "16px");

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", - height/2 + 50 )
      .text("Streams")
      .style("fill", 'white')
      .style("font-size", "24px"); 
    
    const z = d3.scaleSqrt()
      .domain([0, d3.max(top10, d => d.artistCount)])
      .range([5, 40]);

    const dashArray = "2, 5";

    // Draw dashed lines for each y tick
    svg.selectAll("line.y")
      .data(y.ticks(10).slice(0, -1)) // Adjust the number of ticks if necessary
      .enter().append("line")
      .attr("class", "y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .style("stroke", "#ccc")
      .style("stroke-dasharray", dashArray)
      .style("shape-rendering", "crispEdges");
    
    // For x-axis dashed lines
    svg.selectAll("line.x")
      .data(x.ticks().slice(0, -1)) // Use the updated x scale's internal tick generator
      .enter().append("line")
      .attr("class", "x")
      .attr("y1", y(0)) // Updated to use the y scale to place at the bottom of the chart
      .attr("y2", y(d3.max(top10, d => d.totalStreams)*1.2)) // The top of the chart
      .attr("x1", d => x(d))
      .attr("x2", d => x(d))
      .style("stroke", "#ddd")
      .style("stroke-dasharray", dashArray)
      .style("shape-rendering", "crispEdges");
    
    // Dashed line at the top
    svg.append("line")
      .attr("class", "top-dashed-line")
      .attr("x1", 0)
      .attr("y1", y(d3.max(top10, d => d.totalStreams)*1.2)) // Top of y-axis scale
      .attr("x2", width)
      .attr("y2", y(d3.max(top10, d => d.totalStreams)*1.2)) // Consistent with y1
      .style("stroke", "#ddd")
      .style("stroke-dasharray", dashArray)
      .style("shape-rendering", "crispEdges");
    
    // Dashed line at the right
    svg.append("line")
      .attr("class", "right-dashed-line")
      .attr("x1", x(d3.max(top10, d => d.artistCount)*1.1)) // Right of x-axis scale
      .attr("y1", 0)
      .attr("x2", x(d3.max(top10, d => d.artistCount)*1.1)) // Consistent with x1
      .attr("y2", height)
      .style("stroke", "#ddd")
      .style("stroke-dasharray", dashArray)
      .style("shape-rendering", "crispEdges");
      
    const bubbles = svg.selectAll('.bubble')
      .data(reversed_top10)
      .enter().append('circle')
        .attr('class', 'bubble')
        .attr('cx', d => x(d.artistCount))
        .attr('cy', d => y(d.totalStreams))
        .attr('r', d => z(d.artistCount))
        .style('fill', '#4c51bf')
        .style('opacity', '0.7');
  
    // Define mouseover event
    bubbles.on('mouseover', (event, d) => {

      // Scale up the bubble
      d3.select(event.target).transition()
        .duration(200)
        .attr('r', z(d.artistCount) * 1.5)
        .style('fill', '#ffab00')

      tooltip.html(`Genre: ${d.genre}<br/>Total Streams: ${d.totalStreams.toLocaleString()}<br/>Artist Count: ${d.artistCount}`)
        .style("left", (event.pageX + 10) + "px") 
        .style("top", (event.pageY - 10) + "px") 
        .style("display", "block")        
        .transition()
        .duration(200)
        .style("opacity", 1);
    });
  
    // Define mouseout event
    bubbles.on('mouseout', (event, d) => {
      // Scale down the bubble  
      d3.select(event.target).transition()
        .duration(200)
        .attr('r', z(d.artistCount))
        .style('fill', '#4c51bf');
  
      // Hide tooltip
      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
        .end()
        .then(() => tooltip.style("display", "none")); 
    });
  }  
}