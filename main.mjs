import { ChartController } from './charts/controller/ChartController.mjs';

import { DailyTrendChart } from './charts/DailyTrendChart.mjs';
import { TopTracksChart } from './charts/TopTracksChart.mjs';
import { TopArtistsChart } from './charts/TopArtistsChart.mjs';
import { GenreAnalysis } from './charts/GenreAnalyis.mjs';

document.addEventListener('DOMContentLoaded', async () => {
  const controller = new ChartController('./dataset/music.csv');
  
  await controller.loadAndPrepareData();

  // Instantiate charts without passing filteredData directly
  const dailyTrendChart = new DailyTrendChart('daily-trend-chart');
  const topTracksChart = new TopTracksChart('top-tracks-chart');
  const topArtistsChart = new TopArtistsChart('top-artists-chart');
  const GenreAnalysisChart = new GenreAnalysis('genre-analysis')

  // Register charts with the controller
  controller.registerChart(dailyTrendChart);
  controller.registerChart(topTracksChart);
  controller.registerChart(topArtistsChart);
  controller.registerChart(GenreAnalysisChart);

  controller.updateCharts(); 
});
