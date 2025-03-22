import React, { useEffect, useState } from "react";

const Filters = ({ dataset, onApplyFilters }) => {
  const [filters, setFilters] = useState({ countries: [], cities: [] });
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(1960);

  useEffect(() => {
    const endpoint =
      dataset === "temperature"
        ? "http://127.0.0.1:8000/temperature-filters"
        : "http://127.0.0.1:8000/co2-filters";

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => setFilters(data));
  }, [dataset]);

  return (
    <div className="p-4 bg-gray-100 rounded-md shadow-md">
      <h2 className="text-lg font-bold">{dataset.toUpperCase()} Filters</h2>

      {/* Country Dropdown */}
      <label className="block text-sm font-medium">Country:</label>
      <select
        className="border p-2 w-full rounded"
        onChange={(e) => setCountry(e.target.value)}
      >
        <option>Select Country</option>
        {filters.countries.map((c) => (
          <option key={c}>{c}</option>
        ))}
      </select>

      {/* City Dropdown (Only for Temperature) */}
      {dataset === "temperature" && (
        <>
          <label className="block text-sm font-medium">City:</label>
          <select
            className="border p-2 w-full rounded"
            onChange={(e) => setCity(e.target.value)}
          >
            <option>Select City</option>
            {filters.cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </>
      )}

      {/* Apply Button */}
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() =>
          onApplyFilters({
            dataset,
            country,
            city,
            startYear,
            endYear,
          })
        }
      >
        Apply Filters
      </button>
    </div>
  );
};

export default Filters;
