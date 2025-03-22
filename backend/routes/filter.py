from fastapi import APIRouter, Query
from typing import List
from database import filter_temperature_data_multi, filter_co2_data

router = APIRouter()
@router.get("/filter")
def filter_data(
    dataset: str = Query(..., description="Choose dataset: 'temperature' or 'co2'"),
    countries: List[str] = Query(..., alias="country", description="Comma-separated list of country names"),
    city: str = Query(None, description="City name (only applicable for temperature when a single country is selected)"),
    start_year: int = Query(..., description="Start year (YYYY)"),
    end_year: int = Query(..., description="End year (YYYY)")
):
    # If only one element is present and it contains commas, split it into multiple values.
    if len(countries) == 1 and "," in countries[0]:
        countries = [c.strip() for c in countries[0].split(",")]
    
    if dataset == "temperature":
        return filter_temperature_data_multi(countries, start_year, end_year, city)
    elif dataset == "co2":
        return filter_co2_data(countries, start_year, end_year)
    return {"error": "Invalid dataset. Choose 'temperature' or 'co2'"}
