import { useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import CO2Filters from "./CO2Filters";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CO2Chart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);
  const [summary, setSummary] = useState("");
  const chartRef = useRef(null);

  const processData = (data, filters) => {
    try {
      // 1. Group data by country → { countryName: { [year]: emissions } }
      const groupedByCountry = {};
      data.forEach((record) => {
        const { Country, year, co2_emissions } = record;
        if (!groupedByCountry[Country]) {
          groupedByCountry[Country] = {};
        }
        groupedByCountry[Country][year] = co2_emissions;
      });
  
      // 2. Filter to only include countries from filters with sufficient data
      const filteredCountries = {};
      const start = Number.parseInt(filters.startYear, 10);
      const end = Number.parseInt(filters.endYear, 10);
      filters.countries.forEach((c) => {
        if (groupedByCountry[c]) {
          const countryData = groupedByCountry[c];
          // Count how many years have actual data
          const dataPoints = Object.keys(countryData).filter(
            (year) => year >= start && year <= end && countryData[year] !== undefined
          ).length;
          // Only include if there's at least some data (e.g., 2+ points)
          if (dataPoints > 1) {
            filteredCountries[c] = countryData;
          } else {
            console.warn(`Skipping ${c}: insufficient data points (${dataPoints})`);
          }
        } else {
          console.warn(`No data found for ${c} in the selected range`);
        }
      });
  
      if (Object.keys(filteredCountries).length === 0) {
        console.error("No valid data to display after filtering");
        setError("No sufficient data available for the selected countries and period.");
        return null;
      }
  
      // 3. Create an array of years for the x-axis
      const years = [];
      for (let y = start; y <= end; y++) {
        years.push(y);
      }
  
      // 4. Define a color palette for multiple lines
      const colors = [
        "rgb(239, 68, 68)",
        "rgb(59, 130, 246)",
        "rgb(16, 185, 129)",
        "rgb(245, 158, 11)",
        "rgb(139, 92, 246)",
        "rgb(236, 72, 153)",
        "rgb(14, 165, 233)",
        "rgb(168, 85, 247)",
      ];
  
      // 5. Build datasets (one per country)
      const datasets = Object.keys(filteredCountries).map((country, index) => {
        const color = colors[index % colors.length];
        const countryData = filteredCountries[country];
        // Only include years with actual data, null for missing years
        const dataPoints = years.map((year) => 
          countryData[year] !== undefined ? countryData[year] : null
        );
  
        console.log(`${country} data:`, dataPoints); // Debug log
  
        return {
          label: country,
          data: dataPoints,
          borderColor: color,
          backgroundColor: color.replace("rgb", "rgba").replace(")", ", 0.1)"),
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false, // Disable fill to avoid misleading visuals
          spanGaps: true, // Connect lines across gaps (null values)
        };
      });
  
      return { labels: years, datasets };
    } catch (err) {
      console.error("Error processing data:", err);
      setError("Failed to process chart data.");
      return null;
    }
  };

  const generateSummary = (data, filters) => {
    try {
      const countryStats = {};

      filters.countries.forEach((country) => {
        const countryData = data.filter(
          (d) => d.Country === country && d.year >= filters.startYear && d.year <= filters.endYear,
        );
        if (countryData.length > 0) {
          const emissionsArr = countryData.map((d) => d.co2_emissions);
          const minEmission = Math.min(...emissionsArr);
          const maxEmission = Math.max(...emissionsArr);

          const minYear = countryData.find((d) => d.co2_emissions === minEmission)?.year;
          const maxYear = countryData.find((d) => d.co2_emissions === maxEmission)?.year;

          const earliestYear = Math.min(...countryData.map((d) => d.year));
          const latestYear = Math.max(...countryData.map((d) => d.year));
          const earliestVal = countryData.find((d) => d.year === earliestYear)?.co2_emissions || 0;
          const latestVal = countryData.find((d) => d.year === latestYear)?.co2_emissions || 0;
          const growthPercent = earliestVal > 0
            ? (((latestVal - earliestVal) / earliestVal) * 100).toFixed(1)
            : 0;

          countryStats[country] = {
            minEmission,
            maxEmission,
            minYear,
            maxYear,
            growthPercent,
            earliestYear,
            latestYear,
          };
        }
      });

      let summaryText = `Analysis of CO₂ emissions from ${filters.startYear} to ${filters.endYear}:\n\n`;
      Object.keys(countryStats).forEach((country) => {
        const s = countryStats[country];
        summaryText += `${country}: `;
        if (s.growthPercent > 0) {
          summaryText += `Emissions grew by ${s.growthPercent}% between ${s.earliestYear} and ${s.latestYear}. `;
        } else if (s.growthPercent < 0) {
          summaryText += `Emissions decreased by ${Math.abs(s.growthPercent)}% between ${s.earliestYear} and ${s.latestYear}. `;
        } else {
          summaryText += `Emissions stayed roughly the same between ${s.earliestYear} and ${s.latestYear}. `;
        }
        summaryText += `Peak emissions of ${s.maxEmission.toLocaleString()} metric tons occurred in ${s.maxYear}.\n\n`;
      });

      setSummary(summaryText);
    } catch (err) {
      console.error("Error generating summary:", err);
      setSummary("Unable to generate summary from the available data.");
    }
  };

  const fetchData = async (filters) => {
    setLoading(true);
    setError(null);
    setSummary("");

    try {
      const countriesParam = filters.countries.join(",");
      const dataQuery = new URLSearchParams({
        dataset: "co2",
        country: countriesParam,
        start_year: filters.startYear,
        end_year: filters.endYear,
      });

      const dataRes = await fetch(`http://127.0.0.1:8000/filter?${dataQuery.toString()}`);
      if (!dataRes.ok) throw new Error(`Failed to fetch CO2 data: ${dataRes.status}`);
      const dataJson = await dataRes.json();

      const processed = processData(dataJson, filters);
      setChartData(processed);

      const summaryQuery = new URLSearchParams({
        country: countriesParam,
        start_year: filters.startYear,
        end_year: filters.endYear,
      });

      try {
        const summaryRes = await fetch(`http://127.0.0.1:8000/co2-summary?${summaryQuery.toString()}`);
        if (summaryRes.ok) {
          const summaryJson = await summaryRes.json();
          if (summaryJson.summary) {
            setSummary(summaryJson.summary);
          } else {
            generateSummary(dataJson, filters);
          }
        } else {
          generateSummary(dataJson, filters);
        }
      } catch (summaryErr) {
        console.error("Error fetching AI summary:", summaryErr);
        generateSummary(dataJson, filters);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    fetchData(filters);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { family: "'Inter', sans-serif", size: 12 },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleFont: { family: "'Inter', sans-serif", size: 14 },
        bodyFont: { family: "'Inter', sans-serif", size: 13 },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toLocaleString()} metric tons`,
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "CO₂ Emissions (Metric Tons)",
          font: { family: "'Inter', sans-serif", size: 12, weight: 500 },
        },
        grid: { color: "rgba(156, 163, 175, 0.15)" },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
          callback: (value) => value.toLocaleString(),
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { family: "'Inter', sans-serif", size: 11 },
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          CO₂ Emissions Dashboard
        </h1>
        <p className="text-gray-600">
          Analyze historical carbon dioxide emissions data by country and time period
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
        <CO2Filters onApplyFilters={handleApplyFilters} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">CO₂ Emissions Trend</h2>

          {activeFilters && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Countries: {activeFilters.countries.join(", ")}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Period: {activeFilters.startYear} - {activeFilters.endYear}
              </span>
            </div>
          )}

          <div className="relative h-[400px]">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-2"></div>
                  <span className="text-sm text-gray-600">Loading chart data...</span>
                </div>
              </div>
            )}

            {error && !chartData && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100 max-w-md">
                  <svg
                    className="w-12 h-12 text-red-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Data</h3>
                  <p className="text-red-600">{error}</p>
                  <p className="mt-3 text-sm text-red-600">
                    Please try adjusting your filters or try again later.
                  </p>
                </div>
              </div>
            )}

            {!chartData && !loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center p-6">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Data to Display</h3>
                  <p className="text-gray-600">
                    Use the filters above to select countries and a time period
                  </p>
                </div>
              </div>
            )}

            {chartData && (
              <div className="h-full w-full transition-opacity duration-300 ease-in-out">
                <Line
                  key={JSON.stringify(chartData)}
                  data={chartData}
                  options={chartOptions}
                  ref={chartRef}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">CO₂ Emissions Summary</h2>

          {loading && (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          )}

          {!loading && !summary && !activeFilters && (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg
                className="w-10 h-10 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <p className="text-gray-600">Select filters to view a summary</p>
            </div>
          )}

          {!loading && summary && (
            <div className="mt-2 p-4 rounded-lg bg-red-50 border border-red-100 transition-all duration-300 ease-in-out">
              <p className="text-gray-800 leading-relaxed whitespace-pre-line">{summary}</p>

              {activeFilters && (
                <div className="mt-4 pt-4 border-t border-red-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Key Insights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-700">
                        Data shown for {activeFilters.countries.length}{" "}
                        {activeFilters.countries.length === 1 ? "country" : "countries"} from{" "}
                        {activeFilters.startYear} to {activeFilters.endYear}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-700">
                        Emissions are measured in metric tons of CO₂
                      </span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {!loading && activeFilters && (
            <div className="mt-6">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ease-in-out w-full justify-center"
                onClick={() => {
                  if (activeFilters) {
                    fetchData(activeFilters);
                  }
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                Refresh Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CO2Chart;