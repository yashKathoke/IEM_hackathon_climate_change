import React, { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import TemperatureFilters from "./TemperatureFilters";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TemperatureChart = () => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);
  useEffect(() => {
    return () => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }
    };
}, []);

  const fetchData = (filters) => {
    fetch(
      `http://127.0.0.1:8000/filter?dataset=temperature&country=${filters.country}&city=${filters.city}&start_year=${filters.startYear}&end_year=${filters.endYear}`
    )
      .then((res) => res.json())
      .then((data) =>
        setChartData({
          labels: data.map((d) => d.year),
          datasets: [
            {
              label: "Average Temperature",
              data: data.map((d) => d.temperature),
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
            },
          ],
        })
      );
  };

  return (
    <div>
      <TemperatureFilters onApplyFilters={fetchData} />
      {chartData && <Line key={JSON.stringify(chartData)} data={chartData} />}
    </div>
  );
};

export default TemperatureChart;
