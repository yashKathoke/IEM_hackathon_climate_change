import React, { useEffect, useState } from "react";

const CO2Filters = ({ onApplyFilters }) => {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("");
  const [startYear, setStartYear] = useState(1950);
  const [endYear, setEndYear] = useState(1960);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/co2-filters")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch countries");
        }
        return res.json();
      })
      .then((data) => {
        setCountries(data.countries);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError("Failed to load countries. Please try again.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        {loading ? (
          <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>
        ) : (
          <select
            id="country"
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
            Start Year
          </label>
          <input
            type="number"
            id="startYear"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
            End Year
          </label>
          <input
            type="number"
            id="endYear"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
          />
        </div>
      </div>

      <div>
        <button
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onApplyFilters({ country, startYear, endYear })}
          disabled={loading || !country}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            'Apply Filters'
          )}
        </button>
      </div>
    </div>
  );
};

export default CO2Filters;
