import { BrowserRouter, Routes, Route } from "react-router-dom"
import AppBar from "./components/Appbar"
import TemperatureSummary from "./components/TemperatureSummary"
import CO2Chart from "./components/CO2Summary"

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppBar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/" element={<CO2Chart />} />
              <Route path="/temp" element={<TemperatureSummary />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

