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
  
    const margin = { top: 30, right: 50, bottom: 100, left: 100 };
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

    // Set up the x scale
    const x = d3.scaleBand()
      .range([0, width])
      .domain(sortedTracks.map(d => d[0]))
      .padding(0.2);
    
    svg.append('g')
      .attr('transform', `translate(0,${height-margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style("font-size", "16px")
        .attr('transform', 'translate(-10,0)rotate(-45)')
        .style('text-anchor', 'end');

    svg.append('text')
      .attr('text-anchor', 'end')
      .attr('x', width / 2)
      .attr("y", height + 20)
      .style("fill", 'white')
      .text('Songs');

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, d3.max(sortedTracks, d => d[1])])
      .range([height-margin.bottom, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format(".1s")))
      .style("font-size", "16px")

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", - margin.left + 20)
      .attr("x", - height/2 + 50 )
      .text("Streams")
      .style("fill", 'white')
      .style("font-size", "20px"); 

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
  
    svg.selectAll(".bar")
      .data(sortedTracks)
      .enter().append('rect')
      .attr('x', d => x(d[0])) // Use track name for x position
      .attr('y', d => y(d[1])) // Use stream sum for y position
      .attr('width', x.bandwidth())
      .attr("height", d => height-margin.bottom - y(d[1])) // Use stream sum for height
      .attr('fill', '#4c51bf')
      .on('mouseover', function(event, d) {
        // Scale up the bar
        d3.select(this)
          .transition()
          .duration(200)
          .attr("y", y(d[1]) - 10) // Move bar up by 10px, using the correct data reference
          .attr("height", height - margin.bottom - y(d[1]) + 10) // Increase bar height by 10px, corrected
          .attr('fill', '#ffab00');
      
        // Display detailed information in tooltip
          tooltip.html(`Track: ${d[0]}<br/>Total Streams: ${d[1].toLocaleString()}`) // Using toLocaleString for better number formatting
            .style("visibility", "visible")
            .style("left", `${event.pageX + 10}px`)
            .style("top", `${event.pageY - 10}px`);
      })
      .on('mousemove', function(event) {
        tooltip.style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on('mouseout', function() {
        // Scale down the bar to its original size
        d3.select(this)
          .transition()
          .duration(200)
          .attr('y', d => y(d[1])) // Use stream sum for y position
          .attr("height", d => height-margin.bottom - y(d[1]))
          .attr('fill', '#4c51bf');
      
        // Hide tooltip
        tooltip.style("visibility", "hidden");
      });

    const legend = svg.append("g")
      .attr("transform", `translate(${width - 120},-30)`);

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#4c51bf"); 

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .text("Stream Count") 
      .style("font-size", "14px") 
      .style("fill", 'white');

  }
}