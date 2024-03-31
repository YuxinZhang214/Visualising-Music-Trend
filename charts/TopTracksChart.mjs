export class TopTracksChart {

    constructor(rawData, chartId) {
      this.rawData = rawData;
      this.chartId = chartId;
    //   this.loadData();
    }
  
    // async loadData() {
    //   this.processData();
    //   this.drawChart();
    // }
  
    // processData(rawData) {
    //     this.rawData.forEach(d => {
    //         d.date = new Date(d.date);
    //         d.streams = +d.streams;
    //     });
    // }

    // filterData(selectedYear) {
    //     return this.rawData.filter(d => {
    //       return (!selectedYear || d.date.getFullYear().toString() === selectedYear)
    //     });
    // }
  
    // drawChart() {
    //     const selectedYear = d3.select('#year-select').property('value') === 'All' ? null : d3.select('#year-select').property('value');
    //     const selectedCountry = d3.select('#country-select').property('value') === 'All' ? null : d3.select('#country-select').property('value');
    //     const filteredData = this.filterData(selectedYear);
    //     this.renderChart(filteredData, selectedYear, selectedCountry);
    // }

    renderChart(data, selectedYear, selectedCountry) {

        const container = d3.select(`#top-tracks-chart`);
        const containerRect = container.node().getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Setup dimensions and margins
        const margin = { top: 30, right: 50, bottom: 50, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = containerHeight - margin.top - margin.bottom;
    
        // Clear existing svg
        container.remove();
    
        const svg = container
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);
    
        // Set up the x scale
        const x = d3.scaleTime()
          .domain(d3.extent(data, d => d.date)) // Use the extent of the date data as the domain
          .range([margin.left, width - margin.right]);
      
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