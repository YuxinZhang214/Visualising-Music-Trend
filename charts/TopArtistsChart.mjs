export class TopArtistsChart {
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
    //     // Process data (to be overridden by subclasses)
    // }

    // filterData(selectedYear) {
    //     return this.rawData.filter(d => {
    //       return (!selectedYear || d.date.getFullYear().toString() === selectedYear)
    //     });
    // }

    // drawChart() {
    //     const selectedYear = d3.select('#year-select').property('value') === 'All' ? null : d3.select('#year-select').property('value');
    //     // Do the same for country
    //     const selectedCountry = d3.select('#country-select').property('value') === 'All' ? null : d3.select('#country-select').property('value');
    //     const filteredData = this.filterData(selectedYear);
    //     this.renderChart(filteredData, selectedYear, selectedCountry);
    //   }

  
  
  }