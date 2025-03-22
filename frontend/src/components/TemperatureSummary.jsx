import React, { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import TemperatureFilters from "./TemperatureFilters";
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TemperatureCombined = () => {
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const fetchData = (filters) => {
    if (!filters.country) {
      setError("Please select a country");
      return;
    }

    setChartLoading(true);
    setChartData(null);
    setError(null);

    const queryParams = new URLSearchParams({
      dataset: "temperature",
      country: filters.country,
      start_year: filters.startYear,
      end_year: filters.endYear,
    });

    if (filters.city) {
      queryParams.append("city", filters.city);
    }

    fetch(`http://127.0.0.1:8000/filter?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch temperature data");
        }
        return res.json();
      })
      .then((data) => {
        if (data.length === 0) {
          setError("No data available for the selected filters");
          setChartLoading(false);
          return;
        }

        setChartData({
          labels: data.map((d) => d.year),
          datasets: [
            {
              label: "Average Temperature (°C)",
              data: data.map((d) => d.temperature),
              borderColor: "rgb(239, 68, 68)",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              borderWidth: 2,
              tension: 0.3,
              pointBackgroundColor: "rgb(239, 68, 68)",
              pointBorderColor: "#fff",
              pointRadius: 4,
              pointHoverRadius: 6,
              fill: true,
            },
          ],
        });
        setChartLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setChartLoading(false);
      });
  };

  const fetchSummary = (filters) => {
    if (!filters.country) return;

    setLoading(true);
    setSummary("");

    const queryParams = new URLSearchParams({
      country: filters.country,
      start_year: filters.startYear,
      end_year: filters.endYear,
    });

    if (filters.city) {
      queryParams.append("city", filters.city);
    }

    fetch(`http://127.0.0.1:8000/temperature-summary?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch summary");
        }
        return res.json();
      })
      .then((data) => {
        setSummary(data.error ? data.error : data.summary);
        setLoading(false);
      })
      .catch((err) => {
        setSummary("An error occurred while fetching the summary.");
        setLoading(false);
      });
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    fetchData(filters);
    fetchSummary(filters);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(17, 24, 39, 0.8)",
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(1)}°C`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Temperature (°C)",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 500,
          },
        },
        grid: {
          color: "rgba(156, 163, 175, 0.15)",
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
          callback: (value) => {
            return `${value}°C`;
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11,
          },
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
    elements: {
      point: {
        hoverBorderWidth: 2,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Temperature Analysis Dashboard</h1>
        <p className="text-gray-600">Analyze historical temperature data by country, city, and time period</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
        <TemperatureFilters onApplyFilters={handleApplyFilters} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Temperature Trends</h2>

          {activeFilters && (
            <div className="mb-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Country: {activeFilters.country}
              </span>
              {activeFilters.city && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  City: {activeFilters.city}
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Period: {activeFilters.startYear} - {activeFilters.endYear}
              </span>
            </div>
          )}

          <div className="relative h-[400px]">
            {chartLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mb-2"></div>
                  <span className="text-sm text-gray-600">Loading temperature data...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100 max-w-md">
                  <svg
                    className="w-12 h-12 text-red-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
                  <p className="mt-3 text-sm text-red-600">Please try adjusting your filters or try again later.</p>
                </div>
              </div>
            )}

            {!chartData && !chartLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center p-6">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Data to Display</h3>
                  <p className="text-gray-600">Use the filters above to select a country, city, and time period</p>
                </div>
              </div>
            )}

            {chartData && (
              <div className="h-full w-full transition-opacity duration-300 ease-in-out">
                <Line key={JSON.stringify(chartData)} data={chartData} options={chartOptions} ref={chartRef} />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Temperature Summary</h2>

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
                xmlns="http://www.w3.org/2000/svg"
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
              <p className="text-gray-800 leading-relaxed">{summary}</p>

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
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-700">
                        Data shown for {activeFilters.country}
                        {activeFilters.city ? `, ${activeFilters.city}` : ""} from {activeFilters.startYear} to{" "}
                        {activeFilters.endYear}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <svg
                        className="h-5 w-5 text-red-500 mr-2 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-700">Temperatures are measured in degrees Celsius (°C)</span>
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
                    fetchSummary(activeFilters);
                  }
                }}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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

export default TemperatureCombined;
