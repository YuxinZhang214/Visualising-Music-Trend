import { DailyTrendChart } from './charts/DailyTrendChart.mjs';

document.addEventListener('DOMContentLoaded', () => {
  new DailyTrendChart('./dataset/music.csv');
});