import React, { useEffect, useState } from "react";

const CO2Filters = ({ onApplyFilters }) => {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(1960);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/co2-filters")
      .then((res) => res.json())
      .then((data) => setCountries(data.countries));
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">CO₂ Filters</h2>

      {/* Country Dropdown */}
      <label className="block text-sm font-medium">Country:</label>
      <select
        className="border p-2 w-full rounded"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="">Select Country</option>
        {countries.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {/* Year Inputs */}
      <div className="flex space-x-2 mt-2">
        <input
          type="number"
          className="border p-2 w-full rounded"
          placeholder="Start Year"
          value={startYear}
          onChange={(e) => setStartYear(e.target.value)}
        />
        <input
          type="number"
          className="border p-2 w-full rounded"
          placeholder="End Year"
          value={endYear}
          onChange={(e) => setEndYear(e.target.value)}
        />
      </div>

      <button
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full"
        onClick={() => onApplyFilters({ country, startYear, endYear })}
      >
        Apply Filters
      </button>
    </div>
  );
};

export default CO2Filters;
