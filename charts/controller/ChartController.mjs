export class ChartController {

    constructor(datasetPath) {
      this.datasetPath = datasetPath;
      this.charts = []; 
    }
  
    async loadAndPrepareData() {
      const rawData = await d3.csv(this.datasetPath);
      this.rawData = rawData.map(d => ({
        ...d,
        date: new Date(d.date),
        streams: +d.streams,
      }));
      this.years = Array.from(new Set(this.rawData.map(d => d.date.getFullYear()))).sort((a, b) => a - b);
      this.countries = Array.from(new Set(this.rawData.map(d => d.country_fullname))).sort();

      this.initializeDropdowns(); // Corrected call
    }

    initializeDropdowns() {
        // Initialize year and country dropdowns
        const yearSelect = d3.select('#year-select');
        yearSelect.selectAll('option')
          .data(['All', ...this.years])
          .enter()
          .append('option')
          .text(d => d);
    
        const countrySelect = d3.select('#country-select');
        countrySelect.selectAll('option')
          .data(['All', ...this.countries])
          .enter()
          .append('option')
          .text(d => d);
    
        yearSelect.on('change', () => this.updateCharts());
        countrySelect.on('change', () => this.updateCharts());
    }
  
    filterData(year, country) {
        // Filter the data based on year and country
        return this.rawData.filter(d => {
          return (!year || year === 'All' || d.date.getFullYear().toString() === year) &&
                 (!country || country === 'All' || d.country_fullname === country);
        });
    }

    registerChart(chartInstance) {
        // Add a chart instance to the controller
        this.charts.push(chartInstance);
    }

    updateCharts() {
        // Get current selections from dropdowns
        const selectedYear = d3.select('#year-select').property('value');
        const selectedCountry = d3.select('#country-select').property('value');
        const filteredData = this.filterData(selectedYear, selectedCountry);
        
        // Update each registered chart with the filtered data
        this.charts.forEach(chart => chart.drawChart(filteredData));
    }
}