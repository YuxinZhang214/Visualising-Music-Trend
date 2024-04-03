import * as d3 from 'https://cdn.skypack.dev/d3@7';
import { BaseChart } from './template/BashChart.mjs';

export class DailyTrendChart extends BaseChart{

  constructor(chartId) {
    super(chartId); 
  }

  drawChart(data) {

    const aggregatedData = Array.from(d3.rollup(data, 
      v => d3.sum(v, d => d.streams), 
      d => d.date
    )).map(([date, streams]) => ({ date, streams }));

    const container = d3.select(`#${this.chartId}`);
    const containerRect = container.node().getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height*0.9;
  
    const margin = { top: 30, right: 100, bottom: 50, left: 100 };
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
    const dateExtent = d3.extent(aggregatedData, d => d.date);

    // Extend the maximum date by a certain number of days, e.g., 10 days
    const maxDateExtended = d3.timeDay.offset(dateExtent[1], 10); // Adjust the 10 to however many days you want to add
    
    // Now, use these dates to set your domain
    const x = d3.scaleTime()
          .domain([dateExtent[0], maxDateExtended]) // Use the extended maximum date
          .range([0, width]);
  
    // Set up the y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(aggregatedData, d => d.streams)*1.1]) // Use the max value of streams as the domain
      .range([height - margin.bottom, margin.top]);
  
    // Add the x-axis to the chart
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .style("font-size", "16px")

    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2)
      .attr("y", height + margin.top)
      .text("Day")
      .style("fill", 'white')
      .style("font-size", "20px")
  
    // Add the y-axis to the chart
    svg.append("g")
      .attr("transform", `translate(${0},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".1s")))
      .style("font-size", "16px")

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", - height/2 + 50 )
      .text("Streams")
      .style("fill", 'white')
      .style("font-size", "20px"); 

    svg.append("line")
      .attr("class", "top-border")
      .attr("x1", x.range()[0])
      .attr("y1", y.range()[1])
      .attr("x2", x.range()[1])
      .attr("y2", y.range()[1])
      .style("stroke", 'white')
      .style("opacity", 0.3);

    svg.append("line")
      .attr("class", "right-border")
      .attr("x1", x.range()[1])
      .attr("y1", y.range()[1])
      .attr("x2", x.range()[1])
      .attr("y2", y.range()[0])
      .style("stroke", 'white')
      .style("opacity", 0.3);

    const barWidth = Math.max((width - margin.left - margin.right) / aggregatedData.length - 1, 1);
  
    // Draw the bars for the bar chart
    svg.selectAll(".bar")
      .data(aggregatedData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.streams))
      .attr("width", barWidth)
      .attr("height", d => height - margin.bottom - y(d.streams))
      .attr("fill",  "#4c51bf")
      .transition() // Apply transition
      .duration(800) // Set duration for the animation
      .delay((d, i) => i * 50)
      .on('mouseover', function(event, d) {
        const formattedDate = d3.timeFormat("%B %d, %Y")(d.date); // Format the date
        tooltip.html(`Day: ${formattedDate}<br/>Streams: ${d.streams.toLocaleString()}`) // Show both day and streams
            .style("visibility", "visible")
            .style("top", (event.pageY-10) + "px")
            .style("left", (event.pageX+10) + "px");
        d3.select(this)
            .attr('fill', '#ffab00');
      })
      .on('mousemove', function(event) {
        tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
      })
      .on('mouseout', function(event, d) {
        tooltip.style("visibility", "hidden");
        d3.select(this)
          .attr('fill', '#4c51bf'); 
      })

     const legend = svg.append("g")
      .attr("transform", `translate(${width - 200},${-20})`);

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "#4c51bf"); // Example color

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("text-anchor", "start")
      .text("Total Stream of the day") // Replace with actual label
      .style("font-size", "14px") // Adjust font size as needed
      .style("fill", 'white');
  }
}