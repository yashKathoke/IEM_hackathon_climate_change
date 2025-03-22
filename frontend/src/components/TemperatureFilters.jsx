"use client"

import { useEffect, useState } from "react"

const TemperatureFilters = ({ onApplyFilters }) => {
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [startYear, setStartYear] = useState(1950)
  const [endYear, setEndYear] = useState(1960)
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingCities, setLoadingCities] = useState(false)
  const [error, setError] = useState(null)

  // Fetch countries on component mount
  useEffect(() => {
    setLoadingCountries(true)
    fetch("http://127.0.0.1:8000/temperature-filters")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch countries")
        }
        return res.json()
      })
      .then((data) => {
        setCountries(data.countries)
        setLoadingCountries(false)
        setError(null)
      })
      .catch((err) => {
        setError("Failed to load countries. Please try again.")
        setLoadingCountries(false)
      })
  }, [])

  // Fetch cities when a country is selected
  useEffect(() => {
    if (country) {
      setLoadingCities(true)
      setCities([])
      fetch(`http://127.0.0.1:8000/cities-for-country?country=${country}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch cities")
          }
          return res.json()
        })
        .then((data) => {
          setCities(data.cities)
          setLoadingCities(false)
          setError(null)
        })
        .catch((err) => {
          setError("Failed to load cities. Please try again.")
          setLoadingCities(false)
        })
    } else {
      setCities([]) // Reset cities if no country is selected
      setCity("") // Clear selected city
    }
  }, [country])

  const handleSubmit = (e) => {
    e.preventDefault()
    onApplyFilters({ country, city, startYear, endYear })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country
          </label>
          {loadingCountries ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>
          ) : (
            <div className="relative">
              <select
                id="country"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value)
                  setCity("") // Reset city when country changes
                }}
                required
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {country && loadingCities && (
                <div className="absolute right-2 top-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City (Optional)
          </label>
          <select
            id="city"
            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={!country || loadingCities || cities.length === 0}
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {loadingCities && <p className="mt-1 text-xs text-gray-500">Loading cities...</p>}
          {!loadingCities && country && cities.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">No cities available for this country</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-1">
            Start Year
          </label>
          <input
            type="number"
            id="startYear"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            min="1900"
            max="2023"
            required
          />
        </div>

        <div>
          <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-1">
            End Year
          </label>
          <input
            type="number"
            id="endYear"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            min="1900"
            max="2023"
            required
          />
          {Number.parseInt(endYear) <= Number.parseInt(startYear) && (
            <p className="mt-1 text-xs text-red-500">End year must be greater than start year</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            loadingCountries || loadingCities || !country || Number.parseInt(endYear) <= Number.parseInt(startYear)
          }
        >
          {loadingCountries || loadingCities ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </>
          ) : (
            "Apply Filters"
          )}
        </button>
      </div>
    </form>
  )
}

export default TemperatureFilters

