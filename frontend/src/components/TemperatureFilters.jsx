import React, { useEffect, useState } from "react";

const TemperatureFilters = ({ onApplyFilters }) => {
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(1960);

  // Fetch countries on component mount
  useEffect(() => {
    fetch("http://127.0.0.1:8000/temperature-filters")
      .then((res) => res.json())
      .then((data) => {
        setCountries(data.countries);
      });
  }, []);

  // Fetch cities when a country is selected
  useEffect(() => {
    if (country) {
      fetch(`http://127.0.0.1:8000/cities-for-country?country=${country}`)
        .then((res) => res.json())
        .then((data) => setCities(data.cities));
    } else {
      setCities([]); // Reset cities if no country is selected
      setCity(""); // Clear selected city
    }
  }, [country]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Temperature Filters</h2>

      {/* Country Dropdown */}
      <label className="block text-sm font-medium">Country:</label>
      <select
        className="border p-2 w-full rounded"
        value={country}
        onChange={(e) => {
          setCountry(e.target.value);
          setCity(""); // Reset city when country changes
        }}
      >
        <option value="">Select Country</option>
        {countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* City Dropdown (Optional) */}
      <label className="block text-sm font-medium mt-2">City (Optional):</label>
      <select
        className="border p-2 w-full rounded"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        disabled={!cities.length} // Disable if no cities are available
      >
        <option value="">Select City</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
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
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
        onClick={() => onApplyFilters({ country, city, startYear, endYear })}
      >
        Apply Filters
      </button>
    </div>
  );
};

export default TemperatureFilters;
