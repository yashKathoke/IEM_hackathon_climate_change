import React from "react";
import TemperatureChart from "./components/TemperatureChart";
import CO2Chart from "./components/CO2Chart";

const App = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-2">

      <TemperatureChart />
      <CO2Chart />
      </div>
    </div>
  );
};

export default App;
