import * as d3 from 'https://cdn.skypack.dev/d3@7';

export const initializeDailyTrendChart = () => {
    d3.csv('./dataset/music.csv').then(rawData => {
  
        // 1. preprocess the data
        rawData.forEach(d => {
            d.date = new Date(d.date);
            d.streams = +d.streams; 
        });

        // 2. Initialize the dropdowns
        initializeDropdowns(rawData);

        // 3. Draw the initial chart
        drawDailyTrendChart(rawData, null, null);
    });
};

const initializeDropdowns = (data) => {

    console.log(data[0].year, data[0].country_fullname)

    // Extract unique years and countries
    const years = Array.from(new Set(data.map(d => d.date.getFullYear()))).sort((a, b) => a - b);
    const countries = Array.from(new Set(data.map(d => d.country_fullname))).sort();
  
    // Populate the year dropdown
    const yearSelect = d3.select('#year-select');
    yearSelect.selectAll('option')
      .data(years)
      .join('option')
      .text(d => d);
  
    // Populate the country dropdown
    const countrySelect = d3.select('#country-select');
    countrySelect.selectAll('option')
      .data(countries)
      .join('option')
      .text(d => d);

    // Set up change event listeners to update the chart based on selection
    yearSelect.on('change', () => {
        const selectedYear = yearSelect.property('value');
        const selectedCountry = countrySelect.property('value');
        drawDailyTrendChart(selectedYear, selectedCountry);
    });

    countrySelect.on('change', () => {
        const selectedYear = yearSelect.property('value');
        const selectedCountry = countrySelect.property('value');
        drawDailyTrendChart(selectedYear, selectedCountry);
    });
};

export const drawDailyTrendChart = async (selectedYear, selectedCountry) => {

    const rawData = await d3.csv('./dataset/music.csv');
    rawData.forEach(d => {
        d.date = new Date(d.date);
        d.streams = +d.streams;
    });

    const data = rawData.filter(d => {
        return (!selectedYear || d.date.getFullYear().toString() === selectedYear) &&
               (!selectedCountry || d.country === selectedCountry);
    });

    initializeDropdowns(data);

    // Set up the dimensions and margins for the chart
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear any existing svg
    d3.select('#daily-trend-chart svg').remove();
  
    // Append the SVG object to the body of the page and set its dimensions
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

    const barWidth = Math.max((width - margin.left - margin.right) / data.length - 1, 1); // Ensure a minimum bar width of 
  
    // Draw the bars for the bar chart
    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.streams))
      .attr("width", barWidth) 
      .attr("height", d => height - margin.bottom - y(d.streams))
      .attr("fill", "#4c51bf"); 
  
};