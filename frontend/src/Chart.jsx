import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CO2EmissionsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Improved UX with dropdown for countries
  const [country, setCountry] = useState("Brazil");
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(1960);

  const countries = ["Brazil", "United States", "India", "China", "Canada", "Australia", "Russia"]; // Example countries

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/filter?country=${country}&start_year=${startYear}&end_year=${endYear}`
      );
      const data = await response.json();

      const labels = data.map((item) => item.year);
      const temperatures = data.map((item) => item.temperature);

      setChartData({
        labels,
        datasets: [
          {
            label: "Average Temperature (°C)",
            data: temperatures,
            borderColor: "rgba(54, 162, 235, 1)",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-center mb-4 text-blue-600">Average Temperature Over Time</h2>

      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Country Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Country</label>
          <select
            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Start Year Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Year</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            min="1750"
            max="2025"
          />
        </div>

        {/* End Year Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">End Year</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-400"
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            min="1750"
            max="2025"
          />
        </div>
      </div>

      {/* Fetch Button */}
      <div className="text-center mb-4">
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          {loading ? "Loading..." : "Fetch Data"}
        </button>
      </div>

      {/* Chart Section */}
      {chartData ? (
        <Line data={chartData} />
      ) : (
        <p className="text-center text-gray-500">No data available. Select a range and fetch data.</p>
      )}
    </div>
  );
};

export default CO2EmissionsChart;
