
import { useEffect, useState, useRef } from "react"
import { Search, X, Check, ChevronDown, ChevronUp } from "lucide-react"

const CO2Filters = ({ onApplyFilters }) => {
  const [allCountries, setAllCountries] = useState([])
  const [selectedCountries, setSelectedCountries] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [startYear, setStartYear] = useState(1950)
  const [endYear, setEndYear] = useState(1960)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    fetch("http://127.0.0.1:8000/co2-filters")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch countries")
        }
        return res.json()
      })
      .then((data) => {
        setAllCountries(data.countries)
        setLoading(false)
        setError(null)
      })
      .catch((err) => {
        setError("Failed to load countries. Please try again.")
        setLoading(false)
      })
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const toggleCountry = (country) => {
    setSelectedCountries((prev) => (prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]))
  }

  const selectAllCountries = () => {
    setSelectedCountries(allCountries)
  }

  const clearAllCountries = () => {
    setSelectedCountries([])
  }

  const filteredCountries = allCountries.filter((country) => country.toLowerCase().includes(searchQuery.toLowerCase()))

  const removeCountry = (country) => {
    setSelectedCountries(selectedCountries.filter((c) => c !== country))
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>}

      <div className="relative" ref={dropdownRef}>
        <label htmlFor="countries" className="block text-sm font-medium text-gray-700 mb-1">
          Countries
        </label>

        {loading ? (
          <div className="animate-pulse h-10 bg-gray-200 rounded w-full"></div>
        ) : (
          <>
            {/* Selected countries display */}
            <div
              className="flex flex-wrap gap-2 min-h-[42px] p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-red-500 focus-within:border-red-500 bg-white cursor-pointer"
              onClick={() => setIsDropdownOpen(true)}
            >
              {selectedCountries.length === 0 && (
                <div className="text-gray-500 text-sm py-0.5">Select countries...</div>
              )}

              {selectedCountries.map((country) => (
                <div
                  key={country}
                  className="flex items-center bg-red-50 text-red-700 text-sm px-2 py-0.5 rounded-full"
                >
                  <span className="mr-1">{country}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeCountry(country)
                    }}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                <div className="sticky top-0 z-10 bg-white p-2 border-b">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        selectAllCountries()
                      }}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearAllCountries()
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="py-1">
                  {filteredCountries.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500">No countries found</div>
                  ) : (
                    filteredCountries.map((country) => (
                      <div
                        key={country}
                        className={`flex items-center px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          selectedCountries.includes(country) ? "bg-red-50" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCountry(country)
                        }}
                      >
                        <div
                          className={`flex-shrink-0 h-4 w-4 border rounded mr-2 flex items-center justify-center ${
                            selectedCountries.includes(country) ? "bg-red-600 border-red-600" : "border-gray-300"
                          }`}
                        >
                          {selectedCountries.includes(country) && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className="ml-2 truncate">{country}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Dropdown toggle button */}
            <button
              type="button"
              className="absolute inset-y-0 right-0 mt-6 flex items-center pr-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {isDropdownOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </>
        )}

        {/* Selected count indicator */}
        {selectedCountries.length > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            {selectedCountries.length} {selectedCountries.length === 1 ? "country" : "countries"} selected
          </div>
        )}
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
          />
          {Number(endYear) <= Number(startYear) && (
            <p className="mt-1 text-xs text-red-500">End year must be greater than start year</p>
          )}
        </div>
      </div>

      <div>
        <button
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onApplyFilters({ countries: selectedCountries, startYear, endYear })}
          disabled={loading || selectedCountries.length === 0 || Number(endYear) <= Number(startYear)}
        >
          {loading ? (
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
    </div>
  )
}

export default CO2Filters

