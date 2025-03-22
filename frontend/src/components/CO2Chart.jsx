import React, { useState, useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import CO2Filters from "./CO2Filters";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CO2Chart = () => {
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
      `http://127.0.0.1:8000/filter?dataset=co2&country=${filters.country}&start_year=${filters.startYear}&end_year=${filters.endYear}`
    )
      .then((res) => res.json())
      .then((data) =>
        setChartData({
          labels: data.map((d) => d.year),
          datasets: [
            {
              label: "CO₂ Emissions (Metric Tons)",
              data: data.map((d) => d.co2_emissions),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
            },
          ],
        })
      );
  };

  return (
    <div>
      <CO2Filters onApplyFilters={fetchData} />
      {chartData && (
        <Line
          key={JSON.stringify(chartData)}
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toLocaleString()} metric tons`;
                  },
                },
              },
            },
            scales: {
              y: {
                title: { display: true, text: "CO₂ Emissions (Metric Tons)" },
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default CO2Chart;
