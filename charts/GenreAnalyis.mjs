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
  
    let top10 = genreData.sort((a, b) => b.totalStreams - a.totalStreams).slice(0, 10);
    let reversed_top10 = top10.sort((a, b) => a.totalStreams - b.totalStreams).slice(0, 10);

    const container = d3.select(`#${this.chartId}`);
    const containerRect = container.node().getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
  
    const margin = { top: 30, right: 100, bottom: 50, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const tooltip = d3.select("#tooltip");

    container.select('svg').remove();

    const svg = container
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(top10.map(d => d.genre))
      .padding(0.1);

    svg.append("g")
      .attr("transform", `translate(${0},${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-65)");

    // X-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top)
      .text("Number of artists")
      .style("fill", 'white')
      .style("font-size", "20px")

    const y = d3.scaleLinear()
      .domain([0, d3.max(top10, d => d.totalStreams)])
      .range([height, 0]);
  
    // Add the y-axis to the chart
    svg.append("g")
      .attr("transform", `translate(${0},0)`)
      .call(d3.axisLeft(y).tickFormat(d3.format(".1s")));

    // Y-axis label
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", -margin.top - height/2 )
      .text("Streams")
      .style("fill", 'white')
      .style("font-size", "20px");
    
    const z = d3.scaleSqrt()
      .domain([0, d3.max(top10, d => d.artistCount)])
      .range([5, 30]);
      
    svg.selectAll('.bubble')
      .data(reversed_top10)
      .enter().append('circle')
      .attr('class', 'bubble')
      .attr('cx', d => x(d.genre) + x.bandwidth() / 2)
      .attr('cy', d => y(d.totalStreams))
      .attr('r', d => z(d.artistCount))
      .style('fill', '#4c51bf')
      .style('opacity', '0.7')
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', .9);
        tooltip.html(`Genre: ${d.genre}<br/>Total Streams: ${d.totalStreams}<br/>Artist Count: ${d.artistCount}`)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', () => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
  }
}