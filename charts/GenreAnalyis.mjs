export class GenreAnalysis {
    constructor(rawData, chartId) {
      this.rawData = rawData;
      this.chartId = chartId;
      this.loadData();
    }
  
    async loadData() {
      this.processData();
      this.initializeDropdowns();
      this.drawChart();
    }
  
    processData() {
      // Process data (to be overridden by subclasses)
    }
  
    initializeDropdowns() {
      // Initialize dropdowns (if needed, can be overridden by subclasses)
    }
  
    drawChart() {
      // Draw the chart (to be implemented by subclasses)
    }
  }