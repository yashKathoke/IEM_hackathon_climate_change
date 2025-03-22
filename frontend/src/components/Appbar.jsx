"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Menu, X, BarChart2, Thermometer } from "lucide-react"

const AppBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-red-600 font-bold text-xl">Climate Data</span>
            </div>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                location.pathname === "/"
                  ? "border-red-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              CO2 Data
            </Link>
            <Link
              to="/temp"
              className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                location.pathname === "/temp"
                  ? "border-red-500 text-gray-900"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Thermometer className="mr-2 h-4 w-4" />
              Temperature Data
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
              aria-expanded="false"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`flex items-center ${
                location.pathname === "/"
                  ? "bg-red-50 border-l-4 border-red-500 text-red-700"
                  : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } pl-3 pr-4 py-2 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BarChart2 className="mr-3 h-5 w-5" />
              CO2 Data
            </Link>
            <Link
              to="/temp"
              className={`flex items-center ${
                location.pathname === "/temp"
                  ? "bg-red-50 border-l-4 border-red-500 text-red-700"
                  : "border-l-4 border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } pl-3 pr-4 py-2 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Thermometer className="mr-3 h-5 w-5" />
              Temperature Data
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default AppBar

