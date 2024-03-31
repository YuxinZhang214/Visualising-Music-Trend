import * as d3 from 'https://cdn.skypack.dev/d3@7';

export class DailyTrendChart {

  constructor(datasetPath) {
    this.datasetPath = datasetPath;
    this.initChart();
  }

  async initChart() {
    const rawData = await d3.csv(this.datasetPath);
    this.processData(rawData);
    this.initializeDropdowns();
    this.drawChart();
  }

  processData(rawData) {
    rawData.forEach(d => {
      d.date = new Date(d.date);
      d.streams = +d.streams;
    });
    this.rawData = rawData;
    this.years = Array.from(new Set(rawData.map(d => d.date.getFullYear()))).sort((a, b) => a - b);
    this.countries = Array.from(new Set(rawData.map(d => d.country_fullname))).sort();
  }

  initializeDropdowns() {
    // Year Dropdown
    const yearSelect = d3.select('#year-select');
    yearSelect.selectAll('option')
      .data(['All', ...this.years])
      .join('option')
      .text(d => d);

    // Country Dropdown
    const countrySelect = d3.select('#country-select');
    countrySelect.selectAll('option')
      .data(['All', ...this.countries]) 
      .join('option')
      .text(d => d);

    // yearSelect.property('value', this.years[0]);
    // countrySelect.property('value', this.countries[0]);

    yearSelect.on('change', () => this.drawChart());
    countrySelect.on('change', () => this.drawChart());
  }

  drawChart() {
    const selectedYear = d3.select('#year-select').property('value') === 'All' ? null : d3.select('#year-select').property('value');
    // Do the same for country
    const selectedCountry = d3.select('#country-select').property('value') === 'All' ? null : d3.select('#country-select').property('value');
    const filteredData = this.filterData(selectedYear);
    this.renderChart(filteredData, selectedYear, selectedCountry);
  }

  filterData(selectedYear) {
    return this.rawData.filter(d => {
      return (!selectedYear || d.date.getFullYear().toString() === selectedYear)
    });
  }

  renderChart(data, selectedYear, selectedCountry) {

    const container = d3.select('#daily-trend-chart');
    const containerWidth = container.node().getBoundingClientRect().width;
    
    // Setup dimensions and margins
    const margin = { top: 20, right: 50, bottom: 30, left: 50 };
    const width = containerWidth - margin.left - margin.right;
    const height = Math.min(500, width * 0.4) - margin.top - margin.bottom;

    console.log(containerWidth, width,height)

    // Clear existing svg
    d3.select('#daily-trend-chart svg').remove();

    const svg = d3.select('#daily-trend-chart')
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
  
    // Add the y-axis to the chart
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    const barWidth = Math.max((width - margin.left - margin.right) / data.length - 1, 1);

    console.log(selectedYear,selectedCountry)
  
    // Draw the bars for the bar chart
    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.streams))
      .attr("width", barWidth)
      .attr("height", d => height - margin.bottom - y(d.streams))
      .attr("fill", d => {
        if ((!selectedYear && !selectedCountry) ||
            (selectedYear === d.date.getFullYear().toString() && (!selectedCountry || selectedCountry === d.country_fullname))) {
          return "#4c51bf"; 
        } else {
          return "#d1d5db";
        }
      })
      .on("click", d => {
        // window.location.href = `/song-details-page?date=${d.date.toISOString()}&country=${encodeURIComponent(d.country_fullname)}`;
    })
  }
}